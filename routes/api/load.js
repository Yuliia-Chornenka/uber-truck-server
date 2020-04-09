const express = require('express');
const Load = require('../../models/Load');
const Truck = require('../../models/Truck');
const User = require('../../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

const validate = require('../middleware/valid');
const loadValid = require('../../validation-schema/load');


/* Load - Post load */
router.patch('/loads/:id/post',
    auth, async (req, res) => {
      try {
        const loadId = req.params.id;

        const load = await Load.findById(loadId);
        if (!load) {
          return res.status(500).json({message: 'Load does not exist'});
        }

        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'shipper') {
          return res.status(400).json({message: 'User is not a shipper'});
        }

        const fittingTruck = await Truck.findOne(
            {'sizes.width': {$gte: load.dimensions.width},
              'sizes.height': {$gte: load.dimensions.height},
              'sizes.length': {$gte: load.dimensions.length},
              'sizes.weight': {$gte: load.payload},
              'status': 'IS', 'assignedTo': {$ne: null}},
            (error) => {
              if (error) {
                // eslint-disable-next-line max-len
                return res.status(500).json({message: 'Failed to find a truck'});
              }
            });

        if (!fittingTruck) {
          return res.status(500).json({
            message: 'There is no fitting truck now',
          });
        }

        const logs = load.logs;

        await Truck.findByIdAndUpdate(fittingTruck._id, {status: 'OL'});
        await Load.findByIdAndUpdate(loadId,
            {
              assignedTo: fittingTruck.createdBy,
              truckId: fittingTruck._id,
              status: 'ASSIGNED',
              state: 'En route to pick up',
              logs: [...logs, {
                message: `url: ${req.url},
                method: ${req.method},
                state: State was changed to "En route to pick up",
                status: Status was changed to "ASSIGNED"`,
                time: Date.now(),
              }],
            });

        return res.status(200).json({
          'status': 'Load posted successfully',
          'assigned_to': fittingTruck.createdBy,
        });
      } catch (error) {
        return res.status(500).json({
          message: 'Load was not assigned', error: error,
        });
      }
    });

router.get('/loads',
    auth, async (req, res) => {
      try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (user.role === 'shipper') {
          const loads = await Load.find({createdBy: userId});
          return res.status(200).json({
            'status': 'Success',
            'loads': loads,
          });
        } else {
          const loads = await Load.find(
              {assignedTo: userId, status: 'ASSIGNED'});
          return res.status(200).json({
            'status': 'Success',
            'loads': loads,
          });
        }
      } catch (error) {
        return res.status(500).json({
          message: 'Can\'t retrieve loads', error: error,
        });
      }
    });


/*  Create a load by shipper  */
router.post('/loads', validate(loadValid.load), auth,
    async (req, res) => {
      try {
        const id = req.user.userId;
        const user = await User.findById(id);
        if (!user || user.role !== 'shipper') {
          return res.status(400).json({message: 'User is not a shipper'});
        }

        const options = req.body;

        const load = await new Load({
          ...options,
          status: 'NEW',
          createdBy: id,
          logs: [{
            message: `url: ${req.url},
                  method: ${req.method},`,
            time: Date.now(),
          }],
        });

        if (!load) {
          return res.status(500).json({message: 'Load was not created'});
        }

        load.save();
        return res.status(200).json({'status': 'Load created successfully'});
      } catch (error) {
        return res.status(500).json({
          message: 'Load wasn\'t created', error: error,
        });
      }
    });


/* Load - Change load state */
router.patch('/loads/:id/state', auth, async (req, res) => {
  try {
    const loadId = req.params.id;
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || user.role !== 'driver') {
      return res.status(500).json({message: 'User is not a driver'});
    }

    const load = await Load.findById(loadId);
    if (!load) {
      return res.status(500).json({message: 'Load doesnt exist'});
    }

    const truck = await Truck.findOne({createdBy: load.assignedTo});
    if (!truck) {
      return res.status(500).json({message: 'Truck was not found'});
    }

    const logs = load.logs;

    console.log('LOGS:', logs);

    switch (load.state) {
      case ('En route to pick up'): {
        await Load.findByIdAndUpdate(
            loadId,
            {
              state: 'Arrived to pick up',
              logs: [...logs, {
                message: `url: ${req.url},
                method: ${req.method},
                state: State was changed to "Arrived to pick up"`,
                time: Date.now(),
              }],
            },
        );

        return res.status(200).json({
          'status': 'Load status changed successfully',
        });
      }
      case ('Arrived to pick up'): {
        await Load.findByIdAndUpdate(
            loadId,
            {
              state: 'En route to delivery',
              logs: [...logs, {
                message: `url: ${req.url},
                method: ${req.method},
                state: State was changed to "En route to delivery"`,
                time: Date.now(),
              }],
            },
        );

        return res.status(200).json({
          'status': 'Load status changed successfully',
        });
      }
      case ('En route to delivery'): {
        await Load.findByIdAndUpdate(
            loadId,
            {
              state: 'Arrived to Delivery',
              status: 'SHIPPED',
              logs: [...logs, {
                message: `url: ${req.url},
              method: ${req.method},
              state: State was changed to "Arrived to Delivery"
              status: Status was changed to "SHIPPED"`,
                time: Date.now(),
              }],
            },
        );

        await Truck.findByIdAndUpdate(truck._id, {
          status: 'IS',
        });

        return res.status(200).json({
          'status': 'Load status changed successfully',
        });
      }
      case ('Arrived to delivery'): {
        return res.status(200).json({
          'status': 'Load has been already shipped',
        });
      }
      default: {
        return res.status(200).json({
          'status': 'Load status was not changed',
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Can\'t change load state', error: error,
    });
  }
});

/*  Pagination  */
router.get('/loads/:page/:limit', auth, async (req, res) => {
  try {
    const options = {
      sort: {createdTime: -1},
      page: req.params.page,
      limit: req.params.limit,
    };

    await Load.paginate(
        {createdBy: req.user.userId}, options, function(error, result) {
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
router.get('/loads/:page/:limit/:status', auth, async (req, res) => {
  try {
    const options = {
      sort: {createdTime: -1},
      page: req.params.page,
      limit: req.params.limit,
    };

    await Load.paginate(
        {createdBy: req.user.userId, status: req.params.status},
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


/*  Delete a load by shipper  */
router.delete('/loads/:id', auth, async (req, res) => {
  try {
    await Load.findByIdAndDelete(req.params.id, (error) => {
      if (error) {
        return res.status(500).json({message: 'Failed to delete'});
      }
    });

    res.json('Successfully delete a load');
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


/*  Update a load by shipper  */
router.patch('/loads/:id', auth, async (req, res) => {
  try {
    const {width, height, length, weight} = req.body;

    const updateLoad = await Load.findByIdAndUpdate(req.params.id,
        {'dimensions.width': width, 'dimensions.height': height,
          'dimensions.length': length, 'payload': weight},
        {new: true}, (error) => {
          if (error) {
            return res.status(500).json({message: 'Failed to update'});
          }
        });

    res.json(updateLoad);
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


module.exports = router;
