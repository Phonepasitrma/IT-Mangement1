import React, { useState } from 'react';
import { Card, Button, Row, Col, Alert } from 'react-bootstrap';
import api from '../../services/api';

const ReportList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAssetReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.get('/reports/assets', {
        responseType: 'blob',
      });
      // Explicitly cast response.data as Blob
      const url = window.URL.createObjectURL(new Blob([response.data as Blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assets_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Asset report downloaded successfully');
    } catch (error) {
      console.error('Error downloading asset report:', error);
      setError('Failed to download asset report');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.get('/reports/budget', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data as Blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'budget_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Budget report downloaded successfully');
    } catch (error) {
      console.error('Error downloading budget report:', error);
      setError('Failed to download budget report');
    } finally {
      setLoading(false);
    }
  };

  const handleStockCountReport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.get('/reports/stockcount', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data as Blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'stockcount_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSuccess('Stock count report downloaded successfully');
    } catch (error) {
      console.error('Error downloading stock count report:', error);
      setError('Failed to download stock count report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reports</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row>
        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Asset Report</Card.Title>
              <Card.Text>
                Download a complete report of all assets in the system.
              </Card.Text>
              <Button
                variant="primary"
                onClick={handleAssetReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Download Report'}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Budget Report</Card.Title>
              <Card.Text>
                Download a report of budget plans and forecasts.
              </Card.Text>
              <Button
                variant="primary"
                onClick={handleBudgetReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Download Report'}
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card>
            <Card.Body>
              <Card.Title>Stock Count Report</Card.Title>
              <Card.Text>
                Download a report of stock count results.
              </Card.Text>
              <Button
                variant="primary"
                onClick={handleStockCountReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Download Report'}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReportList;