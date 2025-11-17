const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/database');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const pool = await poolPromise;
    
    // Find user by username
    const result = await pool.request()
      .input('username', sql.NVarChar(100), username)
      .query(`
        SELECT u.*, m.Username as ManagerName
        FROM Users u
        LEFT JOIN Users m ON u.ManagerID = m.UserID
        WHERE u.Username = @username AND u.IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result.recordset[0];

    // Check password
    // In production, use bcrypt.compare(password, user.Password)
    if (password !== user.Password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if password change is required
    const requirePasswordChange = user.RequirePasswordChange || false;

    // Remove sensitive data
    delete user.Password;

    // In production, generate a JWT token here
    const token = `mock-token-${user.UserID}`;

    res.status(200).json({
      message: 'Login successful',
      user: {
        userId: user.UserID,
        employeeId: user.EmployeeID,
        username: user.Username,
        email: user.Email,
        department: user.Department,
        position: user.Position,
        userType: user.UserType,
        managerId: user.ManagerID,
        managerName: user.ManagerName,
      },
      token,
      requirePasswordChange,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user (verify token)
router.get('/me', async (req, res) => {
  try {
    // In production, verify JWT token from Authorization header
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Extract user ID from token (in production, decode JWT)
    const userId = token.replace('mock-token-', '');

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT u.*, m.Username as ManagerName
        FROM Users u
        LEFT JOIN Users m ON u.ManagerID = m.UserID
        WHERE u.UserID = @userId AND u.IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = result.recordset[0];
    delete user.Password;

    res.status(200).json({
      userId: user.UserID,
      employeeId: user.EmployeeID,
      username: user.Username,
      email: user.Email,
      department: user.Department,
      position: user.Position,
      userType: user.UserType,
      managerId: user.ManagerID,
      managerName: user.ManagerName,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Failed to get user', error: error.message });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  // In production, invalidate the token
  res.status(200).json({ message: 'Logout successful' });
});

// Change password endpoint
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const pool = await poolPromise;
    
    // Get user
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Users WHERE UserID = @userId AND IsActive = 1');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.recordset[0];

    // Verify current password
    // In production, use bcrypt.compare(currentPassword, user.Password)
    if (currentPassword !== user.Password) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    // In production, hash the new password with bcrypt
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('newPassword', sql.NVarChar(255), newPassword)
      .query(`
        UPDATE Users 
        SET Password = @newPassword, 
            RequirePasswordChange = 0,
            UpdatedAt = GETDATE() 
        WHERE UserID = @userId
      `);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password', error: error.message });
  }
});

module.exports = router;
