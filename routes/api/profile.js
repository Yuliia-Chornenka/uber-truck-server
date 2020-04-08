const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const avatar = require('../middleware/upload');
const router = express.Router();

const validate = require('../middleware/valid');
const profileValid = require('../../validation-schema/profile');

router.get('/profile', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});

router.delete('/profile', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.userId, (error) => {
      if (error) {
        return res.status(500).json({message: 'Failed to delete'});
      }
    });

    res.json('Successfully delete a user');
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});

/*   Change password   */
router.patch('/password',
    auth, validate(profileValid.password),
    async (req, res) => {
      try {
        // eslint-disable-next-line max-len
        const isMatch = await bcrypt.compare(req.body.oldPassword, req.user.userPassword);
        if (isMatch) {
          const newHashPassword = await bcrypt.hash(req.body.password, 18);

          await User.findByIdAndUpdate(req.user.userId,
              {password: newHashPassword}, {new: true}, (error) => {
                if (error) {
                  return res.status(500).json({message: 'Failed to update'});
                }
              });
          res.json({message: 'Password has has been updated'});
        } else {
          res.status(401).json({message: 'Password incorrect'});
        }
      } catch (e) {
        res.status(500).json({
          message: 'Something went wrong. Try again later',
          error: e,
        });
      }
    });

/*  Change avatar  */
router.patch('/profile', auth, async (req, res) => {
  try {
    await avatar(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        res.status(413).json('File size must not exceed 1 megabyte');
      } else {
        User.findByIdAndUpdate(req.user.userId,
            {photo: req.file.filename}, {new: true}, (error) => {
              if (error) {
                return res.status(500).json({message: 'Failed to update'});
              }
            });

        res.json(req.file.filename);
      }
    });
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later',
      error: e,
    });
  }
});


module.exports = router;
