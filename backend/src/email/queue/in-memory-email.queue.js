const logger = require("../../utils/logger");

class InMemoryEmailQueue {
  constructor({ worker, retries = 3, retryDelayMs = 1000 } = {}) {
    this.worker = worker;
    this.retries = retries;
    this.retryDelayMs = retryDelayMs;
    this.pending = [];
    this.processing = false;
    this.dedupe = new Map();
  }

  enqueue(job) {
    if (job.dedupeKey) {
      const existing = this.dedupe.get(job.dedupeKey);
      if (existing && Date.now() - existing < 60 * 60 * 1000) {
        return { queued: false, deduped: true };
      }
      this.dedupe.set(job.dedupeKey, Date.now());
    }

    this.pending.push({ ...job, attempts: 0 });
    setImmediate(() => this.process());
    return { queued: true, deduped: false };
  }

  size() {
    return this.pending.length;
  }

  async process() {
    if (this.processing || !this.worker) return;
    this.processing = true;

    while (this.pending.length) {
      const job = this.pending.shift();
      try {
        job.attempts += 1;
        await this.worker(job);
      } catch (error) {
        if (job.attempts < this.retries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelayMs * job.attempts));
          this.pending.unshift(job);
        } else {
          logger.error(`Email delivery failed after ${job.attempts} attempts: ${error.message}`);
        }
      }
    }

    this.processing = false;
  }
}

module.exports = InMemoryEmailQueue;
