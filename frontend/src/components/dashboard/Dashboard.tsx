import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert, Table, Badge, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import './Dashboard.css';

interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  assignedAssets: number;
  underRepairAssets: number;
  totalValue: number;
  assetsByCategory: Array<{ category: string; count: number }>;
  assetsByLocation: Array<{ location: string; count: number }>;
  assetsByStatus: Array<{ status: string; count: number }>;
  recentAssets: Array<any>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch assets
      const assetsResponse = await api.get<any[]>('/assets');
      const assets = assetsResponse.data;

      // Calculate statistics
      const totalAssets = assets.length;
      const availableAssets = assets.filter((a: any) => a.Status === 'Available').length;
      const assignedAssets = assets.filter((a: any) => a.Status === 'Assigned').length;
      const underRepairAssets = assets.filter((a: any) => a.Status === 'Under Repair').length;
      const totalValue = assets.reduce((sum: number, a: any) => sum + (parseFloat(a.Price) || 0), 0);

      // Group by category
      const categoryMap = new Map<string, number>();
      assets.forEach((a: any) => {
        const category = a.MainCategory || 'Unknown';
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });
      const assetsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
        category,
        count,
      }));

      // Group by location
      const locationMap = new Map<string, number>();
      assets.forEach((a: any) => {
        const location = a.LocationName || 'Unknown';
        locationMap.set(location, (locationMap.get(location) || 0) + 1);
      });
      const assetsByLocation = Array.from(locationMap.entries()).map(([location, count]) => ({
        location,
        count,
      }));

      // Group by status
      const statusMap = new Map<string, number>();
      assets.forEach((a: any) => {
        const status = a.Status || 'Unknown';
        statusMap.set(status, (statusMap.get(status) || 0) + 1);
      });
      const assetsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
        status,
        count,
      }));

      // Get recent assets (last 5)
      const recentAssets = assets.slice(0, 5);

      setStats({
        totalAssets,
        availableAssets,
        assignedAssets,
        underRepairAssets,
        totalValue,
        assetsByCategory,
        assetsByLocation,
        assetsByStatus,
        recentAssets,
      });
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'Assigned':
        return 'primary';
      case 'Under Repair':
        return 'warning';
      case 'Retired':
        return 'secondary';
      case 'Lost':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Workstation':
        return 'bi-laptop';
      case 'Display':
        return 'bi-display';
      case 'Monitor':
        return 'bi-tv';
      case 'Network Equipment':
        return 'bi-router';
      case 'Printer':
        return 'bi-printer';
      default:
        return 'bi-box';
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!stats) {
    return <Alert variant="info">No data available</Alert>;
  }

  return (
    <div className="dashboard">
      {/* Welcome Header */}
      <div className="dashboard-header mb-4">
        <h2>
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h2>
        <p className="text-muted">
          Welcome back, <strong>{user?.username}</strong>! Here's your IT asset overview.
        </p>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card stat-card-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="stat-label">Total Assets</p>
                  <h2 className="stat-value">{stats.totalAssets}</h2>
                </div>
                <div className="stat-icon">
                  <i className="bi bi-box-seam"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card stat-card-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="stat-label">Available</p>
                  <h2 className="stat-value">{stats.availableAssets}</h2>
                </div>
                <div className="stat-icon">
                  <i className="bi bi-check-circle"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card stat-card-info">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="stat-label">Assigned</p>
                  <h2 className="stat-value">{stats.assignedAssets}</h2>
                </div>
                <div className="stat-icon">
                  <i className="bi bi-person-check"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="stat-card stat-card-warning">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="stat-label">Under Repair</p>
                  <h2 className="stat-value">{stats.underRepairAssets}</h2>
                </div>
                <div className="stat-icon">
                  <i className="bi bi-tools"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Total Value Card */}
      <Row className="mb-4">
        <Col md={12}>
          <Card className="stat-card stat-card-gradient">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="stat-label text-white">Total Asset Value</p>
                  <h2 className="stat-value text-white">
                    ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                </div>
                <div className="stat-icon text-white">
                  <i className="bi bi-cash-stack"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Assets by Category */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <i className="bi bi-pie-chart me-2"></i>
              Assets by Category
            </Card.Header>
            <Card.Body>
              {stats.assetsByCategory.length > 0 ? (
                <div className="category-list">
                  {stats.assetsByCategory.map((item, index) => (
                    <div key={index} className="category-item mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>
                          <i className={`bi ${getCategoryIcon(item.category)} me-2`}></i>
                          {item.category}
                        </span>
                        <Badge bg="primary">{item.count}</Badge>
                      </div>
                      <ProgressBar
                        now={(item.count / stats.totalAssets) * 100}
                        variant="primary"
                        style={{ height: '8px' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No assets found</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Assets by Location */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <i className="bi bi-geo-alt me-2"></i>
              Assets by Location
            </Card.Header>
            <Card.Body>
              {stats.assetsByLocation.length > 0 ? (
                <div className="location-list">
                  {stats.assetsByLocation.map((item, index) => (
                    <div key={index} className="location-item mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span>
                          <i className="bi bi-building me-2"></i>
                          {item.location}
                        </span>
                        <Badge bg="success">{item.count}</Badge>
                      </div>
                      <ProgressBar
                        now={(item.count / stats.totalAssets) * 100}
                        variant="success"
                        style={{ height: '8px' }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">No locations found</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Assets by Status */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <i className="bi bi-bar-chart me-2"></i>
              Assets by Status
            </Card.Header>
            <Card.Body>
              {stats.assetsByStatus.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th className="text-center">Count</th>
                      <th className="text-center">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.assetsByStatus.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg={getStatusColor(item.status)}>{item.status}</Badge>
                        </td>
                        <td className="text-center">{item.count}</td>
                        <td className="text-center">
                          {((item.count / stats.totalAssets) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No status data found</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Assets */}
        <Col md={6}>
          <Card>
            <Card.Header>
              <i className="bi bi-clock-history me-2"></i>
              Recent Assets
            </Card.Header>
            <Card.Body>
              {stats.recentAssets.length > 0 ? (
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Asset ID</th>
                      <th>Category</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentAssets.map((asset, index) => (
                      <tr key={index}>
                        <td>
                          <small className="text-monospace">{asset.AssetID}</small>
                        </td>
                        <td>{asset.MainCategory}</td>
                        <td>
                          <Badge bg={getStatusColor(asset.Status)} pill>
                            {asset.Status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No recent assets</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
