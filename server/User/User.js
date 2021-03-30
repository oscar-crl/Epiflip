const express = require("express");
const auth = require("../Middleware/Auth");
const user = require("./UserController");

const router = express.Router();

router.route("/login").post(user.connect);
router.route("/login-twitter").post(user.connectWithTwitter);
router.route("/twitter-callback").get(user.twitterCallback, user.connect);
router.route("/signup").post(user.create);
router.route("/forgot-password").post(user.forgotPass);
router.route("/reset-password").put(user.resetPass);
router.route("/update-profile").put(auth, user.updateUser);

module.exports = router;