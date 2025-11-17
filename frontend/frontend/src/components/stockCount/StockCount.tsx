import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Table, Badge, Modal,Tabs,Tab } from 'react-bootstrap';
import { Asset } from '../../types/asset';
import { Location } from '../../types/location';
import type { StockCount } from '../../types/stockCount'; // Use type-only import
import QRScanner from '../checkInOut/QRScanner';
import api from '../../services/api';

const StockCount: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<number>(0);
  const [countDate, setCountDate] = useState(new Date().toISOString().slice(0, 10));
  const [locationAssets, setLocationAssets] = useState<Asset[]>([]);
  const [scannedAssets, setScannedAssets] = useState<Array<{ assetId: string; notes?: string }>>([]);
  const [stockCounts, setStockCounts] = useState<StockCount[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('new');

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocation > 0) {
      fetchLocationAssets();
    }
  }, [selectedLocation]);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      setLocations(response.data as Location[]);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to fetch locations');
    }
  };

  const fetchLocationAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/assets/location/${selectedLocation}`);
      setLocationAssets(response.data as Asset[]);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching location assets:', error);
      setError('Failed to fetch location assets');
      setLoading(false);
    }
  };

  const handleLocationSelect = (locationId: number) => {
    setSelectedLocation(locationId);
    setScannedAssets([]);
  };

  const handleManualScan = () => {
    const assetId = prompt('Enter Asset ID:');
    if (assetId) {
      addScannedAsset(assetId);
    }
  };

  const handleScanResult = (result: string) => {
    if (result.startsWith('AssetID:')) {
      const assetId = result.replace('AssetID:', '');
      addScannedAsset(assetId);
      setShowScanner(false);
    }
  };

  const addScannedAsset = (assetId: string) => {
    // Check if asset is already scanned
    if (scannedAssets.find(a => a.assetId === assetId)) {
      setError('Asset already scanned');
      return;
    }

    setScannedAssets([...scannedAssets, { assetId }]);
  };

  const removeScannedAsset = (assetId: string) => {
    setScannedAssets(scannedAssets.filter(a => a.assetId !== assetId));
  };

  const updateScannedAssetNotes = (assetId: string, notes: string) => {
    setScannedAssets(scannedAssets.map(a => 
      a.assetId === assetId ? { ...a, notes } : a
    ));
  };

  const submitStockCount = async () => {
    if (selectedLocation === 0 || scannedAssets.length === 0) {
      setError('Please select a location and scan at least one asset');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/stockcounts/perform', {
        locationId: selectedLocation,
        scannedAssets,
        date: countDate
      });

      setSuccess('Stock count completed successfully');
      setScannedAssets([]);
      fetchLocationAssets();
    } catch (error: any) {
      console.error('Error submitting stock count:', error);
      setError(error.response?.data?.message || 'Failed to submit stock count');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchStockCounts = async () => {
    try {
      const response = await api.get('/stockcounts');
      setStockCounts(response.data as StockCount[]);
    } catch (error) {
      console.error('Error fetching stock counts:', error);
      setError('Failed to fetch stock counts');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Matched':
        return 'bg-success';
      case 'Missing':
        return 'bg-danger';
      case 'Extra':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  return (
    <div>
      <h2>Stock Count</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'new')} className="mb-3">
        <Tab eventKey="new" title="New Stock Count">
          <Card>
            <Card.Body>
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
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Count Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={countDate}
                      onChange={(e) => setCountDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              {selectedLocation > 0 && (
                <>
                  <Row className="mb-3">
                    <Col md={12}>
                      <div className="d-flex gap-2">
                        <Button variant="primary" onClick={() => setShowScanner(true)}>
                          Scan QR Code
                        </Button>
                        <Button variant="outline-primary" onClick={handleManualScan}>
                          Manual Entry
                        </Button>
                      </div>
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col md={6}>
                      <h5>Expected Assets ({locationAssets.length})</h5>
                      {loading ? (
                        <p>Loading assets...</p>
                      ) : (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          <Table striped bordered hover size="sm">
                            <thead>
                              <tr>
                                <th>Asset ID</th>
                                <th>Asset Name</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {locationAssets.map((asset) => (
                                <tr 
                                  key={asset.AssetID}
                                  className={scannedAssets.find(a => a.assetId === asset.AssetID) ? 'table-success' : ''}
                                >
                                  <td>{asset.AssetID}</td>
                                  <td>{asset.AssetName}</td>
                                  <td>{asset.Status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Col>
                    <Col md={6}>
                      <h5>Scanned Assets ({scannedAssets.length})</h5>
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <Table striped bordered hover size="sm">
                          <thead>
                            <tr>
                              <th>Asset ID</th>
                              <th>Notes</th>
                              <th>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scannedAssets.map((asset) => (
                              <tr key={asset.assetId}>
                                <td>{asset.assetId}</td>
                                <td>
                                  <Form.Control
                                    type="text"
                                    size="sm"
                                    value={asset.notes || ''}
                                    onChange={(e) => updateScannedAssetNotes(asset.assetId, e.target.value)}
                                    placeholder="Add notes"
                                  />
                                </td>
                                <td>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => removeScannedAsset(asset.assetId)}
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    </Col>
                  </Row>
                  
                  <Button 
                    variant="success" 
                    onClick={submitStockCount} 
                    disabled={submitting || scannedAssets.length === 0}
                  >
                    {submitting ? 'Submitting...' : 'Submit Stock Count'}
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="history" title="Stock Count History" onEnter={fetchStockCounts}>
          <Card>
            <Card.Body>
              {stockCounts.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Count ID</th>
                      <th>Location</th>
                      <th>Asset ID</th>
                      <th>Asset Name</th>
                      <th>User</th>
                      <th>Count Date</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockCounts.map((count) => (
                      <tr key={count.CountID}>
                        <td>{count.CountID}</td>
                        <td>{count.LocationName}</td>
                        <td>{count.AssetID}</td>
                        <td>{count.AssetName}</td>
                        <td>{count.UserName}</td>
                        <td>{new Date(count.CountDate).toLocaleDateString()}</td>
                        <td>
                          <Badge className={getStatusBadgeClass(count.Status)}>
                            {count.Status}
                          </Badge>
                        </td>
                        <td>{count.Notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No stock count history available</p>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
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

export default StockCount;
