const mongoose = require("mongoose");


const AdminSchema = new mongoose.Schema({
    adminID: {
        type: String,
        require:true,
    },
    password:{
        type: String,
        required: true
    }
})


const AdminModel = mongoose.model("Admin",AdminSchema)


module.exports = AdminModel;