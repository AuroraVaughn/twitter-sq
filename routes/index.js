'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
const client = require('../db/index');

module.exports = function makeRouterWithSockets(io) {

    // const allTweetsQ = client.query('SELECT * FROM tweets', function(err, result) {
    //     if (err) return next(err); // pass errors to Express
    //     var tweets = result.rows;
    //     res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    // })


    // a reusable function
    function respondWithAllTweets(req, res, next) {
        client.query('SELECT * FROM tweets', function(err, result) {
            if (err) return next(err); // pass errors to Express
            var tweets = result.rows;
            res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
        });
        // var allTheTweets = tweetBank.list();
        // res.render('index', {
        //     title: 'Twitter.js',
        //     tweets: allTheTweets,
        //     showForm: true
        // });
    }

    // here we basically treet the root view and tweets view as identical
    router.get('/', respondWithAllTweets);
    router.get('/tweets', respondWithAllTweets);

    // single-user page
    //(SELECT id FROM USERS WHERE USER.NAME = req.params.username)
    router.get('/users/:username', function(req, res, next) {
        console.log(req.params.username);
        client.query(`
          SELECT * FROM tweets
            WHERE tweets.user_id 
            IN (
              SELECT users.id 
              FROM users 
              WHERE users.name = $1
            )`, [req.params.username],
            function(err, result) {
                if (err) return next(err); // pass errors to Express
                var tweets = result.rows;
                res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
            });


        // var tweetsForName = tweetBank.find({ name: req.params.username });
        // res.render('index', {
        //     title: 'Twitter.js',
        //     tweets: tweetsForName,
        //     showForm: true,
        //     username: req.params.username
        // });
    });

    // single-tweet page
    router.get('/tweets/:id', function(req, res, next) {
        client.query(`
      SELECT * FROM tweets
        WHERE tweets.id = $1 
        `, [Number(req.params.id)],
            function(err, result) {
                if (err) return next(err); // pass errors to Express
                var tweets = result.rows;
                res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
            });
    });

    // create a new tweet
    router.post('/tweets', function(req, res, next) {
        console.log(req.body);
        client.query('SELECT id FROM users WHERE name = $1', [req.body.name], function(err, result) {
            console.log('query id from users done');
            if (err) return next(err);
            // either 1 row
            console.log(result);
            if (result.rowCount === 1) {
                //result.fields[0].Field.name
                client.query(`INSERT INTO tweets(user_id,content) VALUES ($1,$2)`, [result.rows[0].id, req.body.content], function(err, result) {
                    console.log(result);
                    if (err) return next(err);
                    // client.query(`SELECT * FROM tweets WHERE`, function(err, result) {
                    // });
                    // io.sockets.emit('new_tweet', newTweet);
                    res.redirect('/');
                });
            } else {
                res.send('nothing yet')
            }
            console.log('end insert query') // no rows
        });
        console.log('end router.post')

    });


    //   client.query(`
    // INSERT INTO  tweets(user_id,content)
    // VALUES ($1,$2)

    //   `, [Number(req.params.id, req.params.content)],
    //       function(err, result) {
    //           if (err) return next(err); // pass errors to Express
    //           var tweets = result.rows;
    //           res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    //       });

    // var newTweet = tweetBank.add(req.body.name, req.body.content);
    // io.sockets.emit('new_tweet', newTweet);
    // res.redirect('/');
    // });

    // // replaced this hard-coded route with general static routing in app.js
    // router.get('/stylesheets/style.css', function(req, res, next){
    //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
    // });
    return router;
}