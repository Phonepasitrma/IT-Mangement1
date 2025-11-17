const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');

// CRUD operations
router.get('/', LocationController.getAllLocations);
router.get('/:id', LocationController.getLocationById);
router.post('/', LocationController.createLocation);
router.put('/:id', LocationController.updateLocation);
router.delete('/:id', LocationController.deleteLocation);

module.exports = router;
