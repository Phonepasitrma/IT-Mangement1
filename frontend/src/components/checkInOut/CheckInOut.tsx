import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Tab, Tabs, Modal } from 'react-bootstrap';
import { Asset } from '../../types/asset';
import { Location } from '../../types/location';
import QRScanner from './QRScanner';
import api from '../../services/api';

const CheckInOut: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('checkin');
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchAssets();
    fetchLocations();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data as Asset[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setError('Failed to fetch assets');
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      setLocations(response.data as Location[]);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to fetch locations');
    }
  };

  const handleAssetSelect = (assetId: string) => {
    const asset = assets.find(a => a.AssetID === assetId);
    setSelectedAsset(asset || null);
  };

  const handleLocationSelect = (locationId: number) => {
    setSelectedLocation(locationId);
  };

  const handleCheckIn = async () => {
    if (!selectedAsset || selectedLocation === 0) {
      setError('Please select an asset and location');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/checklogs/checkin/${selectedAsset.AssetID}`, {
        locationId: selectedLocation,
        notes
      });

      setSuccess('Asset checked in successfully');
      setSelectedAsset(null);
      setNotes('');
      fetchAssets(); // Refresh assets to update status
    } catch (error: any) {
      console.error('Error checking in asset:', error);
      setError(error.response?.data?.message || 'Failed to check in asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedAsset || selectedLocation === 0) {
      setError('Please select an asset and location');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/checklogs/checkout/${selectedAsset.AssetID}`, {
        locationId: selectedLocation,
        notes
      });

      setSuccess('Asset checked out successfully');
      setSelectedAsset(null);
      setNotes('');
      fetchAssets(); // Refresh assets to update status
    } catch (error: any) {
      console.error('Error checking out asset:', error);
      setError(error.response?.data?.message || 'Failed to check out asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScanResult = (result: string) => {
    // Parse the QR code result
    if (result.startsWith('AssetID:')) {
      const assetId = result.replace('AssetID:', '');
      handleAssetSelect(assetId);
      setShowScanner(false);
    }
  };

  const filteredAssets = activeTab === 'checkin' 
    ? assets.filter(asset => asset.Status === 'Checked Out')
    : assets.filter(asset => asset.Status === 'Available');

  return (
    <div>
      <h2>Check In/Out Assets</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'checkin')} className="mb-3">
        <Tab eventKey="checkin" title="Check In">
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Select Asset</Form.Label>
                    <Form.Select
                      value={selectedAsset?.AssetID || ''}
                      onChange={(e) => handleAssetSelect(e.target.value)}
                    >
                      <option value="">Select an asset</option>
                      {filteredAssets.map((asset) => (
                        <option key={asset.AssetID} value={asset.AssetID}>
                          {asset.AssetID} - {asset.ModelName || asset.Brand || 'N/A'}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Or Scan QR Code</Form.Label>
                    <Button variant="outline-primary" onClick={() => setShowScanner(true)}>
                      Scan QR Code
                    </Button>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      value={selectedLocation}
                      onChange={(e) => handleLocationSelect(Number(e.target.value))}
                    >
                      <option value={0}>Select a location</option>
                      {locations.map((location) => (
                        <option key={location.LocationID} value={location.LocationID}>
                          {location.LocationName} - {location.Department}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Button variant="success" onClick={handleCheckIn} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Check In'}
              </Button>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="checkout" title="Check Out">
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Select Asset</Form.Label>
                    <Form.Select
                      value={selectedAsset?.AssetID || ''}
                      onChange={(e) => handleAssetSelect(e.target.value)}
                    >
                      <option value="">Select an asset</option>
                      {filteredAssets.map((asset) => (
                        <option key={asset.AssetID} value={asset.AssetID}>
                          {asset.AssetID} - {asset.ModelName || asset.Brand || 'N/A'}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Or Scan QR Code</Form.Label>
                    <Button variant="outline-primary" onClick={() => setShowScanner(true)}>
                      Scan QR Code
                    </Button>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Location</Form.Label>
                    <Form.Select
                      value={selectedLocation}
                      onChange={(e) => handleLocationSelect(Number(e.target.value))}
                    >
                      <option value={0}>Select a location</option>
                      {locations.map((location) => (
                        <option key={location.LocationID} value={location.LocationID}>
                          {location.LocationName} - {location.Department}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Button variant="warning" onClick={handleCheckOut} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Check Out'}
              </Button>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {selectedAsset && (
        <Card className="mt-3">
          <Card.Header>Selected Asset Details</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Asset ID:</strong> {selectedAsset.AssetID}</p>
                <p><strong>Model:</strong> {selectedAsset.ModelName || selectedAsset.Brand || 'N/A'}</p>
                <p><strong>Category:</strong> {selectedAsset.Category}</p>
              </Col>
              <Col md={6}>
                <p><strong>Current Location:</strong> {selectedAsset.LocationName}</p>
                <p><strong>Department:</strong> {selectedAsset.Department}</p>
                <p><strong>Status:</strong> {selectedAsset.Status}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      <Modal show={showScanner} onHide={() => setShowScanner(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scan QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <QRScanner onScanResult={handleScanResult} />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CheckInOut;