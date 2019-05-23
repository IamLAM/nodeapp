'use strict';

const routes = require('./routes.js');
const auth = require('./auth.js');
const express     = require('express');
const bodyParser  = require('body-parser');
const fccTesting  = require('./freeCodeCamp/fcctesting.js');
const session     = require('express-session');
const mongodb     = require('mongodb');
const mongo = require('mongodb').MongoClient;
const GitHubStrategy = require('passport-github').Strategy;
// const io = require('socket.io')(http);
const LocalStrategy = require('passport-local');
const passport    = require('passport');
const bcrypt     = require('bcrypt');

const app = express();








const cors = require('cors');
app.use(cors());

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// set 'pug' as the 'view-engine'. 
app.set('view engine', 'pug');

mongo.connect(process.env.DATABASE, (err, db) => {
    if(err) {
        console.log('Database error: ' + err);
    } else {
      console.log('Successful database connection');
      
      passport.use(new GitHubStrategy({
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: 'https://nodesapp.glitch.me/auth/github/callback'
        },
        function(accessToken, refreshToken, profile, cb) {
            console.log(profile);
            //Database logic here with callback containing our user object
            db.collection('socialusers').findAndModify(
              {id: profile.id},
              {},
              {$setOnInsert:{
                  id: profile.id,
                  name: profile.displayName || 'John Doe',
                  photo: profile.photos[0].value || '',
                  email: profile.emails[0].value || 'No public email',
                  created_on: new Date(),
                  provider: profile.provider || ''
              },$set:{
                  last_login: new Date()
              },$inc:{
                  login_count: 1
              }},
              {upsert:true, new: true},
              (err, doc) => {
                  return cb(null, doc.value);
              }
          );
        }
      ));
      
      auth(app, db)
      routes(app, db)
  
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: 'https://nodesapp.glitch.me/auth/github/callback'
      },
      function(accessToken, refreshToken, profile, cb) {
          console.log(profile);
          //Database logic here with callback containing our user object
          db.collection('socialusers').findAndModify(
            {id: profile.id},
            {},
            {$setOnInsert:{
                id: profile.id,
                name: profile.displayName || 'John Doe',
                photo: profile.photos[0].value || '',
                email: profile.emails[0].value || 'No public email',
                created_on: new Date(),
                provider: profile.provider || ''
            },$set:{
                last_login: new Date()
            },$inc:{
                login_count: 1
            }},
            {upsert:true, new: true},
            (err, doc) => {
                return cb(null, doc.value);
            }
        );
      }
    ));
      app.route('/auth/github')
        .get((req, res) => {
          res.redirect(passport.authenticate('github'))
        });

      app.route('/auth/github/callback')
        .get(passport.authenticate('github', { failureRedirect: '/' }),(req,res) => {
             res.redirect('/profile');
        });
      
      app.listen(process.env.PORT || 3000, () => {
          console.log("Listening on port " + process.env.PORT);
        });

    }
});


