import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Alert } from 'react-bootstrap';
import { Asset } from '../../types/asset';
import { BudgetPlan } from '../../types/budgetPlan';
import { Location } from '../../types/location';
import Charts from './Charts';
import api from '../../services/api';

interface DashboardData {
  assetsByLocation: Array<{
    locationName: string;
    department: string;
    totalAssets: number;
  }>;
  assetsDueForReplacement: number;
  stockDiscrepancies: number;
  budgetForecast: BudgetPlan[];
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      setDashboardData(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!dashboardData) {
    return <p>No dashboard data available</p>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Locations</Card.Title>
              <h2>{dashboardData.assetsByLocation.length}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Assets Due for Replacement</Card.Title>
              <h2 className="text-warning">{dashboardData.assetsDueForReplacement}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Stock Discrepancies</Card.Title>
              <h2 className="text-danger">{dashboardData.stockDiscrepancies}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Budget Forecast</Card.Title>
              <h2>
                ${dashboardData.budgetForecast.reduce(
                  (sum, plan) => sum + plan.EstimatedReplacementCost,
                  0
                ).toFixed(2)}
              </h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>Assets by Location</Card.Header>
            <Card.Body>
              <Charts assetsByLocation={dashboardData.assetsByLocation} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={12}>
          <Card>
            <Card.Header>Budget Forecast by Department</Card.Header>
            <Card.Body>
              <Charts budgetForecast={dashboardData.budgetForecast} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
