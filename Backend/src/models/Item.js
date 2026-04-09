const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  restaurant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },
  serialNumber: {
    type: Number,
    required: false,
  },
  itemName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  price: [
    {
      size_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ItemSize",
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }
  ]
});

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
