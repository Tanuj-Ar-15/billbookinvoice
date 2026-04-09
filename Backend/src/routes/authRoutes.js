const { Router } = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/auth");

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: APIs for Restaurant registration, login (OTP-based), and password management
 */

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new restaurant
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, address, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Food Paradise
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *               address:
 *                 type: string
 *                 example: 22, MG Road, Delhi
 *               phone:
 *                 type: string
 *                 example: 9876543210
 *               GSTIN:
 *                 type: string
 *                 example: 07ABCDE1234F1Z5
 *     responses:
 *       201:
 *         description: Restaurant registered successfully
 *       400:
 *         description: Missing or invalid fields
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login with email and password to receive OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: OTP sent successfully to registered email
 *       400:
 *         description: Invalid credentials or missing fields
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/v1/auth/verify-login:
 *   post:
 *     summary: Verify OTP and complete login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login successful, JWT token issued
 *       400:
 *         description: Invalid or expired OTP
 */
router.post("/verify-login", authController.verifyLogin);

/**
 * @swagger
 * /api/v1/auth/forget-password:
 *   post:
 *     summary: Send password reset link via email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *     responses:
 *       200:
 *         description: Password reset link sent successfully
 *       400:
 *         description: Email not found or invalid
 */
router.post("/forget-password", authController.forgotPassword);

/**
 * @swagger
 * /api/v1/auth/reset-password:
 *   post:
 *     summary: Reset password using the emailed token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, token]
 *             properties:
 *               password:
 *                 type: string
 *                 example: newPassword123
 *               token:
 *                 type: string
 *                 example: 48f2ad9f0e91f0b6e99a8dfef12b6ccf
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout the restaurant user and clear cookie
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Internal server error
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/v1/auth/read/login/restaurant:
 *   get:
 *     summary: Get logged-in restaurant details
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant details fetched successfully
 *       400:
 *         description: User not logged in
 *       500:
 *         description: Internal server error
 */
router.get("/read/login/restaurant", protect, authController.readLoggedUser);

module.exports = router;
