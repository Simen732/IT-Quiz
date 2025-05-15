const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

// Generate stable device ID and name
const generateDeviceId = () => {
  return crypto.createHash('md5').update('template-app-vm').digest('hex');
};

module.exports = function(passport) {
  // Serialize and deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Check if we're using a private IP
  const appUrl = process.env.APP_URL || '';
  const isPrivateIp = appUrl.includes('10.') || appUrl.includes('192.168.') || appUrl.includes('172.');
  
  // Configure Google Strategy with more flexible callback URL
  const deviceId = generateDeviceId();
  const strategyOptions = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true  // Important for handling proxy setups like Nginx
  };

  passport.use(new GoogleStrategy(strategyOptions, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log("Google profile received:", {
        id: profile.id,
        email: profile.emails?.[0]?.value,
        name: profile.displayName
      });
      
      // Check if user exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }
      
      // Check if user exists with same email
      if (profile.emails && profile.emails.length > 0) {
        const userByEmail = await User.findOne({ email: profile.emails[0].value });
        
        if (userByEmail) {
          userByEmail.googleId = profile.id;
          await userByEmail.save();
          return done(null, userByEmail);
        }
      }
      
      // Create new user
      const username = `user_${Date.now().toString().slice(-6)}`;
      const email = profile.emails?.[0]?.value || `${username}@example.com`;
      
      const newUser = await User.create({
        googleId: profile.id,
        email: email,
        username: username,
        displayName: profile.displayName || profile.name?.givenName
      });
      
      done(null, newUser);
    } catch (err) {
      console.error('Google auth error:', err);
      done(err, null);
    }
  }));
};