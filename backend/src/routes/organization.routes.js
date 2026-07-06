const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { resolveOrganization, requirePermission } = require("../middlewares/organization.middleware");
const { ORGANIZATION_PERMISSIONS } = require("../constants/organization");
const controller = require("../controllers/organization.controller");

const router = express.Router();

router.post("/", protect, controller.createOrganization);
router.get("/", protect, controller.getMyOrganizations);
router.post("/invitations/accept", protect, controller.acceptInvitation);

router.get("/:organizationId", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.ORG_READ), controller.getOrganization);
router.put("/:organizationId", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.ORG_UPDATE), controller.updateOrganization);
router.delete("/:organizationId", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.ORG_DELETE), controller.deleteOrganization);
router.post("/:organizationId/invitations", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.MEMBERS_INVITE), controller.inviteMember);
router.patch("/:organizationId/members/:userId/role", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.MEMBERS_UPDATE), controller.updateMemberRole);
router.patch("/:organizationId/members/:userId/suspend", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.MEMBERS_UPDATE), controller.suspendMember);
router.delete("/:organizationId/members/:userId", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.MEMBERS_REMOVE), controller.removeMember);
router.patch("/:organizationId/owner", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.OWNER_TRANSFER), controller.transferOwnership);
router.patch("/:organizationId/branding", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.BRANDING_UPDATE), controller.updateBranding);
router.patch("/:organizationId/settings", protect, resolveOrganization, requirePermission(ORGANIZATION_PERMISSIONS.SETTINGS_UPDATE), controller.updateSettings);

module.exports = router;
