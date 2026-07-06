const Organization = require("../models/organization.model");
const Job = require("../models/job.model");
const organizationRepository = require("../repositories/organization.repository");
const organizationService = require("../services/organization.service");

exports.createOrganization = async (req, res) => {
  try {
    const organization = await organizationService.createOrganization(req.user, req.body);
    return res.status(201).json({ success: true, data: organization });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.getMyOrganizations = async (req, res) => {
  const organizations = await organizationRepository.findForUser(req.user._id);
  return res.json({ success: true, data: organizations });
};

exports.getOrganization = async (req, res) => res.json({ success: true, data: organizationService.publicOrganization(req.organization) });

exports.updateOrganization = async (req, res) => {
  try {
    const organization = await organizationService.updateOrganization(req.organization._id, req.body);
    return res.json({ success: true, data: organization });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteOrganization = async (req, res) => {
  await organizationRepository.deleteById(req.organization._id);
  return res.json({ success: true, message: "Organization deleted" });
};

exports.inviteMember = async (req, res) => {
  try {
    const result = await organizationService.inviteMember({
      organization: req.organization,
      email: req.body.email,
      role: req.body.role,
      invitedBy: req.user._id,
    });
    return res.status(201).json({
      success: true,
      data: result.organization,
      invitationToken: result.invitationToken,
      message: "Invitation created",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.acceptInvitation = async (req, res) => {
  try {
    const organization = await organizationService.acceptInvitation({ token: req.body.token, user: req.user });
    return res.json({ success: true, data: organization });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMemberRole = async (req, res) => {
  try {
    const organization = await organizationService.setMemberRole({
      organization: req.organization,
      userId: req.params.userId,
      role: req.body.role,
    });
    return res.json({ success: true, data: organization });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.suspendMember = async (req, res) => {
  try {
    const organization = await organizationService.setMemberStatus({
      organization: req.organization,
      userId: req.params.userId,
      status: "suspended",
    });
    return res.json({ success: true, data: organization });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const organization = await organizationService.removeMember({
      organization: req.organization,
      userId: req.params.userId,
    });
    return res.json({ success: true, data: organization });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.transferOwnership = async (req, res) => {
  try {
    const organization = await organizationService.transferOwnership({
      organization: req.organization,
      newOwnerId: req.body.newOwnerId,
    });
    return res.json({ success: true, data: organization });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateBranding = async (req, res) => {
  const organization = await organizationService.updateBranding(req.organization._id, {
    ...req.organization.branding?.toObject?.(),
    ...req.body,
  });
  return res.json({ success: true, data: organization });
};

exports.updateSettings = async (req, res) => {
  const organization = await organizationService.updateSettings(req.organization._id, {
    ...req.organization.settings?.toObject?.(),
    ...req.body,
  });
  return res.json({ success: true, data: organization });
};

exports.getPublicCareerPage = async (req, res) => {
  const organization = await Organization.findOne({ slug: req.params.slug }).select("name slug logo website industry companySize country timezone branding settings");
  if (!organization) return res.status(404).json({ success: false, message: "Organization not found" });
  const jobs = await Job.find({ organizationId: organization._id, status: "active" })
    .select("title company location salary skills experienceLevel jobType workMode deadline createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return res.json({ success: true, data: { organization, jobs } });
};
