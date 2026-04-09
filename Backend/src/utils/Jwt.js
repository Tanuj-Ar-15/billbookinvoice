const jwt = require('jsonwebtoken');
 
/**
* Generate JWT token for user
* @param {string} userId - User ID
* @returns {string} JWT token
*/
exports.generateToken = (userId) => {
  return jwt.sign(
    { userId, type: "restaurant" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Admin panel JWT — payload includes role and type so it cannot be used as a restaurant session.
 */
exports.generateAdminToken = (adminId, role) => {
  return jwt.sign(
    { userId: adminId, role, type: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || process.env.JWT_EXPIRES_IN || "7d" }
  );
};
 
/**
* Verify JWT token
* @param {string} token - JWT token to verify
* @returns {object|null} Decoded token payload or null if invalid
*/
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};
 