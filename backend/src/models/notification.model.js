const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    type: {
      type: String,
      required: true,
      trim: true,
      default: "info",
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String, default: "" },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    read: { type: Boolean, default: false },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    link: { type: String, default: "" },
    icon: { type: String, default: "bell" },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "critical"],
      default: "normal",
      index: true,
    },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ organizationId: 1, user: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ "metadata.dedupeKey": 1, user: 1 }, { sparse: true });

notificationSchema.pre("validate", function syncCompatibilityFields() {
  if (!this.recipient && this.user) this.recipient = this.user;
  if (!this.user && this.recipient) this.user = this.recipient;
  this.isRead = Boolean(this.isRead || this.read);
  this.read = this.isRead;
  if (this.isRead && !this.readAt) this.readAt = new Date();
  if (!this.isRead) this.readAt = null;
});

["findOneAndUpdate", "updateOne", "updateMany"].forEach((operation) => {
  notificationSchema.pre(operation, function syncUpdateFields(next) {
    const update = this.getUpdate() || {};
    const set = update.$set || update;
    if (set.recipient && !set.user) set.user = set.recipient;
    if (set.user && !set.recipient) set.recipient = set.user;
    if (typeof set.isRead === "boolean" && typeof set.read !== "boolean") set.read = set.isRead;
    if (typeof set.read === "boolean" && typeof set.isRead !== "boolean") set.isRead = set.read;
    if ((set.isRead === true || set.read === true) && !set.readAt) set.readAt = new Date();
    if (set.isRead === false || set.read === false) set.readAt = null;
    if (update.$set) update.$set = set;
    this.setUpdate(update);
    next();
  });
});

module.exports = mongoose.model("Notification", notificationSchema);
