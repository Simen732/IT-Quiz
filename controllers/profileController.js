const User = require('../models/User');
const argon2 = require('argon2');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Get profile page
exports.getProfile = async (req, res) => {
  try {
    res.render('profile', {
      title: 'Your Profile',
      user: req.user,
      message: req.query.message,
      messageType: req.query.messageType,
      errors: []
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Something went wrong while loading your profile!'
    });
  }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.redirect('/profile?message=No%20file%20was%20uploaded&messageType=danger');
    }

    // Update user's profile image field
    const user = await User.findById(req.user.id);
    
    // Delete old profile image if it's not the default
    if (user.profileImage !== 'default-avatar.png') {
      const oldImagePath = path.join(__dirname, '../public/uploads', user.profileImage);
      // Check if file exists before attempting to delete
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update with new image filename
    user.profileImage = req.file.filename;
    await user.save();

    res.redirect('/profile?message=Profile%20picture%20updated%20successfully&messageType=success');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Something went wrong while updating your profile picture!'
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('profile', {
        title: 'Your Profile',
        user: req.user,
        errors: errors.array(),
        message: 'Please correct the errors below.',
        messageType: 'danger'
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Skip password check for Google users who haven't set a password yet
    if (user.googleId && !user.password) {
      // Set new password for Google user
      user.password = await argon2.hash(newPassword);
      await user.save();
      
      return res.redirect('/profile?message=Password%20set%20successfully&messageType=success');
    }

    // For regular users, verify current password
    const isPasswordValid = await argon2.verify(user.password, currentPassword);
    
    if (!isPasswordValid) {
      return res.status(401).render('profile', {
        title: 'Your Profile',
        user: req.user,
        error: 'Current password is incorrect',
        errorField: 'currentPassword'
      });
    }

    // Hash and save new password
    user.password = await argon2.hash(newPassword);
    await user.save();

    res.redirect('/profile?message=Password%20changed%20successfully&messageType=success');
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { 
      title: 'Error',
      message: 'Something went wrong while changing your password!'
    });
  }
};