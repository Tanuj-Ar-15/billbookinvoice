const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
    {
        name:{
         type: String,
         required: true 
       },
       restaurant_id:{
               type: mongoose.Schema.Types.ObjectId, 
               required: true 
       },
    }
  )
  const itemSize = mongoose.model("ItemSize", sizeSchema)
     
  module.exports = itemSize;
     





