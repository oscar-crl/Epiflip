const jwt = require("jsonwebtoken");
const User = require("../User/UserModel");

module.exports = (req, res, next) => {

    try {
        let token = req.headers.authorization.replace("Bearer ", '');

        if (!token) {
            return res.status(403).send({
                status: 403,
                error: "Unauthorized",
                message: "No token provided",
                path: req.baseUrl
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (async (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    status: 401,
                    error: "Unauthorized",
                    message: "Unauthorized",
                    path: req.baseUrl
                });
            }
            req.userId = decoded.id;
            const user = await User.findOne({_id: req.userId});
            if (user) {
                req.userEmail = user.email;
                req.userName = user.name;
            } else {
                return res.status(404).send({message: "User Not Found"});
            }
            next();
        }));
    } catch (e) {
        return res.status(403).send({
            status: 403,
            error: "Unauthorized",
            message: "No token provided",
            path: req.baseUrl
        });
    }
};