const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
const { v1: uuidv1 } = require('uuid');

// Load user model
const User = require('../models/User');
const facebookUser = require('../models/User');

function localStrategy(passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password,
        done) => {
        User.findOne({ where: { email: email } })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'No User Found' });
                }
                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                })
            })
    }));
    // Serializes (stores) user id into session upon successful
    // authentication
    passport.serializeUser((user, done) => {
        done(null, user.id); // user.id is used to identify authenticated user
    });
    // User object is retrieved by userId from session and
    // put into req.user
    passport.deserializeUser((userId, done) => {
        User.findByPk(userId)
            .then((user) => {
                done(null, user); // user object saved in req.session
            })
            .catch((done) => { // No user found, not stored in req.session
                console.log(done);
            });
    });
}
//still not saving info to database
passport.use(new FacebookStrategy({
    clientID: "239865340604409" ,
    clientSecret: "61403ba37105bae272df33dda173ec85" ,
    callbackURL: "/user/auth/facebook/callback",
    enableProof: true,
    profileFields: ['id', 'emails', 'name']
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOne({where:{facebookId: profile.id}})
        .then(user => {
            if (!user){
                User.create({id:uuidv1(),
                            name:profile.name.givenName + " " + profile.name.familyName,
                            facebookId:profile.id,
                            email:profile.emails[0].value,
                            facebookToken: accessToken,
                            isadmin : false,
                            confirmed : true,
                        }).then(user =>{
                            return cb(null,user);
                        })
            }else{
                return cb(null,user);
            }
        })
    }
));

module.exports = { localStrategy };