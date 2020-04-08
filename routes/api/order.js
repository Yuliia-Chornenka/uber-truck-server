const express = require('express');
const Truck = require('../../models/Truck');
const Load = require('../../models/Load');
const User = require('../../models/User');
const router = express.Router();
const auth = require('../middleware/auth');


/*  Pagination  */
router.get('/orders/:page/:limit', auth, async (req, res) => {
  try {
    const options = {
      sort: {createdTime: -1},
      page: req.params.page,
      limit: req.params.limit,
    };

    await Load.paginate(
        {assignedTo: req.user.userId}, options, function(error, result) {
          if (error) {
            // eslint-disable-next-line max-len
            res.status(500).json({message: 'Something went wrong. Try again later.'});
          } else {
            res.json(result);
          }
        });
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});

/*  Filter  */
router.get('/orders/:page/:limit/:status', auth, async (req, res) => {
  try {
    const options = {
      sort: {createdTime: -1},
      page: req.params.page,
      limit: req.params.limit,
    };

    await Load.paginate(
        {assignedTo: req.user.userId, status: req.params.status},
        options, function(error, result) {
          if (error) {
            // eslint-disable-next-line max-len
            res.status(500).json({message: 'Something went wrong. Try again later.'});
          } else {
            res.json(result);
          }
        });
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


router.get('/orders/:id', auth, async (req, res) => {
  try {
    const load = await Load.findById(req.params.id);
    res.json(load);
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


module.exports = router;
