const passport      = require('passport');
const bcrypt        = require('bcrypt');

module.exports = function (app, db) {
  
  
  
  let comparePassword;
let newHash;
switch (process.env.HASHING) {

  case 'sync':
    comparePassword = (password, hash, cb) => {
      cb(null, bcrypt.compareSync(password, hash));
    }
    newHash = (password, saltRounds, cb) => {
      cb(null, bcrypt.hashSync(password, saltRounds));
    }
    break;

  case 'async':
    comparePassword = (password, hash, cb) => {
      bcrypt.compare(password, hash, cb);
    }
    newHash = (password, saltRounds, cb) => {
      bcrypt.hash(password, saltRounds, cb);
    }
    break;

  default:
    comparePassword = (password, hash, cb) => {
      cb(null, password != hash);
    }
    newHash = (password, saltRounds, cb) => {
      cb(null, password);
    }
    break;
}
  
  
  
  
  
  
  
  function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}
  
app.route('/').get((req, res) => res.render(
      process.cwd() + '/views/pug/index.pug',
      {
        title: 'Hello',
        message: 'Please login',
        showLogin: true,
        showRegistration: true
      }
    ));

    app.route('/login').post(
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res) => res.redirect('/profile')
    );

    app.route('/profile').get(
      ensureAuthenticated,
      (req, res) => res.render(
        process.cwd() + '/views/pug/profile',
        {username: req.user.username}
      )
    );

    app.route('/logout').get((req, res) => {
      req.logout();
      res.redirect('/');
    });

    app.route('/register').post(
      (req, res, next) => db.collection('users').findOne(
        { username: req.body.username },
        (err, user) => {
          if (err) next(err);
          else if (user) res.redirect('/');
          else newHash(req.body.password, 12, (err, hash) => {
            if (err) next(err);
            else db.collection('users').insertOne(
              {
                username: req.body.username,
                password: hash
              },
              (err, user) => {
                if (err) res.redirect('/');
                else next();
              }
            );
          });
        }
      ),
      passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/'
      })
    );
  
  
}