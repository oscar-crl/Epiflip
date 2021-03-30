const User = require('../User/UserModel');

exports.twitterLogin = {
    consumerKey:           'twitter consumer key',
    consumerSecret:        'twitter consumer secret',
    callbackUrl:           'http://localhost:3000/api/auth/twitter-callback'
}

exports.twitterLoadUser = (async (userEmail) => {
    const user = await User.findOne({email: userEmail});
    if (!user) {return null;}
    return {
        consumer_key: 'twitter consumer key',
        consumer_secret: 'twitter consumer secret',
        access_token: user.access_token,
        access_token_secret: user.access_token_secret
    };
});