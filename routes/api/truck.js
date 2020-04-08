const express = require('express');
const Truck = require('../../models/Truck');
const User = require('../../models/User');
const router = express.Router();
const auth = require('../middleware/auth');

/* Truck - Create truck */
router.post('/trucks', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user || user.role !== 'driver') {
      return res.status(500).json({
        message: 'User is not a driver',
      });
    }

    const {type} = req.body;

    switch (type) {
      case ('SPRINTER'): {
        const sizes = {
          width: 170,
          height: 250,
          length: 300,
          weight: 1700,
        };

        const truck = new Truck({
          createdBy: userId,
          assignedTo: null,
          status: 'IS',
          sizes,
          type,
        });

        await truck.save();
        return res.status(200).json({
          'status': 'Truck created successfully',
        });
      }
      case ('SMALL STRAIGHT'): {
        const sizes = {
          width: 170,
          height: 250,
          length: 500,
          weight: 2500,
        };

        const truck = new Truck({
          createdBy: userId,
          assignedTo: null,
          status: 'IS',
          sizes,
          type,
        });

        await truck.save();
        return res.status(200).json({
          'status': 'Truck created successfully',
        });
      }
      case ('LARGE STRAIGHT'): {
        const sizes = {
          width: 200,
          height: 350,
          length: 700,
          weight: 4000,
        };

        const truck = new Truck({
          createdBy: userId,
          assignedTo: null,
          status: 'IS',
          sizes,
          type,
        });

        await truck.save();
        return res.status(200).json({
          'status': 'Truck created successfully',
        });
      }
      default: {
        return res.status(500).json({
          message: 'Truck wasn\'t created',
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: 'Truck wasn\'t created', error: error,
    });
  }
});


router.delete('/trucks/:type', auth, async (req, res) => {
  try {
    await Truck.findOneAndDelete(
        {type: req.params.type, createdBy: req.user.userId},
        (error) => {
          if (error) {
            return res.status(500).json({message: 'Failed to delete'});
          }
        });

    res.json('Successfully delete a truck');
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


router.get('/trucks', auth, async (req, res) => {
  try {
    const trucks = await Truck.find({createdBy: req.user.userId});
    res.json(trucks);
  } catch (e) {
    res.status(500).json({
      message: 'Something went wrong. Try again later.',
      error: e,
    });
  }
});


router.get('/trucks', auth, async (req, res) => {
  try {
    const id = req.user.userId;
    const user = await User.findById(id);
    if (!user || user.role !== 'driver') {
      return res.status(500).json({
        message: 'User is not a driver',
      });
    }

    const trucks = await Truck.find({createdBy: id});

    return res.status(200).json({
      'status': 'Trucks were got successfully',
      'trucks': trucks,
    });
  } catch (error) {
    return res.status(500).json(
        {message: 'Can\'t retrieve trucks', error: error},
    );
  }
});

/* Truck - Assign driver to truck with specified id */
router.patch('/trucks/:id/assign', auth, async (req, res) => {
  try {
    const truckId = req.params.id;
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user || user.role !== 'driver') {
      return res.status(500).json({
        message: 'User is not a driver',
      });
    }

    const someTruck = await Truck.findById(truckId);
    const isBusy = await Truck.findOne({
      createdBy: someTruck.createdBy, status: 'OL',
    });

    if (isBusy) {
      return res.status(500).json({
        message: 'Driver is busy, you can not change any info',
      });
    }

    await Truck.findOneAndUpdate({
      createdBy: someTruck.createdBy, assignedTo: req.user.userId},
    {assignedTo: null},
    );
    await Truck.findByIdAndUpdate(truckId, {assignedTo: req.user.userId});

    return res.status(200).json({
      'status': 'Truck assigned successfully',
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Truck wasn\'t assigned', error: error,
    });
  }
});


module.exports = router;
