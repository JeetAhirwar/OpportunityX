const Organization = require("../models/organization.model");
const { hasPermission } = require("../constants/organization");
const { sameObjectId, isObjectId } = require("../utils/tenant");

const resolveOrganization = async (req, res, next) => {
  try {
    const candidate =
      req.params.organizationId ||
      req.params.orgId ||
      req.headers["x-organization-id"] ||
      req.query.organizationId ||
      req.user?.currentOrganization ||
      req.user?.organizationId;

    if (!candidate || !isObjectId(candidate)) {
      return res.status(400).json({ success: false, message: "Organization context is required" });
    }

    const organization = await Organization.findById(candidate).select("+invitations +invitations.tokenHash");
    if (!organization) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    const membership = organization.members.find((member) => sameObjectId(member.user, req.user._id));
    if (!membership || membership.status === "suspended") {
      return res.status(403).json({ success: false, message: "You do not belong to this organization" });
    }

    req.organization = organization;
    req.organizationId = organization._id;
    req.organizationRole = membership.role;
    req.organizationMembership = membership;
    return next();
  } catch (error) {
    return next(error);
  }
};

const requirePermission = (...permissions) => (req, res, next) => {
  if (!req.organizationRole) {
    return res.status(403).json({ success: false, message: "Organization role is required" });
  }
  const allowed = permissions.every((permission) => hasPermission(req.organizationRole, permission));
  if (!allowed) {
    return res.status(403).json({ success: false, message: "Insufficient organization permissions" });
  }
  return next();
};

const optionalOrganization = async (req, res, next) => {
  const candidate =
    req.params.organizationId ||
    req.params.orgId ||
    req.headers["x-organization-id"] ||
    req.query.organizationId ||
    req.user?.currentOrganization ||
    req.user?.organizationId;

  if (!candidate) return next();
  return resolveOrganization(req, res, next);
};

const requirePermissionIfScoped = (...permissions) => (req, res, next) => {
  if (!req.organizationId) return next();
  return requirePermission(...permissions)(req, res, next);
};

module.exports = {
  resolveOrganization,
  optionalOrganization,
  requirePermission,
  requirePermissionIfScoped,
};
