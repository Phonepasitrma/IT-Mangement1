const User = require('../models/user');

const AuthController = {
  // Mock authentication for testing
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // For testing, we'll just check if the email exists
      const users = await User.getAll();
      const user = users.find(u => u.Email === email);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // In a real app, you would verify the password here
      // For now, we'll just return the user info
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.UserID,
          name: user.Name,
          role: user.Role,
          email: user.Email
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Error during login', error: error.message });
    }
  },
  
  // Mock current user endpoint
  getCurrentUser: async (req, res) => {
    try {
      // For testing, we'll return a mock user
      res.status(200).json({
        id: 1,
        name: 'Admin User',
        role: 'Admin',
        email: 'admin@company.com'
      });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching current user', error: error.message });
    }
  }
};

module.exports = AuthController;
