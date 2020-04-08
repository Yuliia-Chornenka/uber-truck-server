const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const router = express.Router();

const validate = require('../middleware/valid');
const userValid = require('../../validation-schema/auth');

router.post('/auth/register', validate(userValid.register),
    async (req, res) => {
      try {
        const {username, password, role} = req.body;

        const userExist = await User.findOne({username});
        if (userExist) {
          // eslint-disable-next-line max-len
          return res.status(409).json({message: 'This user is already registered'});
        }

        const hashPassword = await bcrypt.hash(password, 18);
        // eslint-disable-next-line max-len
        const user = new User({username, password: hashPassword, role: role.toLowerCase()});

        await user.save();

        res.status(200).json({status: 'User registered successfully'});
      } catch (e) {
        res.status(500).json({
          message: 'Something went wrong. Try again.',
          error: e,
        });
      }
    });


module.exports = router;
