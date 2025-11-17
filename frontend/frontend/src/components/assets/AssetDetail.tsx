import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Badge, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Asset } from '../../types/asset';
import { CheckLog } from '../../types/checkLog';
import QRCodeDisplay from './QRCodeDisplay';
import api from '../../services/api';

const AssetDetail: React.FC = () => {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [checkLogs, setCheckLogs] = useState<CheckLog[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      fetchAsset(id);
      fetchCheckLogs(id);
    }
  }, [id]);

  const fetchAsset = async (assetId: string) => {
    try {
      const response = await api.get(`/assets/${assetId}`);
      setAsset(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching asset:', error);
      setLoading(false);
    }
  };

  const fetchCheckLogs = async (assetId: string) => {
    try {
      const response = await api.get(`/checklogs/asset/${assetId}`);
      setCheckLogs(response.data);
    } catch (error) {
      console.error('Error fetching check logs:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-success';
      case 'Checked Out':
        return 'bg-warning';
      case 'Maintenance':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <p>Loading asset details...</p>;
  }

  if (!asset) {
    return <p>Asset not found</p>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Asset Details</h2>
        <div>
          <Button variant="info" className="me-2" onClick={() => setShowQRModal(true)}>
            View QR Code
          </Button>
          <Button variant="warning" className="me-2" onClick={() => navigate(`/assets/${asset.AssetID}/edit`)}>
            Edit
          </Button>
          <Button variant="secondary" onClick={() => navigate('/assets')}>
            Back to List
          </Button>
        </div>
      </div>

      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>Basic Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="fw-bold">Asset ID:</Col>
                <Col md={8}>{asset.AssetID}</Col>
              </Row>
              <Row className="mt-2">
                <Col md={4} className="fw-bold">Asset Name:</Col>
                <Col md={8}>{asset.AssetName}</Col>
              </Row>
              <Row className="mt-2">
                <Col md={4} className="fw-bold">Category:</Col>
                <Col md={8}>{asset.Category}</Col>
              </Row>
              <Row className="mt-2">
                <Col md={4} className="fw-bold">Status:</Col>
                <Col md={8}>
                  <Badge className={getStatusBadgeClass(asset.Status)}>
                    {asset.Status}
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-3">
            <Card.Header>Financial Information</Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="fw-bold">Purchase Date:</Col>
                <Col md={8}>{formatDate(asset.PurchaseDate)}</Col>
              </Row>
              <Row className="mt-2">
                <Col md={4} className="fw-bold">Purchase Price:</Col>
                <Col md={8}>${asset.PurchasePrice.toFixed(2)}</Col>
              </Row>
              <Row className="mt-2">
                <Col md={4} className="fw-bold">Depreciation:</Col>
                <Col md={8}>${asset.DepreciationValue.toFixed(2)}</Col>
              </Row>
              <Row className="mt-2">
                <Col md={4} className="fw-bold">Current Value:</Col>
                <Col md={8}>${asset.CurrentValue.toFixed(2)}</Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-3">
        <Card.Header>Location Information</Card.Header>
        <Card.Body>
          <Row>
            <Col md={4} className="fw-bold">Location:</Col>
            <Col md={8}>{asset.LocationName}</Col>
          </Row>
          <Row className="mt-2">
            <Col md={4} className="fw-bold">Department:</Col>
            <Col md={8}>{asset.Department}</Col>
          </Row>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>Check In/Out History</Card.Header>
        <Card.Body>
          {checkLogs.length > 0 ? (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>Location</th>
                  <th>Date & Time</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {checkLogs.map((log) => (
                  <tr key={log.LogID}>
                    <td>
                      <Badge bg={log.ActionType === 'CheckIn' ? 'success' : 'warning'}>
                        {log.ActionType}
                      </Badge>
                    </td>
                    <td>{log.UserName}</td>
                    <td>{log.LocationName}</td>
                    <td>{new Date(log.Timestamp).toLocaleString()}</td>
                    <td>{log.Notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No check-in/out history available</p>
          )}
        </Card.Body>
      </Card>

      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Asset QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <QRCodeDisplay assetId={asset.AssetID} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQRModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssetDetail;
