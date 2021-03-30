const express = require("express");
const auth = require("../Middleware/Auth");
const board = require("./BoardController");

const router = express.Router()

router.route("/home").get(auth, board.home);

router.route("/user/favorites").get(auth, board.getUserFav);
router.route("/user/favorites").post(auth, board.addUserFav);
router.route("/user/favorites").put(auth, board.putUserFav);
router.route("/user/favorites").delete(auth, board.delUserFav);

router.route("/user/follow").post(auth, board.followUser);

router.route("/search/top").get(auth, board.searchTopHeadlines);
router.route("/search/everything").get(auth, board.searchEverything);
router.route("/search/sources").get(auth, board.searchSources);
router.route("/search/tags").get(auth, board.searchTags);
router.route("/search/tweets").get(auth, board.searchTweets);

router.route("/magazines").post(auth, board.addMagazine);
router.route("/magazines/:id").post(auth, board.addArticle);
router.route("/magazines/:id").get(auth, board.getArticles);
router.route("/magazines/:id").delete(auth, board.delMagazineOrArticle);

router.route("/like-tweet").post(auth, board.likeTweet);
router.route("/retweet-tweet").post(auth, board.retweetTweet);

module.exports = router