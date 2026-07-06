const mongoose = require("mongoose");

const getTenantId = (req) =>
  req.organization?._id || req.organizationId || req.user?.currentOrganization || req.user?.organizationId || null;

const tenantFilter = (req, baseFilter = {}) => {
  const organizationId = getTenantId(req);
  return organizationId ? { ...baseFilter, organizationId } : baseFilter;
};

const sameObjectId = (left, right) =>
  Boolean(left && right && String(left) === String(right));

const isObjectId = (value) => mongoose.isValidObjectId(value);

module.exports = {
  getTenantId,
  tenantFilter,
  sameObjectId,
  isObjectId,
};
