const mongo         = require('mongodb').MongoClient;
const passport      = require('passport');
const session       = require('express-session');
const ObjectID      = require('mongodb').ObjectID;
const LocalStrategy = require('passport-local');
let comparePassword;
module.exports = function (app, db) {
  
  
/*mongo.connect(process.env.DATABASE, (err, connection) => {
  if (err) console.log('Database error: ' + err);
  else {
    console.log('Successful database connection');
    const db = connection.db();
*/
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser((id, done) => {
    db.collection('users').findOne(
      {_id: new ObjectID(id)},
      (err, doc) => done(null, doc)
    );
  });

  passport.use(new LocalStrategy((username, password, done) => {
    db.collection('users').findOne(
      { username: username },
      (err, user) => {
        if (err) done(err);
        else if (!user) done(null, false);
        else comparePassword(password, user.password, (err, match) => {
          if (err) done(err);
          else if (match) done(null, false);
          else done(null, user);
        });
      }
    );
  }));

    
     // }
//});
    
    
    
  }