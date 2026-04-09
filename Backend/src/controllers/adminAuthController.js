const bcrypt = require("bcrypt");
const Admin = require("../models/Admin");
const { generateAdminToken } = require("../utils/Jwt");
const { adminCookieGenerate } = require("../utils/cookiesGenerate");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateAdminToken(admin._id, admin.role);
    adminCookieGenerate(token, res);

    const safe = await Admin.findById(admin._id).select("-password");

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      data: {
        token,
        admin: safe,
      },
    });
  } catch (error) {
    console.error("[admin login]", error);
    return res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message,
    });
  }
};

exports.me = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    return res.status(200).json({
      success: true,
      data: { admin },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not load admin profile.",
      error: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    return res.status(200).json({
      success: true,
      message: "Logged out.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed.",
      error: error.message,
    });
  }
};

/**
 * One-time bootstrap when no admin exists. Disabled once any admin is present.
 */
exports.registerFirst = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) {
      return res.status(403).json({
        success: false,
        message: "An admin already exists. Use ADMIN_BOOTSTRAP_SECRET to create additional accounts.",
      });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: "super_admin",
    });

    const safe = await Admin.findById(admin._id).select("-password");
    return res.status(201).json({
      success: true,
      message: "First admin created. You can log in now.",
      data: { admin: safe },
    });
  } catch (error) {
    console.error("[admin registerFirst]", error);
    return res.status(400).json({
      success: false,
      message: error.code === 11000 ? "Email already in use." : "Could not create admin.",
      error: error.message,
    });
  }
};

/**
 * Create additional admins when ADMIN_BOOTSTRAP_SECRET matches (or super_admin-only expansion later).
 */
exports.registerWithSecret = async (req, res) => {
  try {
    const secret = req.body.secret || req.headers["x-admin-bootstrap-secret"];
    if (!secret || secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid or missing bootstrap secret.",
      });
    }

    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    const allowedRoles = ["super_admin", "admin", "viewer"];
    const r = allowedRoles.includes(role) ? role : "admin";

    const admin = await Admin.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: r,
    });

    const safe = await Admin.findById(admin._id).select("-password");
    return res.status(201).json({
      success: true,
      message: "Admin created.",
      data: { admin: safe },
    });
  } catch (error) {
    console.error("[admin registerWithSecret]", error);
    return res.status(400).json({
      success: false,
      message: error.code === 11000 ? "Email already in use." : "Could not create admin.",
      error: error.message,
    });
  }
};
