const jwt = require("jsonwebtoken");
const Restaurant = require("../models/Restaurant");

const protect = async (req, res, next) => {
  try {
    let token;


    if (req.cookies && req.cookies.restaurantToken) {
      token = req.cookies.restaurantToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (decoded.type === "admin") {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Use a restaurant session for this resource.",
      });
    }

    const restaurant = await Restaurant.findById(decoded.userId).select("-password -otp -otpExpiry -token");
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    if (restaurant.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This account is inactive.",
      });
    }

    req.restaurant = restaurant;

    next();
  } catch (error) {
    console.error("[AUTH] Error in protect middleware:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please log in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid or malformed token.",
    });
  }
};

module.exports = {protect}
