const nodemailer = require("nodemailer");

class NodemailerProvider {
  constructor({ smtp, from }) {
    this.smtp = smtp;
    this.from = from;
    this.transporter = null;
  }

  isConfigured() {
    return Boolean(this.smtp.host && this.smtp.user && this.smtp.pass);
  }

  getTransporter() {
    if (!this.isConfigured()) {
      throw new Error("SMTP is not configured");
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.smtp.host,
        port: this.smtp.port,
        secure: this.smtp.port === 465,
        auth: {
          user: this.smtp.user,
          pass: this.smtp.pass,
        },
      });
    }

    return this.transporter;
  }

  async send(message) {
    return this.getTransporter().sendMail({
      from: this.from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
      headers: message.headers,
    });
  }
}

module.exports = NodemailerProvider;
