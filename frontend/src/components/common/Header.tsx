import React from 'react';
import { Navbar, Nav, Dropdown, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'Admin':
        return 'danger';
      case 'Manager':
        return 'warning';
      case 'User':
        return 'info';
      case 'Viewer':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="app-header shadow-sm">
      <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
        <i className="bi bi-laptop me-2"></i>
        IT Asset Management
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto align-items-center">
          {user && (
            <>
              <div className="text-white me-3 d-none d-lg-block">
                <small className="d-block">Welcome back,</small>
                <strong>{user.username}</strong>
                <Badge bg={getUserTypeColor(user.userType)} className="ms-2">
                  {user.userType}
                </Badge>
              </div>
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                  <i className="bi bi-person-circle me-1"></i>
                  {user.username}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Header>
                    <div><strong>{user.username}</strong></div>
                    <div><small className="text-muted">{user.email}</small></div>
                    <div><small className="text-muted">{user.department}</small></div>
                    {user.position && <div><small className="text-muted">{user.position}</small></div>}
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={() => navigate('/change-password')}>
                    <i className="bi bi-shield-lock me-2"></i>
                    Change Password
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="bi bi-gear me-2"></i>
                    Settings
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
