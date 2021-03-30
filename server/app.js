var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var jwt = require('express-jwt')
var bodyParser = require('body-parser')
var cors = require('cors')

require('dotenv').config();
require("./Config/Database")();

var authRouter = require('./User/User');
var boardRouter = require('./Board/Board');
var articlesRouter = require('./Articles/Articles');

var app = express();

app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json())

app.use("/api/auth", authRouter);
app.use("/api/board", boardRouter);
app.use("/api/articles", articlesRouter);

app.use(
    jwt({ secret: process.env.JWT_SECRET }).unless({
      path: [
        'api/auth/signup',
        'api/auth/login',
        'api/auth/forgot-password',
        'api/auth/reset-password',
        'api/auth/twitter-callback',
      ],
    }),
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
