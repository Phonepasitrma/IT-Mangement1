const express = require('express');
const router = express.Router();
const Config = require('../models/config');

// Main Categories routes
router.get('/maincategories', async (req, res) => {
  try {
    const categories = await Config.getAllMainCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching main categories', error: error.message });
  }
});

router.post('/maincategories', async (req, res) => {
  try {
    const result = await Config.createMainCategory(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating main category', error: error.message });
  }
});

router.put('/maincategories/:id', async (req, res) => {
  try {
    const result = await Config.updateMainCategory(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating main category', error: error.message });
  }
});

router.delete('/maincategories/:id', async (req, res) => {
  try {
    const result = await Config.deleteMainCategory(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting main category', error: error.message });
  }
});

// Categories routes
router.get('/categories', async (req, res) => {
  try {
    const categories = await Config.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const result = await Config.createCategory(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

router.put('/categories/:id', async (req, res) => {
  try {
    const result = await Config.updateCategory(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    const result = await Config.deleteCategory(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

// Departments routes
router.get('/departments', async (req, res) => {
  try {
    const departments = await Config.getAllDepartments();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
});

router.post('/departments', async (req, res) => {
  try {
    const result = await Config.createDepartment(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error: error.message });
  }
});

router.put('/departments/:id', async (req, res) => {
  try {
    const result = await Config.updateDepartment(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error: error.message });
  }
});

router.delete('/departments/:id', async (req, res) => {
  try {
    const result = await Config.deleteDepartment(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
});

// Companies routes
router.get('/companies', async (req, res) => {
  try {
    const companies = await Config.getAllCompanies();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error: error.message });
  }
});

router.post('/companies', async (req, res) => {
  try {
    const result = await Config.createCompany(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating company', error: error.message });
  }
});

router.put('/companies/:id', async (req, res) => {
  try {
    const result = await Config.updateCompany(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating company', error: error.message });
  }
});

router.delete('/companies/:id', async (req, res) => {
  try {
    const result = await Config.deleteCompany(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company', error: error.message });
  }
});

// Users routes
router.get('/users', async (req, res) => {
  try {
    const users = await Config.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const result = await Config.createUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const result = await Config.updateUser(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const result = await Config.deleteUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
