const { Router } = require("express");
const adminAuthController = require("../controllers/adminAuthController");
const adminRestaurantController = require("../controllers/adminRestaurantController");
const { adminProtect, requireRestaurantEditor } = require("../middlewares/adminAuth");

const router = Router();

router.post("/auth/login", adminAuthController.login);
router.post("/auth/register-first", adminAuthController.registerFirst);
router.post("/auth/register", adminAuthController.registerWithSecret);

router.get("/auth/me", adminProtect, adminAuthController.me);
router.post("/auth/logout", adminProtect, adminAuthController.logout);

router.get("/restaurants", adminProtect, adminRestaurantController.list);
router.get("/restaurants/:id", adminProtect, adminRestaurantController.getOne);
router.post("/restaurants", adminProtect, requireRestaurantEditor, adminRestaurantController.create);
router.patch("/restaurants/:id", adminProtect, requireRestaurantEditor, adminRestaurantController.update);
router.patch("/restaurants/:id/active", adminProtect, requireRestaurantEditor, adminRestaurantController.setActive);

module.exports = router;
