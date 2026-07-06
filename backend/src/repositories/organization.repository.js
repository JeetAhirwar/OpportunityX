const Organization = require("../models/organization.model");

const selectDefault = "-invitations.tokenHash";

const create = (payload) => Organization.create(payload);
const findById = (id, projection = selectDefault) => Organization.findById(id).select(projection);
const findBySlug = (slug, projection = selectDefault) => Organization.findOne({ slug }).select(projection);
const findForUser = (userId) =>
  Organization.find({ "members.user": userId, "members.status": { $ne: "suspended" } })
    .select(selectDefault)
    .sort({ createdAt: -1 });
const updateById = (id, update) =>
  Organization.findByIdAndUpdate(id, update, { new: true, runValidators: true }).select(selectDefault);
const deleteById = (id) => Organization.findByIdAndDelete(id);

module.exports = {
  create,
  findById,
  findBySlug,
  findForUser,
  updateById,
  deleteById,
};
