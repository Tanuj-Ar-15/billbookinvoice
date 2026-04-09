const mongoose = require("mongoose");
const Bill = require("../models/Bill");
const Item = require("../models/Item");
const Restaurant = require("../models/Restaurant");
const ItemSize = require("../models/size");

const MAX_PAGE_SIZE = 50;

/** YYYY-MM-DD → UTC start of calendar day */
const parseDateUTCStart = (dateStr) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr).trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 0, 0, 0, 0));
};

/** YYYY-MM-DD → UTC end of calendar day */
const parseDateUTCEnd = (dateStr) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr).trim());
  if (!m) return null;
  const [, y, mo, d] = m;
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), 23, 59, 59, 999));
};

const buildBillsListFilter = (restaurant_id, search, paymentMode, from, to) => {
  const filter = { restaurant_id };

  if (paymentMode && ["online", "cash", "due"].includes(String(paymentMode).toLowerCase())) {
    filter.paymentMode = String(paymentMode).toLowerCase();
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) {
      const s = parseDateUTCStart(from);
      if (s) filter.createdAt.$gte = s;
    }
    if (to) {
      const e = parseDateUTCEnd(to);
      if (e) filter.createdAt.$lte = e;
    }
  }

  if (search && String(search).trim() !== "") {
    const trimmed = String(search).trim();
    const num = Number.parseInt(trimmed, 10);
    const or = [];

    if (!Number.isNaN(num) && String(num) === trimmed) {
      or.push({ billNumber: num });
    }
    or.push({ "items.itemName": { $regex: trimmed, $options: "i" } });
    or.push({ notes: { $regex: trimmed, $options: "i" } });

    filter.$or = or;
  }

  return filter;
};

exports.createBill = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    const { paymentMode, items: lineItems, notes } = req.body;

    if (!paymentMode || !["online", "cash", "due"].includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment mode is required (online, cash, due).",
      });
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one line item is required.",
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      restaurant_id,
      { $inc: { billSerialCounter: 1 } },
      { new: true }
    ).lean();

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found." });
    }

    const billNumber = restaurant.billSerialCounter || 1;

    const billLines = [];
    let subtotal = 0;

    for (const line of lineItems) {
      const { itemId, size_id, quantity } = line;
      const qty = Number(quantity);
      if (!itemId || !size_id || !qty || qty < 1) {
        return res.status(400).json({
          success: false,
          message: "Each line needs itemId, size_id, and quantity >= 1.",
        });
      }

      const item = await Item.findOne({
        _id: itemId,
        restaurant_id,
        isActive: true,
      })
        .populate({ path: "category_id", select: "name" })
        .lean();

      if (!item) {
        return res.status(400).json({
          success: false,
          message: "Invalid or inactive product.",
        });
      }

      const priceEntry = Array.isArray(item.price)
        ? item.price.find((p) => String(p.size_id) === String(size_id))
        : null;

      if (!priceEntry) {
        return res.status(400).json({
          success: false,
          message: `Size not configured for product: ${item.itemName}`,
        });
      }

      const sizeDoc = await ItemSize.findById(size_id).select("name").lean();
      const unitPrice = Number(priceEntry.price);
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      billLines.push({
        itemId: item._id,
        itemName: item.itemName,
        categoryName: item.category_id?.name || "",
        size_id: priceEntry.size_id,
        sizeName: sizeDoc?.name || "",
        quantity: qty,
        unitPrice,
        lineTotal,
        isVeg: !!item.isVeg,
      });
    }

    const total = subtotal;

    const bill = await Bill.create({
      restaurant_id,
      billNumber,
      paymentMode,
      items: billLines,
      subtotal,
      total,
      notes: notes || "",
    });

    const populated = await Bill.findById(bill._id).lean();

    return res.status(201).json({
      success: true,
      message: "Bill created successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Error in createBill:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Bill number conflict. Try again.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Error creating bill",
      error: error.message,
    });
  }
};

exports.getBills = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.limit, 10) || MAX_PAGE_SIZE)
    );
    const search = req.query.search || "";
    const paymentMode = req.query.paymentMode || "";
    const from = req.query.from || "";
    const to = req.query.to || "";

    const filter = buildBillsListFilter(restaurant_id, search, paymentMode, from, to);
    const skip = (page - 1) * limit;

    const [total, bills] = await Promise.all([
      Bill.countDocuments(filter),
      Bill.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Bills fetched",
      data: bills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Error in getBills:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bills",
      error: error.message,
    });
  }
};

exports.getBillById = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid bill id." });
    }

    const bill = await Bill.findOne({ _id: id, restaurant_id }).lean();
    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Bill fetched",
      data: bill,
    });
  } catch (error) {
    console.error("Error in getBillById:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching bill",
      error: error.message,
    });
  }
};

exports.updateBill = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid bill id." });
    }

    const bill = await Bill.findOne({ _id: id, restaurant_id });
    if (!bill) {
      return res.status(404).json({ success: false, message: "Bill not found." });
    }

    const { paymentMode, items: lineItems, notes } = req.body;

    if (paymentMode !== undefined) {
      if (!["online", "cash", "due"].includes(paymentMode)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment mode.",
        });
      }
      bill.paymentMode = paymentMode;
    }

    if (notes !== undefined) {
      bill.notes = notes;
    }

    if (Array.isArray(lineItems) && lineItems.length > 0) {
      const billLines = [];
      let subtotal = 0;

      for (const line of lineItems) {
        const { itemId, size_id, quantity } = line;
        const qty = Number(quantity);
        if (!itemId || !size_id || !qty || qty < 1) {
          return res.status(400).json({
            success: false,
            message: "Each line needs itemId, size_id, and quantity >= 1.",
          });
        }

        const item = await Item.findOne({
          _id: itemId,
          restaurant_id,
        })
          .populate({ path: "category_id", select: "name" })
          .lean();

        if (!item) {
          return res.status(400).json({
            success: false,
            message: "Invalid product.",
          });
        }

        const priceEntry = Array.isArray(item.price)
          ? item.price.find((p) => String(p.size_id) === String(size_id))
          : null;

        if (!priceEntry) {
          return res.status(400).json({
            success: false,
            message: `Size not configured for product: ${item.itemName}`,
          });
        }

        const sizeDoc = await ItemSize.findById(size_id).select("name").lean();
        const unitPrice = Number(priceEntry.price);
        const lineTotal = unitPrice * qty;
        subtotal += lineTotal;

        billLines.push({
          itemId: item._id,
          itemName: item.itemName,
          categoryName: item.category_id?.name || "",
          size_id: priceEntry.size_id,
          sizeName: sizeDoc?.name || "",
          quantity: qty,
          unitPrice,
          lineTotal,
          isVeg: !!item.isVeg,
        });
      }

      bill.items = billLines;
      bill.subtotal = subtotal;
      bill.total = subtotal;
    }

    await bill.save();
    const updated = await Bill.findById(bill._id).lean();

    return res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error in updateBill:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating bill",
      error: error.message,
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const restaurant_id = req.restaurant?._id;
    if (!restaurant_id) {
      return res.status(400).json({
        success: false,
        message: "You do not have access to this route.",
      });
    }

    const rid = new mongoose.Types.ObjectId(restaurant_id);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [itemsCreated, activeItems, totalsAgg, todayAgg] = await Promise.all([
      Item.countDocuments({ restaurant_id: rid }),
      Item.countDocuments({ restaurant_id: rid, isActive: true }),
      Bill.aggregate([
        { $match: { restaurant_id: rid } },
        {
          $group: {
            _id: null,
            totalSales: {
              $sum: {
                $cond: [{ $in: ["$paymentMode", ["cash", "online"]] }, "$total", 0],
              },
            },
            totalDues: {
              $sum: {
                $cond: [{ $eq: ["$paymentMode", "due"] }, "$total", 0],
              },
            },
          },
        },
      ]),
      Bill.aggregate([
        {
          $match: {
            restaurant_id: rid,
            createdAt: { $gte: todayStart },
          },
        },
        {
          $group: {
            _id: null,
            todaySales: {
              $sum: {
                $cond: [{ $in: ["$paymentMode", ["cash", "online"]] }, "$total", 0],
              },
            },
            todayCash: {
              $sum: {
                $cond: [{ $eq: ["$paymentMode", "cash"] }, "$total", 0],
              },
            },
            todayOnline: {
              $sum: {
                $cond: [{ $eq: ["$paymentMode", "online"] }, "$total", 0],
              },
            },
            todayDues: {
              $sum: {
                $cond: [{ $eq: ["$paymentMode", "due"] }, "$total", 0],
              },
            },
          },
        },
      ]),
    ]);

    const totals = totalsAgg[0] || { totalSales: 0, totalDues: 0 };
    const today = todayAgg[0] || {
      todaySales: 0,
      todayCash: 0,
      todayOnline: 0,
      todayDues: 0,
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard stats",
      data: {
        itemsCreated,
        activeItems,
        totalSales: totals.totalSales || 0,
        totalDues: totals.totalDues || 0,
        todaySales: today.todaySales || 0,
        todayCash: today.todayCash || 0,
        todayOnline: today.todayOnline || 0,
        todayDues: today.todayDues || 0,
      },
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return res.status(500).json({
      success: false,
      message: "Error loading dashboard stats",
      error: error.message,
    });
  }
};
