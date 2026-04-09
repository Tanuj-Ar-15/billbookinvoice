const { Router } = require("express");
const billController = require("../controllers/billController");
const { protect } = require("../middlewares/auth");

const router = Router();

router.get("/dashboard/stats", protect, billController.getDashboardStats);
router.post("/create", protect, billController.createBill);
router.get("/fetch", protect, billController.getBills);
router.get("/:id", protect, billController.getBillById);
router.put("/:id", protect, billController.updateBill);

module.exports = router;
