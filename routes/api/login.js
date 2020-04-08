const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../../models/User');
const router = express.Router();

const validate = require('../middleware/valid');
const userValid = require('../../validation-schema/auth');

router.post('/auth/login', validate(userValid.login),
    async (req, res) => {
      try {
        const {username, password} = req.body;

        const user = await User.findOne({username});
        if (!user) {
          return res.status(401).json({message: 'User not found'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({message: 'Password incorrect'});
        }

        const token = jwt.sign(
            {
              userId: user.id,
              userEmail: user.email,
              username: user.username,
              userPosition: user.position,
              userPassword: user.password,
              userPhoto: user.photo,
            },
            config.get('jwtSecret'),
        );

        res.json({
          'status': 'User authenticated successfully',
          'token': token,
        });
      } catch (e) {
        res.status(500).json({
          message: 'Something went wrong. Try again',
          error: e,
        });
      }
    });

module.exports = router;
