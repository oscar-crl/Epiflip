const reqVerify = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message })
    }
};

module.exports = reqVerify;