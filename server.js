'use strict';

const express       = require( 'express' );
const bodyParser    = require( 'body-parser' );
const session       = require( 'express-session' );
const passport      = require( 'passport' );
const localStrategy = require( 'passport-local' );
const mongo         = require( 'mongodb' ).MongoClient;
const objectID      = require( 'mongodb' ).ObjectID;
const fccTesting    = require( './freeCodeCamp/fcctesting.js' );

const app         = express( );

fccTesting( app ); //For FCC testing purposes
app.use( '/public', express.static( process.cwd( ) + '/public' ) );
app.use( bodyParser.json( ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( session( {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
} ) );
app.use( passport.initialize( ) );
app.use( passport.session( ) );

mongo.connect( process.env.DATABASE, { useNewUrlParser: true }, ( error,db ) => {
  if ( error ) {
    console.log( 'Database error: ' + error );
  } else {
    console.log( 'Successful database connection' );

    passport.use( new localStrategy(
      ( username,password,done ) => {
        db.db( ).collection( 'users' )
          .findOne( { username: username }, (error,user ) => {
            console.log( 'User '+ username +' attempted to log in.' );
            if ( error )                      return done( error );
            if ( !user )                      return done( null,false );
            if ( password !== user.password ) return done( null,false );
            return done( null,user );
          } );
      }
    ) );
    
    passport.serializeUser( ( user,done ) => {
      done( null, user._id );
    } );

    passport.deserializeUser( ( id,done ) => {
      db.db( ).collection( 'users' ).findOne(
        { _id: new objectID( id ) },
        ( error,doc ) => {
            done( null, doc);
        }
      );
    } );

    app.set( 'view engine', 'pug'         );
    app.set( 'views'      , './views/pug' );

  function ensureAuthenticated(req, res, next) {
          if (req.isAuthenticated()) {
              return next();
          }
          res.redirect('/');
        };
app.route('/')
          .get((req, res) => {
            res.render(process.cwd() + '/views/pug/index', { title:'Home page',message: 'login', showLogin: true, showRegistration: true});
          });
      
        app.route('/login')
          .post(passport.authenticate('local', { failureRedirect: '/' }),(req,res) => {
               res.redirect('/profile');
          });
      
        app.route('/profile')
          .get(ensureAuthenticated, (req, res) => {
               res.render(process.cwd() + '/views/pug/profile', {username: req.user.username});
          });
    
    app.route('/logout')
  .get((req, res) => {
      req.logout();
      res.redirect('/');
  });
    app.use((req, res, next) => {
  res.status(404)
    .type('text')
    .send('Not Found');
});
    

    app.listen( process.env.PORT || 3000, ( ) => {
      console.log( 'Listening on port ' + process.env.PORT );
    } );
    
    
   
    
  }
} );