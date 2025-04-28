const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  // Serialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.APP_URL}/auth/google/callback`,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        // If user exists, return the user
        return done(null, user);
      }
      
      // Check if user exists with same email
      const userByEmail = await User.findOne({ email: profile.emails[0].value });
      
      if (userByEmail) {
        // If user exists with email, link Google ID to existing account
        userByEmail.googleId = profile.id;
        await userByEmail.save();
        return done(null, userByEmail);
      }
      
      // Create new user from Google profile
      const newUser = await User.create({
        googleId: profile.id,
        email: profile.emails[0].value,
        username: `google_${profile.id.substring(0, 8)}`,
        displayName: profile.displayName || profile.name.givenName
      });
      
      done(null, newUser);
    } catch (err) {
      console.error('Google auth error:', err);
      done(err, null);
    }
  }));
};