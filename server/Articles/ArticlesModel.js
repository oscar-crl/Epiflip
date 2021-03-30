const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ArticlesModel = new Schema({
    url: {
        type: String,
        required: true,
    },
    upvote: {
        type: Number,
        required: true,
    },
    downvote: {
        type: Number,
        required: true,
    },
    versionKey: false
});

module.exports = mongoose.model("Articles", ArticlesModel);