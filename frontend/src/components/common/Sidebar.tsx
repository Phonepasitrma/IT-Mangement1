import React from 'react';
import { Nav, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  permission?: string;
  adminOnly?: boolean;
  managerOnly?: boolean;
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { hasPermission, isAdmin, isManager } = useAuth();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: 'bi-speedometer2',
    },
    {
      path: '/assets',
      label: 'Assets',
      icon: 'bi-laptop',
      permission: 'assets.view',
    },
    {
      path: '/checkinout',
      label: 'Check In/Out',
      icon: 'bi-arrow-left-right',
      permission: 'assets.view',
    },
    {
      path: '/stockcount',
      label: 'Stock Count',
      icon: 'bi-clipboard-check',
      managerOnly: true,
    },
    {
      path: '/budget',
      label: 'Budget Planning',
      icon: 'bi-cash-stack',
      managerOnly: true,
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: 'bi-file-earmark-bar-graph',
      permission: 'reports.view',
    },
    {
      path: '/config',
      label: 'System Config',
      icon: 'bi-gear',
      permission: 'config.view',
    },
    {
      path: '/sync',
      label: 'SharePoint Sync',
      icon: 'bi-cloud-arrow-up-down',
      adminOnly: true,
    },
    {
      path: '/excel',
      label: 'Excel Import/Export',
      icon: 'bi-file-earmark-excel',
      adminOnly: true,
    },
  ];

  const canAccessItem = (item: NavItem): boolean => {
    if (item.adminOnly && !isAdmin()) return false;
    if (item.managerOnly && !isManager()) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  };

  return (
    <Nav className="flex-column sidebar">
      <div className="sidebar-header p-3 text-white">
        <h6 className="mb-0">Navigation</h6>
      </div>
      {navItems.map((item) => {
        if (!canAccessItem(item)) return null;

        return (
          <Nav.Item key={item.path}>
            <Nav.Link
              as={Link}
              to={item.path}
              active={isActive(item.path)}
              className="d-flex align-items-center"
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.label}
              {item.adminOnly && (
                <Badge bg="danger" className="ms-auto" pill>
                  Admin
                </Badge>
              )}
              {item.managerOnly && !item.adminOnly && (
                <Badge bg="warning" className="ms-auto" pill>
                  Manager
                </Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        );
      })}
    </Nav>
  );
};

export default Sidebar;
