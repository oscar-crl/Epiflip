const User = require("./UserModel");
const Board = require("../Board/BoardModel")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const reqVerify = require('../Utils/ReqVerify');
const nodemailer = require('nodemailer');
const LoginWithTwitter = require('login-with-twitter');
var config = require('../Utils/TwitterConf');
const TLogin = new LoginWithTwitter(config.twitterLogin);
var TwitterTokenSecret;

exports.create = ((req, res) => {
    const user = new User({
        email: req.body.email,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8)
    });
    user.save((err) => {
        if (err) {
            return res.status(401).json({message: err});
        } else {
            const board = new Board({email: req.body.email});
            board.save((err) => {
                if (err) return res.status(402).json({message: err});
            });
            return res.send({
                message: "User Successfully Created",
                email: req.body.email,
                username: req.body.username,
            });
        }
    });
});

exports.connect = reqVerify(async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if (!req.body.password) {
        return res.status(400).send({message: "Please provide a password"});
    }
    if (!user) {
        return res.status(404).send({message: "User Not found"});
    }

    const passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
    );

    if (!passwordIsValid) {
        return res.status(401).send({
            accessToken: null,
            message: "Invalid Password"
        });
    }

    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: 86400});
    return res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        accessToken: token
    });
});

exports.connectWithTwitter = ((req, res) => {
    TLogin.login((err, tokenSecret, url) => {
        if (err) {
            return res.status(400).send({message: err});
        }
        // Save the OAuth token secret for use in your /twitter/callback route
        TwitterTokenSecret = tokenSecret;

        // Redirect to the /twitter/callback route, with the OAuth responses as query params
        return res.send({endpoint: url});
    });
});

exports.twitterCallback = ((req, res, next) => {
    if (!TwitterTokenSecret) {
        return res.status(404).send({message: "Twitter Secret Token is missing"});
    }
    console.log(TwitterTokenSecret);
    TLogin.callback({
        oauth_token: req.query.oauth_token,
        oauth_verifier: req.query.oauth_verifier
    }, TwitterTokenSecret, (err, user) => {
        if (err) {
            return res.status(400).send({message: err});
        }
        console.log(user);
        const createUser = new User({
            email: user.userName + '@epifb_gen.com',
            username: user.userName,
            password: bcrypt.hashSync(user.userTokenSecret, 8),
            access_token: user.userToken,
            access_token_secret: user.userTokenSecret
        });

        createUser.save((err) => {
            if (err) {
                return res.status(400).json({message: err});
            } else {
                const board = new Board({email: createUser.email});
                board.save((err) => {
                    if (err) return res.status(400).json({message: err});
                    console.log(createUser);
                    req.body.email = createUser.email;
                    req.body.password = user.userTokenSecret;

                    next();
                });
            }
        });
    });
})

exports.forgotPass = reqVerify(async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(404).send({message: "User Not found"});
    }
    if (user.access_token) {
        return res.status(400).send({message: "This account was created with Twitter"});
    }
    if (!req.body.endpoint) {
        return res.status(400).send({message: "Please provide a endpoint"});
    }

    require('crypto').randomBytes(12, function (err, buffer) {
        user.resetPasswordToken = buffer.toString('hex');
        user.save((err) => {
            if (err) {
                return res.status(400).send({message: err});
            } else {
                const endpointResetPass = req.body.endpoint + "?email=" + req.body.email + "&resetPasswordToken=" + user.resetPasswordToken;
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'epiflipboard@gmail.com',
                        pass: 'password'
                    }
                });

                const mailOptions = {
                    from: 'epiflipboard@gmail.com',
                    to: req.body.email,
                    subject: 'Reset password instructions',
                    html: '<h1>Hello, ' + user.username + '!' + '</h1><p>Click the link below to complete the process</p><a href=' + endpointResetPass + '>Reset password</a>'
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
                console.log("localhost:3000/api/auth/reset-password?email=" + req.body.email + "&resetPasswordToken=" + user.resetPasswordToken);
                return res.send({message: "Email sent to user."});
            }
        });
    });
});

exports.resetPass = reqVerify(async (req, res) => {
    const user = await User.findOne({email: req.query.email});
    if (!user) {
        return res.status(404).send({message: "User Not found"});
    }

    if (user.resetPasswordToken === req.query.resetPasswordToken) {
        user.updateOne({password: bcrypt.hashSync(req.body.password, 8), resetPasswordToken: undefined}, (err) => {
            if (err) {
                return res.status(400).send({message: err});
            } else {
                return res.send({message: "User password has been changed"});
            }
        });
    }
});

exports.updateUser = reqVerify(async (req, res) => {
    if (!req.query.username) {
        return res.status(400).send({message: "Please provide a username"});
    }
    let user = await User.findOne({email: req.userEmail});
    if (user) {
        user.updateOne({username: req.query.username}, (err) => {
            if (err)
                return res.status(400).send({message: err});
            else
                return res.send({message: "Username has been updated"});
        });
    } else {
        return res.status(404).send({message: "User Not found"});
    }
});