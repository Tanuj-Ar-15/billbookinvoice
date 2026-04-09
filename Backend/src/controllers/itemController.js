const Item = require("../models/Item");
const Category = require("../models/ItemCategory");
const itemSize = require("../models/size");
const Restaurant = require("../models/Restaurant");

const MAX_PAGE_SIZE = 50;

const parsePageLimit = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(query.limit, 10) || MAX_PAGE_SIZE)
  );
  return { page, limit, skip: (page - 1) * limit };
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.restaurant?._id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required!",
      });
    }

    const newCategory = await Category.create({
      name,
      restaurant_id: req.restaurant._id,
    });

    return res.status(201).json({
      success: true,
      message: "New category created",
      category: newCategory,
    });
  } catch (error) {
    console.log("Error in create category Api: ", error);

    return res.status(400).json({
      success: false,
      message: "Error in create category api",
      error: error.message,
    });
  }
};

exports.createSize = async (req, res) => {
  try {
    const { name } = req.body;

    if (!req.restaurant?._id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Size name is required!",
      });
    }

    const newSize = await itemSize.create({
      name,
      restaurant_id: req.restaurant._id,
    });

    return res.status(201).json({
      success: true,
      message: "New Item Size created",
      itemSize: newSize,
    });
  } catch (error) {
    console.log("Error in create item size Api: ", error);

    return res.status(400).json({
      success: false,
      message: "Error in create item size api",
      error: error.message,
    });
  }
};

exports.createItem = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;

    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    const { itemName, description, isVeg, category_id, price } = req.body;

    if (!itemName || !category_id || !price || !Array.isArray(price) || price.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Item name, category, and price array are required.",
      });
    }

    const category = await Category.findById(category_id).lean();
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }
    if (
      category.restaurant_id &&
      String(category.restaurant_id) !== String(restaurant_id)
    ) {
      return res.status(400).json({
        success: false,
        message: "This category does not belong to your restaurant.",
      });
    }

    const normalizedPrice = [];
    for (const entry of price) {
      const sid = entry?.size_id;
      const p = entry?.price;
      if (!sid) {
        return res.status(400).json({
          success: false,
          message: "Each price entry must include size_id.",
        });
      }
      const num = Number(p);
      if (!Number.isFinite(num) || num < 0) {
        return res.status(400).json({
          success: false,
          message: "Each price must be a valid non-negative number.",
        });
      }
      const sizeDoc = await itemSize.findById(sid).lean();
      if (!sizeDoc) {
        return res.status(400).json({
          success: false,
          message: `Invalid size (size id: ${sid}).`,
        });
      }
      if (
        sizeDoc.restaurant_id &&
        String(sizeDoc.restaurant_id) !== String(restaurant_id)
      ) {
        return res.status(400).json({
          success: false,
          message: "One of the sizes does not belong to your restaurant.",
        });
      }
      normalizedPrice.push({ size_id: sid, price: num });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurant_id,
      { $inc: { productSerialCounter: 1 } },
      { new: true }
    ).lean();

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found." });
    }

    const serialNumber = restaurant.productSerialCounter || 1;

    const newItem = new Item({
      restaurant_id,
      serialNumber,
      itemName,
      description,
      isVeg: isVeg !== undefined ? !!isVeg : true,
      category_id,
      price: normalizedPrice,
      isActive: true,
    });

    const savedItem = await newItem.save();

    const populatedItem = await Item.findById(savedItem._id)
      .populate({ path: "category_id", select: "_id name" })
      .populate({ path: "price.size_id", select: "_id name" })
      .lean();

    return res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: populatedItem,
    });
  } catch (error) {
    console.log("Error in createItem API:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Serial number conflict. Try again.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error in create item API",
      error: error.message,
    });
  }
};

exports.getItems = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;

    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    const { page, limit, skip } = parsePageLimit(req.query);
    const search = (req.query.search || "").trim();

    const query = { restaurant_id };
    if (search) {
      const num = Number.parseInt(search, 10);
      const or = [
        { itemName: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
      if (!Number.isNaN(num) && String(num) === search) {
        or.push({ serialNumber: num });
      }
      query.$or = or;
    }

    const [total, items] = await Promise.all([
      Item.countDocuments(query),
      Item.find(query)
        .populate({
          path: "category_id",
          select: "_id name",
        })
        .populate({
          path: "price.size_id",
          select: "_id name",
        })
        .sort({ serialNumber: 1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Items fetched",
      count: items.length,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.log("Error in getItems API:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching items.",
      error: error.message,
    });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;

    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    const { page, limit, skip } = parsePageLimit(req.query);
    const search = (req.query.search || "").trim();

    const query = { restaurant_id };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [total, categories] = await Promise.all([
      Category.countDocuments(query),
      Category.find(query)
        .select("_id name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Categories fetched",
      count: categories.length,
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.log("Error in getCategories API:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

exports.getSizes = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;

    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    const { page, limit, skip } = parsePageLimit(req.query);
    const search = (req.query.search || "").trim();

    const query = { restaurant_id };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const [total, sizes] = await Promise.all([
      itemSize.countDocuments(query),
      itemSize
        .find(query)
        .select("_id name")
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Sizes fetched",
      count: sizes.length,
      data: sizes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.log("Error in getSizes API:", error);

    return res.status(500).json({
      success: false,
      message: "Error fetching item sizes",
      error: error.message,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    const { id } = req.params;
    const { name } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({ success: false, message: "Unauthorized." });
    }
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }

    const category = await Category.findOneAndUpdate(
      { _id: id, restaurant_id },
      { name },
      { new: true }
    ).lean();

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    const { id } = req.params;

    if (!restaurant_id) {
      return res.status(400).json({ success: false, message: "Unauthorized." });
    }

    const inUse = await Item.exists({ restaurant_id, category_id: id });
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: "Category is used by products. Remove or reassign products first.",
      });
    }

    const deleted = await Category.findOneAndDelete({ _id: id, restaurant_id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }

    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};

exports.updateSize = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    const { id } = req.params;
    const { name } = req.body;

    if (!restaurant_id) {
      return res.status(400).json({ success: false, message: "Unauthorized." });
    }
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }

    const size = await itemSize.findOneAndUpdate(
      { _id: id, restaurant_id },
      { name },
      { new: true }
    ).lean();

    if (!size) {
      return res.status(404).json({ success: false, message: "Size not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Size updated",
      data: size,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating size",
      error: error.message,
    });
  }
};

exports.deleteSize = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    const { id } = req.params;

    if (!restaurant_id) {
      return res.status(400).json({ success: false, message: "Unauthorized." });
    }

    const inUse = await Item.exists({
      restaurant_id,
      "price.size_id": id,
    });
    if (inUse) {
      return res.status(400).json({
        success: false,
        message: "Size is used by products. Remove from products first.",
      });
    }

    const deleted = await itemSize.findOneAndDelete({ _id: id, restaurant_id });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Size not found." });
    }

    return res.status(200).json({ success: true, message: "Size deleted" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting size",
      error: error.message,
    });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    const { id } = req.params;

    if (!restaurant_id) {
      return res.status(400).json({ success: false, message: "Unauthorized." });
    }

    const { itemName, description, isVeg, category_id, price, isActive } = req.body;

    const item = await Item.findOne({ _id: id, restaurant_id });
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    if (itemName !== undefined) item.itemName = itemName;
    if (description !== undefined) item.description = description;
    if (isVeg !== undefined) item.isVeg = !!isVeg;
    if (category_id !== undefined) item.category_id = category_id;
    if (price !== undefined) {
      if (!Array.isArray(price) || price.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a non-empty array.",
        });
      }
      item.price = price;
    }
    if (isActive !== undefined) item.isActive = !!isActive;

    await item.save();

    const populatedItem = await Item.findById(item._id)
      .populate({ path: "category_id", select: "_id name" })
      .populate({ path: "price.size_id", select: "_id name" })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Item updated",
      data: populatedItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    const { id } = req.params;

    if (!restaurant_id) {
      return res.status(400).json({ success: false, message: "Unauthorized." });
    }

    const item = await Item.findOneAndUpdate(
      { _id: id, restaurant_id },
      { isActive: false },
      { new: true }
    ).lean();

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Item deactivated",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deactivating item",
      error: error.message,
    });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    const { id } = req.params;

    if (!restaurant_id) {
      return res.status(400).json({ success: false, message: "Unauthorized." });
    }

    const item = await Item.findOne({ _id: id, restaurant_id })
      .populate({ path: "category_id", select: "_id name" })
      .populate({ path: "price.size_id", select: "_id name" })
      .lean();

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching item",
      error: error.message,
    });
  }
};
