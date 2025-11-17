import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import api from '../../services/api';

interface User {
  UserID: number;
  EmployeeID: string;
  Username: string;
  Email: string;
  Department: string;
  Position?: string;
  UserType: string;
  IsActive: boolean;
  ManagerID?: number;
  ManagerName?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

const UserController: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    employeeId: '',
    username: '',
    email: '',
    department: '',
    position: '',
    userType: 'User',
    isActive: true,
    managerId: null as number | null,
    password: '',
    requirePasswordChange: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get<User[]>('/config/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const handleShowModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        employeeId: user.EmployeeID,
        username: user.Username,
        email: user.Email,
        department: user.Department,
        position: user.Position || '',
        userType: user.UserType,
        isActive: user.IsActive,
        managerId: user.ManagerID || null,
        password: '',
        requirePasswordChange: false,
      });
    } else {
      setEditingUser(null);
      setFormData({
        employeeId: '',
        username: '',
        email: '',
        department: '',
        position: '',
        userType: 'User',
        isActive: true,
        managerId: null,
        password: '',
        requirePasswordChange: true,
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password for new users
    if (!editingUser && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    try {
      if (editingUser) {
        await api.put(`/config/users/${editingUser.UserID}`, formData);
        setSuccess('User updated successfully' + (formData.password ? ' with new password' : ''));
      } else {
        await api.post('/config/users', formData);
        setSuccess('User created successfully. ' + (formData.requirePasswordChange ? 'User must change password on first login.' : ''));
      }
      fetchUsers();
      setTimeout(() => {
        handleCloseModal();
        setSuccess('');
      }, 1500);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.delete(`/config/users/${id}`);
        setSuccess('User deactivated successfully');
        fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>User Management</h4>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <i className="bi bi-person-plus me-2"></i>
          Add User
        </Button>
      </div>

      <Alert variant="info" className="mb-3">
        <i className="bi bi-info-circle me-2"></i>
        <strong>Note:</strong> New users are created with default password same as their username. 
        Users should change their password after first login. This is for user account management only - 
        separate from system login authentication.
      </Alert>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Department</th>
            <th>Position</th>
            <th>User Type</th>
            <th>Manager</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center">No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.UserID}>
                <td>{user.EmployeeID}</td>
                <td>{user.Username}</td>
                <td>{user.Email}</td>
                <td>{user.Department}</td>
                <td>{user.Position || '-'}</td>
                <td>
                  <Badge bg={user.UserType === 'Admin' ? 'danger' : 'primary'}>
                    {user.UserType}
                  </Badge>
                </td>
                <td>{user.ManagerName || '-'}</td>
                <td>
                  <Badge bg={user.IsActive ? 'success' : 'secondary'}>
                    {user.IsActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleShowModal(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user.UserID)}
                    disabled={!user.IsActive}
                  >
                    Deactivate
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? 'Edit User' : 'Add New User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Employee ID <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    placeholder="e.g., EMP001"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Username <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="e.g., john.doe"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john.doe@company.com"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Department <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    required
                    placeholder="e.g., IT, Sales, HR"
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Position</Form.Label>
                  <Form.Control
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g., IT Manager, Developer"
                  />
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>User Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Viewer">Viewer</option>
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Label>Manager</Form.Label>
                  <Form.Select
                    name="managerId"
                    value={formData.managerId || ''}
                    onChange={handleChange}
                  >
                    <option value="">No Manager</option>
                    {users
                      .filter(u => u.IsActive && u.UserID !== editingUser?.UserID)
                      .map((user) => (
                        <option key={user.UserID} value={user.UserID}>
                          {user.Username} - {user.Department}
                        </option>
                      ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6 mb-3">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    name="isActive"
                    label="Active"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <hr />
                <h6 className="mb-3">
                  <i className="bi bi-shield-lock me-2"></i>
                  Password Settings
                </h6>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Label>
                    Password {!editingUser && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"}
                    required={!editingUser}
                  />
                  {editingUser && (
                    <Form.Text className="text-muted">
                      Leave blank to keep the current password
                    </Form.Text>
                  )}
                </Form.Group>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    name="requirePasswordChange"
                    label="Require password change on next login"
                    checked={formData.requirePasswordChange}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    User will be prompted to change their password when they log in
                  </Form.Text>
                </Form.Group>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingUser ? 'Update' : 'Create'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserController;
