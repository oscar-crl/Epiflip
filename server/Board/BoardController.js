const Board = require('./BoardModel');
const Articles = require('../Articles/ArticlesModel');
const axios = require('axios');
const reqVerify = require('../Utils/ReqVerify');
var Twit = require('twit');
var config = require('../Utils/TwitterConf');
var moment = require('moment');

exports.home = reqVerify(async (req, res) => {
    let response = await axios.get('https://newsapi.org/v2/top-headlines', {
        params: {country: req.query.country ? req.query.country : 'us'},
        headers: {'Authorization': 'Bearer ' + process.env.NEWS_API_KEY}
    });
    for (const article of response.data.articles) {
        const tmp = await Articles.findOne({url: article.url});
        article.publishedAt = moment(article.publishedAt).fromNow();
        article.upvote = tmp ? tmp.upvote : 0;
        article.downvote = tmp ? tmp.downvote : 0;
    }
    return res.send(response.data);
});

exports.getUserFav = reqVerify(async (req, res) => {
    let board;
    if (req.body.email)
        board = await Board.findOne({email: req.body.email});
    else
        board = await Board.findOne({email: req.userEmail});
    if (board) {
        return res.send({board})
    } else {
        return res.status(404).send({message: "User Not found"});
    }
});

exports.addUserFav = reqVerify(async (req, res) => {
    let board = await Board.findOne({email: req.userEmail});
    if (board) {
        if (req.query.tag)
            board.tags.push(req.query.tag);
        if (req.query.source)
            board.sources.push(req.query.source);
        if (req.body.bio)
            board.bio = req.body.bio;
        board.save((err) => {
            if (err)
                return res.status(400).send({message: err});
            else
                return res.send({board});
        });
    } else {
        return res.status(404).send({message: "User Not found"});
    }
});

exports.followUser = reqVerify(async (req, res) => {
    let userBoard = await Board.findOne({email: req.userEmail});
    let followerBoard = await Board.findOne({email: req.body.email});
    if (!userBoard || !followerBoard || (req.userEmail === req.body.email)) {
        return res.status(404).send({message: "User Not found"});
    }
    if (userBoard.followed.find(o => o === req.body.email)) {
        userBoard.followed.remove(req.body.email);
        followerBoard.followers.remove(req.userEmail);
        res.send({message: "User unfollow " + req.body.email + " now"})
    } else {
        userBoard.followed.push(req.body.email);
        followerBoard.followers.push(req.userEmail);
        res.send({message: "User follow " + req.body.email + " now"})
    }
    userBoard.save((err) => {
        if (err)
            return res.status(400).send({message: err});
    });
    followerBoard.save((err) => {
        if (err)
            return res.status(400).send({message: err});
    });
})

exports.putUserFav = reqVerify(async (req, res) => {
    let board = await Board.findOne({email: req.userEmail});
    if (board) {
        if (req.query.tag && req.query.tagToReplace)
            board.tags.replace(req.query.tagToReplace, req.query.tag);
        if (req.query.source && req.query.sourceToReplace)
            board.sources.replace(req.query.sourceToReplace, req.query.source);
        board.updateOne({tags: board.tags, sources: board.sources}, (err) => {
            if (err)
                return res.status(400).send({message: err});
            else
                return res.send({board});
        });
    } else {
        return res.status(404).send({message: "User Not found"});
    }
});

exports.delUserFav = reqVerify(async (req, res) => {
    let board = await Board.findOne({email: req.userEmail});
    if (board) {
        if (req.query.tag)
            board.tags.remove(req.query.tag);
        if (req.query.source)
            board.sources.remove(req.query.source);
        board.updateOne({tags: board.tags, sources: board.sources}, (err) => {
            if (err)
                return res.status(400).send({message: err});
            else
                return res.send({board});
        });
    } else {
        return res.status(404).send({message: "User Not found"});
    }
});

exports.searchTopHeadlines = reqVerify(async (req, res) => {
    let uriReqEntry = 'https://newsapi.org/v2/top-headlines?';
    let uriReqParams = req.url.split('?')[1];
    if (!uriReqParams) {
        return res.status(400).send({message: "Please provide at least one parameter"});
    }
    uriReqParams = uriReqParams.replace('query=', 'q=').replace('tag=', 'category=');
    console.log(uriReqEntry + uriReqParams);
    let response = await axios.get(uriReqEntry + uriReqParams, {
        headers: {'Authorization': 'Bearer ' + process.env.NEWS_API_KEY}
    });
    for (const article of response.data.articles) {
        const tmp = await Articles.findOne({url: article.url});
        article.publishedAt = moment(article.publishedAt).fromNow();
        article.upvote = tmp ? tmp.upvote : 0;
        article.downvote = tmp ? tmp.downvote : 0;
    }
    return res.send(response.data);
});

exports.searchEverything = reqVerify(async (req, res) => {
    let uriReqEntry = 'https://newsapi.org/v2/everything?';
    let uriReqParams = req.url.split('?')[1];
    if (!uriReqParams) {
        return res.status(400).send({message: "Please provide at least one parameter"});
    }
    uriReqParams = uriReqParams.replace('query=', 'q=').replace('tag=', 'category=');
    let response = await axios.get(uriReqEntry + uriReqParams, {
        headers: {'Authorization': 'Bearer ' + process.env.NEWS_API_KEY}
    });
    for (const article of response.data.articles) {
        const tmp = await Articles.findOne({url: article.url});
        article.publishedAt = moment(article.publishedAt).fromNow();
        article.upvote = tmp ? tmp.upvote : 0;
        article.downvote = tmp ? tmp.downvote : 0;
    }
    return res.send(response.data);
});

exports.searchSources = reqVerify(async (req, res) => {
    let uriReqEntry = 'https://newsapi.org/v2/sources';
    let uriReqParams = req.url.split('?')[1];
    if (uriReqParams) {
        uriReqParams = uriReqParams.replace('tag=', 'category=');
        uriReqEntry += '?' + uriReqParams;
    }
    let response = await axios.get(uriReqEntry, {
        headers: {'Authorization': 'Bearer ' + process.env.NEWS_API_KEY}
    });
    return res.send(response.data);
});

exports.searchTags = ((req, res) => {
    const featuredTags = ["business", "entertainment", "general", "health", "science", "sports", "technology"];
    return res.send({tags: featuredTags});
});

exports.addMagazine = reqVerify(async (req, res) => {
    let board = await Board.findOne({email: req.userEmail});
    if (board && req.query.name) {
        if (board.magazines.find(o => o.name === req.query.name))
            return res.status(400).send({message: "Magazine already exists"});
        board.magazines.push({name: req.query.name, privacy: req.query.privacy});
        board.save((err) => {
            if (err)
                return res.status(400).send({message: err});
            else
                return res.send(board.magazines);
        });
    } else {
        return res.status(404).send({message: "User Not found"});
    }
});

exports.addArticle = reqVerify(async (req, res) => {
    let board = await Board.findOne({email: req.userEmail});
    if (!board)
        return res.status(404).send({message: "User Not found"});
    if (!board.magazines.find(o => o.name === req.params.id))
        return res.status(404).send({message: "Magazine Not found"});
    const article = {
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
    board.magazines.find(o => o.name === req.params.id ? o.articles.push(article) : null);
    board.updateOne({magazines: board.magazines}, (err) => {
        if (err)
            return res.status(400).send({message: err});
        else
            return res.send(board.magazines);
    });
});

exports.getArticles = reqVerify(async (req, res) => {
    let board = await Board.findOne({email: req.userEmail});
    let tmp;
    if (req.body.email) {
        let followedBoard = await Board.findOne({email: req.body.email});
        tmp = followedBoard.magazines.find(o => {
            if (o.name === req.params.id && o.privacy === 'public') {
                return true;
            } else if (o.name === req.params.id && o.privacy === 'followers') {
                if (board.followed.find(a => a === req.body.email))
                    return true;
            }
        });
    } else {
        tmp = board.magazines.find(o => o.name === req.params.id)
    }
    if (!board)
        return res.status(404).send({message: "User Not found"});
    if (!tmp)
        return res.status(404).send({message: "Magazine Not found or Private"});
    for (const article of tmp.articles) {
        const tmp = await Articles.findOne({url: article.url});
        if (article.date)
            article.time = moment(article.date).fromNow();
        article.upvote = tmp ? tmp.upvote : 0;
        article.downvote = tmp ? tmp.downvote : 0;
    }
    return res.send(tmp);
});

exports.delMagazineOrArticle = reqVerify(async (req, res) => {
    let board = await Board.findOne({email: req.userEmail});
    if (!board)
        return res.status(404).send({message: "User Not found"});
    let tmp = board.magazines.find(o => o.name === req.params.id)
    if (!tmp)
        return res.status(404).send({message: "Magazine Not found"});
    if (req.body.url) {
        for (const article of tmp.articles) {
            if (article.url === req.body.url)
                article.remove();
        }
    } else {
        board.magazines.find(o => o.name === req.params.id).remove();
    }
    board.updateOne({magazines: board.magazines}, (err) => {
        if (err)
            return res.status(400).send({message: err});
        else
            return res.send({board});
    });
});


exports.searchTweets = reqVerify(async (req, res) => {
    if (!req.query.tag) {
        return res.status(400).send({message: "Please provide a tag to search"});
    }
    const T = new Twit(await config.twitterLoadUser(req.userEmail));
    T.get('search/tweets', {q: req.query.tag, result_type: "popular"}, function (error, tweets, response) {
        if (error) {
            return res.status(400).send({message: error});
        }
        return res.send(tweets);
    });
});

exports.likeTweet = reqVerify(async (req, res) => {
    if (!req.query.id) {
        return res.status(400).send({message: "No id present"});
    }
    const T = new Twit(await config.twitterLoadUser(req.userEmail));
    T.post('favorites/create', {id: req.query.id}, function (error, tweets, response) {
        if (error) {
            return res.status(400).send({message: error});
        }
        return res.send(tweets);
    });
});

exports.retweetTweet = reqVerify(async (req, res) => {
    if (!req.query.id) {
        return res.status(400).send({message: "No id present"});
    }
    const T = new Twit(await config.twitterLoadUser(req.userEmail));
    T.post('statuses/retweet/:id', {id: req.query.id}, function (error, tweets, response) {
        if (error) {
            return res.status(400).send({message: error});
        }
        return res.send(tweets);
    });
});