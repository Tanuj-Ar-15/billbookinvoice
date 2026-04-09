const { Router } = require("express");
const itemController = require("../controllers/itemController");
const { protect } = require("../middlewares/auth");

const router = Router();

router.post("/create/category", protect, itemController.createCategory);
router.post("/create/size", protect, itemController.createSize);
router.post("/create", protect, itemController.createItem);

router.get("/fetch", protect, itemController.getItems);
router.get("/fetch/catgories", protect, itemController.getCategories);
router.get("/fetch/size", protect, itemController.getSizes);

router.put("/category/:id", protect, itemController.updateCategory);
router.delete("/category/:id", protect, itemController.deleteCategory);

router.put("/size/:id", protect, itemController.updateSize);
router.delete("/size/:id", protect, itemController.deleteSize);

router.get("/:id", protect, itemController.getItemById);
router.put("/:id", protect, itemController.updateItem);
router.delete("/:id", protect, itemController.deleteItem);

module.exports = router;
