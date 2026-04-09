const mongoose = require('mongoose')



const itemCategory  = new mongoose.Schema({
     name : {
        type:String,
        require:true,
     }, 
     restaurant_id:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant"
     }  
});

const Category = mongoose.model('Category', itemCategory)

module.exports = Category ; 