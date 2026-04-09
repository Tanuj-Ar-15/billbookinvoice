const Admin = require("../models/Admin");

const ALLOWED_ROLES = new Set(["super_admin", "admin", "viewer"]);

/**
 * If DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD are set in env, ensures
 * an admin with that email exists. Skips when vars are missing, password invalid,
 * or an admin with that email already exists.
 */
async function ensureDefaultAdmin() {
  const email = process.env.DEFAULT_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  const name = process.env.DEFAULT_ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    return;
  }

  if (String(password).length < 6) {
    console.warn(
      "[admin] DEFAULT_ADMIN_PASSWORD must be at least 6 characters — skipping default admin bootstrap."
    );
    return;
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(
      `[admin] Admin "${email}" already exists — skipping default admin creation.`
    );
    return;
  }

  const roleEnv = process.env.DEFAULT_ADMIN_ROLE?.trim();
  const role = ALLOWED_ROLES.has(roleEnv) ? roleEnv : "super_admin";

  await Admin.create({
    name,
    email,
    password,
    role,
  });

  console.log(`[admin] Default admin created (${email}, role: ${role}).`);
}

module.exports = { ensureDefaultAdmin };
