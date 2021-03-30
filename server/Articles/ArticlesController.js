const Articles = require('./ArticlesModel');
const Board = require('../Board/BoardModel');
const reqVerify = require('../Utils/ReqVerify');

exports.upvote = reqVerify(async (req, res) => {
    if (!req.body.url)
        return res.status(400).send({message: "Please provide url of the article"});
    var board = await Board.findOne({email: req.userEmail});
    var article = await Articles.findOne({url: req.body.url});
    const likedArticle = {
        source: {
            id: req.body.sourceId,
            name: req.body.sourceName,
        },
        author: req.body.author,
        title: req.body.title,
        description: req.body.description,
        url: req.body.url,
        urlToImage: req.body.urlToImage,
        content: req.body.content
    };
    if (!article) {
        const newArticle = new Articles({
            url: req.body.url,
            upvote: 1,
            downvote: 0,
        });
        newArticle.save((err) => {
            if (err) {
                return res.status(400).json({message: err});
            }
        });
        board.upvote.push(likedArticle);
        board.save((err) => {
            if (err)
                return res.status(400).send({message: err});
        });
        return res.send({newArticle});
    } else {
        if (board.upvote.find(o => o.url === req.body.url)) {
            article.upvote -= 1;
            board.upvote.find(o => o.url === req.body.url ? o.remove() : null);
        } else if (board.downvote.find(o => o === req.body.url)) {
            article.downvote -= 1;
            board.downvote.remove(req.body.url);
            article.upvote += 1;
            board.upvote.push(likedArticle);
        } else {
            article.upvote += 1;
            board.upvote.push(likedArticle);
        }
        article.save((err) => {
            if (err) {
                return res.status(400).json({message: err});
            }
        });
        board.updateOne({upvote: board.upvote, downvote: board.downvote}, (err) => {
            if (err)
                return res.status(400).send({message: err});
        });
        return res.send(article);
    }
});

exports.downvote = reqVerify(async (req, res) => {
    if (!req.body.url)
        return res.status(400).send({message: "Please provide url of the article"});
    var board = await Board.findOne({email: req.userEmail});
    var article = await Articles.findOne({url: req.body.url});
    if (!article) {
        const newArticle = new Articles({
            url: req.body.url,
            upvote: 0,
            downvote: 1,
        });
        newArticle.save((err) => {
            if (err) {
                return res.status(400).json({message: err});
            }
        });
        board.downvote.push(req.body.url);
        board.save((err) => {
            if (err) {
                return res.status(400).json({message: err});
            }
        });
        return res.send(newArticle);
    } else {
        if (board.downvote.find(o => o === req.body.url)) {
            article.downvote -= 1;
            board.downvote.remove(req.body.url);
        } else if (board.upvote.find(o => o.url === req.body.url)) {
            article.upvote -= 1;
            board.upvote.find(o => o.url === req.body.url ? o.remove() : null);
            article.downvote += 1;
            board.downvote.push(req.body.url);
        } else {
            article.downvote += 1;
            board.downvote.push(req.body.url);
        }
        article.save((err) => {
            if (err) {
                return res.status(400).json({message: err});
            }
        });
        board.updateOne({downvote: board.downvote, upvote: board.upvote}, (err) => {
            if (err)
                return res.status(400).send({message: err});
        });
        return res.send(article);
    }
});