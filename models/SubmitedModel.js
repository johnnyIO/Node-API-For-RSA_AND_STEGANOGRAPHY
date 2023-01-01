const mongoose = require("mongoose")

const SubmitSchema = new mongoose.Schema({
    student_matno:{
        type:"String",
        required:true
    },

    date_of_upload:{
        type:"String",
        required:true
    },

    path_to_upload:{
        type:"String",
        required:true
    },

    matric:{
        type:"String",
        require:true
    },

    last_name:{
        type:"String",
        require:true
    },

    first_name:{
        type:"String",
        require:true
    },

    program:{
        type:"String",
        require:true
    },
    department:{
        type:"String",
        require:true
    },
    email:{
        type:"String",
        require:true
    },
})


const SubmitModel = mongoose.model("submitedfiles", SubmitSchema)

module.exports = SubmitModel