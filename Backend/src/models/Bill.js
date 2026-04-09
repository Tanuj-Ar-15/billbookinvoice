const mongoose = require("mongoose");

const billLineSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    itemName: { type: String, required: true },
    categoryName: { type: String, default: "" },
    size_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemSize",
      required: true,
    },
    sizeName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    isVeg: { type: Boolean, default: true },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    restaurant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    billNumber: { type: Number, required: true },
    paymentMode: {
      type: String,
      enum: ["online", "cash", "due"],
      required: true,
    },
    items: [billLineSchema],
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

billSchema.index({ restaurant_id: 1, billNumber: 1 }, { unique: true });
billSchema.index({ restaurant_id: 1, createdAt: -1 });

const Bill = mongoose.model("Bill", billSchema);
module.exports = Bill;
