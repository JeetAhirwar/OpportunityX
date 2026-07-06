const crypto = require("crypto");
const Organization = require("../models/organization.model");
const User = require("../models/user.model");
const organizationRepository = require("../repositories/organization.repository");
const { ORGANIZATION_ROLES } = require("../constants/organization");
const { sameObjectId } = require("../utils/tenant");

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const uniqueSlug = async (name, preferredSlug) => {
  const base = slugify(preferredSlug || name) || `org-${crypto.randomBytes(3).toString("hex")}`;
  let slug = base;
  let suffix = 1;
  while (await Organization.exists({ slug })) {
    slug = `${base}-${suffix++}`;
  }
  return slug;
};

const publicOrganization = (organization) => {
  const doc = organization?.toObject ? organization.toObject() : organization;
  if (!doc) return null;
  delete doc.invitations;
  return doc;
};

const createOrganization = async (owner, payload) => {
  const organization = await organizationRepository.create({
    name: payload.name,
    slug: await uniqueSlug(payload.name, payload.slug),
    logo: payload.logo || "",
    website: payload.website || "",
    industry: payload.industry || "",
    companySize: payload.companySize || "",
    country: payload.country || "",
    timezone: payload.timezone || "UTC",
    subscriptionPlan: payload.subscriptionPlan || "free",
    subscriptionStatus: payload.subscriptionStatus || "trial",
    owner: owner._id,
    branding: payload.branding || {},
    settings: payload.settings || {},
  });

  await User.findByIdAndUpdate(owner._id, {
    $addToSet: { organizations: organization._id },
    $set: { currentOrganization: organization._id, organizationId: organization._id },
  });

  return publicOrganization(organization);
};

const updateOrganization = async (organizationId, payload) => {
  const allowed = [
    "name",
    "logo",
    "website",
    "industry",
    "companySize",
    "country",
    "timezone",
    "subscriptionPlan",
    "subscriptionStatus",
  ];
  const update = {};
  allowed.forEach((key) => {
    if (payload[key] !== undefined) update[key] = payload[key];
  });
  if (payload.slug) update.slug = await uniqueSlug(payload.slug, payload.slug);
  return publicOrganization(await organizationRepository.updateById(organizationId, update));
};

const updateBranding = async (organizationId, branding) =>
  publicOrganization(await organizationRepository.updateById(organizationId, { $set: { branding } }));

const updateSettings = async (organizationId, settings) =>
  publicOrganization(await organizationRepository.updateById(organizationId, { $set: { settings } }));

const inviteMember = async ({ organization, email, role, invitedBy }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const memberRole = role || ORGANIZATION_ROLES.RECRUITER;
  if (!normalizedEmail) throw new Error("Email is required");
  if (!Object.values(ORGANIZATION_ROLES).includes(memberRole)) throw new Error("Invalid organization role");
  if (memberRole === ORGANIZATION_ROLES.OWNER) throw new Error("Use ownership transfer for owner changes");

  const existingUser = await User.findOne({ email: normalizedEmail }).select("_id email");
  if (existingUser && organization.members.some((member) => sameObjectId(member.user, existingUser._id))) {
    throw new Error("User is already a member");
  }

  const token = crypto.randomBytes(32).toString("hex");
  organization.invitations.push({
    email: normalizedEmail,
    role: memberRole,
    tokenHash: Organization.hashInvitationToken(token),
    invitedBy,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
  await organization.save();
  return { organization: publicOrganization(organization), invitationToken: token };
};

const acceptInvitation = async ({ token, user }) => {
  const tokenHash = Organization.hashInvitationToken(token);
  const organization = await Organization.findOne({
    invitations: { $elemMatch: { tokenHash, status: "pending", expiresAt: { $gt: new Date() } } },
  }).select("+invitations +invitations.tokenHash");
  if (!organization) throw new Error("Invitation is invalid or expired");

  const invitation = organization.invitations.find((item) => item.tokenHash === tokenHash && item.status === "pending");
  if (invitation.email !== user.email.toLowerCase()) throw new Error("Invitation email does not match this account");

  invitation.status = "accepted";
  invitation.acceptedBy = user._id;
  invitation.acceptedAt = new Date();
  const existingMember = organization.members.find((member) => sameObjectId(member.user, user._id));
  if (existingMember) {
    existingMember.status = "active";
    existingMember.role = invitation.role;
  } else {
    organization.members.push({ user: user._id, role: invitation.role, status: "active", joinedAt: new Date() });
  }
  await organization.save();
  await User.findByIdAndUpdate(user._id, {
    $addToSet: { organizations: organization._id },
    $set: { currentOrganization: organization._id, organizationId: organization._id },
  });
  return publicOrganization(organization);
};

const setMemberRole = async ({ organization, userId, role }) => {
  if (!Object.values(ORGANIZATION_ROLES).includes(role)) throw new Error("Invalid organization role");
  if (role === ORGANIZATION_ROLES.OWNER) throw new Error("Use transfer ownership to assign owner role");
  const member = organization.members.find((item) => sameObjectId(item.user, userId));
  if (!member) throw new Error("Member not found");
  if (member.role === ORGANIZATION_ROLES.OWNER) throw new Error("Owner role cannot be changed directly");
  member.role = role;
  await organization.save();
  return publicOrganization(organization);
};

const setMemberStatus = async ({ organization, userId, status }) => {
  const member = organization.members.find((item) => sameObjectId(item.user, userId));
  if (!member) throw new Error("Member not found");
  if (member.role === ORGANIZATION_ROLES.OWNER) throw new Error("Owner cannot be suspended or removed");
  member.status = status;
  await organization.save();
  return publicOrganization(organization);
};

const removeMember = async ({ organization, userId }) => {
  const member = organization.members.find((item) => sameObjectId(item.user, userId));
  if (!member) throw new Error("Member not found");
  if (member.role === ORGANIZATION_ROLES.OWNER) throw new Error("Owner cannot be removed");
  organization.members = organization.members.filter((item) => !sameObjectId(item.user, userId));
  await organization.save();
  await User.findByIdAndUpdate(userId, {
    $pull: { organizations: organization._id },
    $unset: { currentOrganization: "", organizationId: "" },
  });
  return publicOrganization(organization);
};

const transferOwnership = async ({ organization, newOwnerId }) => {
  const newOwner = organization.members.find((item) => sameObjectId(item.user, newOwnerId) && item.status === "active");
  if (!newOwner) throw new Error("New owner must be an active organization member");
  organization.members.forEach((member) => {
    if (sameObjectId(member.user, organization.owner)) member.role = ORGANIZATION_ROLES.ADMIN;
    if (sameObjectId(member.user, newOwnerId)) member.role = ORGANIZATION_ROLES.OWNER;
  });
  organization.owner = newOwnerId;
  await organization.save();
  return publicOrganization(organization);
};

module.exports = {
  createOrganization,
  updateOrganization,
  updateBranding,
  updateSettings,
  inviteMember,
  acceptInvitation,
  setMemberRole,
  setMemberStatus,
  removeMember,
  transferOwnership,
  publicOrganization,
};
