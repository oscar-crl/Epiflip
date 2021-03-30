const express = require("express");
const auth = require("../Middleware/Auth");
const articles = require("./ArticlesController");

const router = express.Router()

router.route("/upvote").post(auth, articles.upvote);
router.route("/downvote").post(auth, articles.downvote);

module.exports = router