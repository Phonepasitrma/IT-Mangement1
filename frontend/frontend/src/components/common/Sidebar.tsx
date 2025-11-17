import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Nav className="flex-column sidebar">
      <Nav.Item>
        <Nav.Link as={Link} to="/dashboard" active={isActive('/dashboard')}>
          Dashboard
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/assets" active={isActive('/assets')}>
          Assets
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/locations" active={isActive('/locations')}>
          Locations
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/checkinout" active={isActive('/checkinout')}>
          Check In/Out
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/stockcount" active={isActive('/stockcount')}>
          Stock Count
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/budget" active={isActive('/budget')}>
          Budget Planning
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/reports" active={isActive('/reports')}>
          Reports
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default Sidebar;
