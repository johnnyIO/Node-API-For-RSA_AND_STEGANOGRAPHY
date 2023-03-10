const mongoose = require("mongoose")

const userschema = new mongoose.Schema({
    first_name:{
        type:"String",
        required:true,
    },

    last_name:{
        type:"String",
        required:true,
    },

    matric_no:{
      type:"String",
      required:true
    },
    department:{
        type:"String",
        required:true
    },
    password:{
        type:"String",
        required:true
    }
})

const usermodel = mongoose.model("users",userschema)
module.exports = usermodel