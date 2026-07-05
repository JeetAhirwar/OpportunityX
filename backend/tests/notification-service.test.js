const test = require("node:test");
const assert = require("node:assert/strict");

process.env.MONGODB_URI ||= "mongodb://127.0.0.1:27017/opportunityx-test";
process.env.JWT_SECRET ||= "test-only-secret";

const repositoryPath = require.resolve("../src/repositories/notification.repository");
const gatewayPath = require.resolve("../src/socket/notificationGateway");
const userModelPath = require.resolve("../src/models/user.model");

let fakeRepository;
let fakeGateway;
let fakeUser;

require.cache[repositoryPath] = {
  id: repositoryPath,
  filename: repositoryPath,
  loaded: true,
  exports: {
    create: (...args) => fakeRepository.create(...args),
    findDuplicate: (...args) => fakeRepository.findDuplicate(...args),
    listForRecipient: (...args) => fakeRepository.listForRecipient(...args),
    countUnread: (...args) => fakeRepository.countUnread(...args),
    markRead: (...args) => fakeRepository.markRead(...args),
    markAllRead: (...args) => fakeRepository.markAllRead(...args),
    deleteOne: (...args) => fakeRepository.deleteOne(...args),
    clearForRecipient: (...args) => fakeRepository.clearForRecipient(...args),
    normalize: (notification) => notification,
  },
};

require.cache[gatewayPath] = {
  id: gatewayPath,
  filename: gatewayPath,
  loaded: true,
  exports: {
    deliver: (...args) => fakeGateway.deliver(...args),
    emitUnreadCount: (...args) => fakeGateway.emitUnreadCount(...args),
  },
};

require.cache[userModelPath] = {
  id: userModelPath,
  filename: userModelPath,
  loaded: true,
  exports: {
    find: (...args) => fakeUser.find(...args),
  },
};

const service = require("../src/services/notification.service");

test("createNotification persists normalized enterprise fields and delivers once", async () => {
  const created = [];
  const delivered = [];
  fakeRepository = {
    async findDuplicate() { return null; },
    async create(payload) {
      created.push(payload);
      return { _id: "notification-1", ...payload };
    },
  };
  fakeGateway = {
    async deliver(io, notification) {
      delivered.push({ io, notification });
    },
  };

  const notification = await service.createNotification({
    io: "io",
    recipient: "candidate-1",
    sender: "recruiter-1",
    type: service.TYPES.APPLICATION_SHORTLISTED,
    title: "You Were Shortlisted",
    message: "Your application moved forward.",
    entityType: "application",
    entityId: "application-1",
    link: "/candidate/applied",
    dedupeKey: "shortlisted:application-1",
  });

  assert.equal(notification._id, "notification-1");
  assert.equal(created.length, 1);
  assert.equal(created[0].user, undefined);
  assert.equal(created[0].recipient, "candidate-1");
  assert.equal(created[0].metadata.dedupeKey, "shortlisted:application-1");
  assert.equal(created[0].priority, "normal");
  assert.equal(delivered.length, 1);
});

test("createNotification returns existing duplicate without re-delivery", async () => {
  let createCalled = false;
  let deliverCalled = false;
  fakeRepository = {
    async findDuplicate() { return { _id: "existing", recipient: "candidate-1" }; },
    async create() { createCalled = true; },
  };
  fakeGateway = {
    async deliver() { deliverCalled = true; },
  };

  const notification = await service.createNotification({
    recipient: "candidate-1",
    title: "Application Submitted",
    message: "Submitted.",
    dedupeKey: "same-event",
  });

  assert.equal(notification._id, "existing");
  assert.equal(createCalled, false);
  assert.equal(deliverCalled, false);
});

test("notifyAdmins fans out only to active admins", async () => {
  const recipients = [];
  fakeUser = {
    find(query) {
      assert.deepEqual(query, { role: "admin", isActive: true });
      return { select: () => ({ lean: async () => [{ _id: "admin-1" }, { _id: "admin-2" }] }) };
    },
  };
  fakeRepository = {
    async findDuplicate() { return null; },
    async create(payload) {
      recipients.push(String(payload.recipient));
      return { _id: `n-${recipients.length}`, ...payload };
    },
  };
  fakeGateway = { async deliver() {} };

  await service.notifyAdmins({
    title: "Recruiter Approval Pending",
    message: "A recruiter is waiting.",
    type: service.TYPES.RECRUITER_APPROVAL_PENDING,
  });

  assert.deepEqual(recipients, ["admin-1", "admin-2"]);
});
