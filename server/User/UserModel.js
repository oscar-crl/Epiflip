const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserModel = new Schema({
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: [true, "This email is already used"],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please add a valid email"
        ]
    },
    username:  {
        type: String,
        unique: [true, "This username already exist"],
        required: [true, "Please provide an username"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
    },
    access_token: {
        type: String
    },
    access_token_secret: {
        type: String
    },
    resetPasswordToken: {
        type: String
    },
    versionKey: false
});

module.exports = mongoose.model("User", UserModel);