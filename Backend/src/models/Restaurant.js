const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minlength: 6 },
    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
    token: { type: String, default: null },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
    GSTIN: { type: String, required: false, default: null },
    productSerialCounter: { type: Number, default: 0 },
    billSerialCounter: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// 🔒 Hash password before saving
RestaurantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🧩 Compare entered password with stored hash
RestaurantSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Use correct model name
const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

module.exports = Restaurant;
