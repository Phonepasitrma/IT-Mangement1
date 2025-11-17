const Location = require('../models/location');

const LocationController = {
  getAllLocations: async (req, res) => {
    try {
      const locations = await Location.getAll();
      res.status(200).json(locations);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching locations', error: error.message });
    }
  },
  
  getLocationById: async (req, res) => {
    try {
      const { id } = req.params;
      const location = await Location.getById(id);
      
      if (!location) {
        return res.status(404).json({ message: 'Location not found' });
      }
      
      res.status(200).json(location);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching location', error: error.message });
    }
  },
  
  createLocation: async (req, res) => {
    try {
      const locationData = req.body;
      const result = await Location.create(locationData);
      res.status(201).json({ message: 'Location created successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error creating location', error: error.message });
    }
  },
  
  updateLocation: async (req, res) => {
    try {
      const { id } = req.params;
      const locationData = req.body;
      const result = await Location.update(id, locationData);
      res.status(200).json({ message: 'Location updated successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error updating location', error: error.message });
    }
  },
  
  deleteLocation: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await Location.delete(id);
      res.status(200).json({ message: 'Location deleted successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting location', error: error.message });
    }
  }
};

module.exports = LocationController;
