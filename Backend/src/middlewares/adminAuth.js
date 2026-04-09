const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.adminToken) {
      token = req.cookies.adminToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Admin token missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || decoded.type !== "admin" || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin session.",
      });
    }

    const admin = await Admin.findById(decoded.userId).select("-password");
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    req.admin = admin;
    req.adminJwt = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin session expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid admin token.",
    });
  }
};

/** Only these roles may mutate restaurants (create / update / toggle). Viewers are read-only. */
const requireRestaurantEditor = (req, res, next) => {
  const allowed = ["super_admin", "admin"];
  if (!allowed.includes(req.admin.role)) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to change restaurants.",
    });
  }
  next();
};

module.exports = { adminProtect, requireRestaurantEditor };
