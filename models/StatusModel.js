const mongoose = require("mongoose")
const StatusSchema = new mongoose.Schema({
     state:{
        type:"String",
        required:true
     },

     reason:{
        type:"String",
        required:false
     },

     matno:{
        type:"String",
        required:true
     }
}) 


const statusmodel = mongoose.model("status", StatusSchema)

module.exports = statusmodel