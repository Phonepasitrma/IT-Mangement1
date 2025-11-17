const User = require('../models/user');

const UserController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll();
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
  },
  
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.getById(id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
  },
  
  createUser: async (req, res) => {
    try {
      const userData = req.body;
      const result = await User.create(userData);
      res.status(201).json({ message: 'User created successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error: error.message });
    }
  },
  
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      const result = await User.update(id, userData);
      res.status(200).json({ message: 'User updated successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error updating user', error: error.message });
    }
  },
  
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await User.delete(id);
      res.status(200).json({ message: 'User deleted successfully', result });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
  }
};

module.exports = UserController;
