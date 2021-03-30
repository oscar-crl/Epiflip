const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BoardModel = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    bio: String,
    tags: [String],
    sources : [String],
    followers: [String],
    followed: [String],
    magazines: {
        type: [{
            name: String,
            privacy: {type: String, enum: ['public', 'private', 'followers'], default: 'public'},
            articles: [{
                source: {
                    id: String,
                    name: String,
                },
                author: String,
                title: String,
                description: String,
                url: String,
                urlToImage: String,
                content: String,
                date: {type: Date, default: Date.now},
                time: String
            }],
        }]
    },
    upvote: {
        type: [{
                source: {
                    id: String,
                    name: String,
                },
                author: String,
                title: String,
                description: String,
                url: String,
                urlToImage: String,
                content: String,
                date: {type: Date, default: Date.now},
                time: String
            }]
    },
    downvote: [String],
    versionKey: false
});

module.exports = mongoose.model("Board", BoardModel);