const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ORGANIZATION_ROLES,
  ORGANIZATION_PERMISSIONS,
  hasPermission,
} = require("../src/constants/organization");
const { tenantFilter } = require("../src/utils/tenant");

test("organization roles enforce least-privilege permissions", () => {
  assert.equal(hasPermission(ORGANIZATION_ROLES.OWNER, ORGANIZATION_PERMISSIONS.OWNER_TRANSFER), true);
  assert.equal(hasPermission(ORGANIZATION_ROLES.ADMIN, ORGANIZATION_PERMISSIONS.OWNER_TRANSFER), false);
  assert.equal(hasPermission(ORGANIZATION_ROLES.RECRUITER, ORGANIZATION_PERMISSIONS.JOBS_CREATE), true);
  assert.equal(hasPermission(ORGANIZATION_ROLES.VIEWER, ORGANIZATION_PERMISSIONS.JOBS_CREATE), false);
});

test("tenantFilter appends organization scope without dropping existing filters", () => {
  const organizationId = "507f1f77bcf86cd799439011";
  assert.deepEqual(
    tenantFilter({ organizationId }, { status: "active" }),
    { status: "active", organizationId }
  );
});

test("tenantFilter keeps legacy filters unchanged when no organization context exists", () => {
  assert.deepEqual(tenantFilter({}, { status: "active" }), { status: "active" });
});
