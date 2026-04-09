const Restaurant = require("../models/Restaurant");

exports.list = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || "").trim();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
        { email: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      ];
    }

    const [items, total] = await Promise.all([
      Restaurant.find(filter)
        .select("-password -otp -otpExpiry -token -resetToken -resetTokenExpiry")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Restaurant.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        restaurants: items,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
      },
    });
  } catch (error) {
    console.error("[admin list restaurants]", error);
    return res.status(500).json({
      success: false,
      message: "Could not load restaurants.",
      error: error.message,
    });
  }
};

exports.getOne = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).select(
      "-password -otp -otpExpiry -token -resetToken -resetTokenExpiry"
    );
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found." });
    }
    return res.status(200).json({ success: true, data: { restaurant } });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not load restaurant.",
      error: error.message,
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, email, address, phone, password, GSTIN } = req.body;
    if (!name || !email || !address || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, address, phone, and password are required.",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const restaurant = await Restaurant.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      address: address.trim(),
      phone: phone.trim(),
      password,
      GSTIN: GSTIN || null,
      isActive: true,
    });

    const safe = await Restaurant.findById(restaurant._id).select(
      "-password -otp -otpExpiry -token -resetToken -resetTokenExpiry"
    );

    return res.status(201).json({
      success: true,
      message: "Restaurant created.",
      data: { restaurant: safe },
    });
  } catch (error) {
    console.error("[admin create restaurant]", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A restaurant with this email already exists.",
      });
    }
    return res.status(400).json({
      success: false,
      message: "Could not create restaurant.",
      error: error.message,
    });
  }
};

exports.update = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found." });
    }

    const { name, address, phone, GSTIN, password, email, isActive } = req.body;

    if (name !== undefined) restaurant.name = String(name).trim();
    if (address !== undefined) restaurant.address = String(address).trim();
    if (phone !== undefined) restaurant.phone = String(phone).trim();
    if (GSTIN !== undefined) restaurant.GSTIN = GSTIN || null;
    if (typeof isActive === "boolean") restaurant.isActive = isActive;

    if (email !== undefined && email !== restaurant.email) {
      const exists = await Restaurant.findOne({
        email: String(email).toLowerCase().trim(),
        _id: { $ne: restaurant._id },
      });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Another restaurant already uses this email.",
        });
      }
      restaurant.email = String(email).toLowerCase().trim();
    }

    if (password !== undefined && password !== "") {
      if (String(password).length < 6) {
        return res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
      }
      restaurant.password = password;
    }

    await restaurant.save();

    const safe = await Restaurant.findById(restaurant._id).select(
      "-password -otp -otpExpiry -token -resetToken -resetTokenExpiry"
    );

    return res.status(200).json({
      success: true,
      message: "Restaurant updated.",
      data: { restaurant: safe },
    });
  } catch (error) {
    console.error("[admin update restaurant]", error);
    return res.status(400).json({
      success: false,
      message: "Could not update restaurant.",
      error: error.message,
    });
  }
};

exports.setActive = async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean.",
      });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select("-password -otp -otpExpiry -token -resetToken -resetTokenExpiry");

    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found." });
    }

    return res.status(200).json({
      success: true,
      message: isActive ? "Restaurant activated." : "Restaurant deactivated.",
      data: { restaurant },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not update status.",
      error: error.message,
    });
  }
};
