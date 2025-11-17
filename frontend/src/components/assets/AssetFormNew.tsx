import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Card, Tabs, Tab } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Asset } from '../../types/asset';
import { Location } from '../../types/location';
import api from '../../services/api';

interface AssetFormProps {
  isEdit?: boolean;
}

const AssetFormNew: React.FC<AssetFormProps> = ({ isEdit = false }) => {
  const [asset, setAsset] = useState<Partial<Asset>>({
    AssetID: '',
    MainCategory: 'Computer',
    Status: 'Available',
    Category: '',
    ModelName: '',
    Brand: '',
    Model: '',
    CPU: '',
    Ram: '',
    HDD: '',
    SerialNumber: '',
    Department: '',
    DatePurchase: new Date().toISOString().split('T')[0],
    DateFirstUse: new Date().toISOString().split('T')[0],
    Price: 0,
    LocationID: 0,
    CompanyID: 1,
  });
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchLocations();
    if (isEdit && id) {
      fetchAsset(id);
    } else {
      setLoading(false);
    }
  }, [isEdit, id]);

  const fetchLocations = async () => {
    try {
      const response = await api.get<Location[]>('/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to fetch locations');
    }
  };

  const fetchAsset = async (assetId: string) => {
    try {
      const response = await api.get<Asset>(`/assets/${assetId}`);
      setAsset(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching asset:', error);
      setError('Failed to fetch asset');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAsset({
      ...asset,
      [name]: ['Price', 'ReplacementCost', 'LocationID', 'CompanyID'].includes(name)
        ? parseFloat(value) || 0
        : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const assetData = {
        assetId: asset.AssetID,
        mainCategory: asset.MainCategory,
        status: asset.Status,
        category: asset.Category,
        modelName: asset.ModelName,
        brand: asset.Brand,
        model: asset.Model,
        cpu: asset.CPU,
        ram: asset.Ram,
        hdd: asset.HDD,
        serialNumber: asset.SerialNumber,
        department: asset.Department,
        datePurchase: asset.DatePurchase,
        dateFirstUse: asset.DateFirstUse,
        price: asset.Price,
        locationId: asset.LocationID,
        companyId: asset.CompanyID,
        computerName: asset.ComputerName,
        accessories: asset.Accessories,
        comment: asset.Comment,
      };

      if (isEdit && id) {
        await api.put(`/assets/${id}`, assetData);
        setSuccess('Asset updated successfully');
      } else {
        await api.post('/assets', assetData);
        setSuccess('Asset created successfully');
      }
      
      setTimeout(() => {
        navigate('/assets');
      }, 1500);
    } catch (error: any) {
      console.error('Error saving asset:', error);
      setError(error.response?.data?.message || 'Failed to save asset');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{isEdit ? 'Edit Asset' : 'Add New Asset'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Tabs defaultActiveKey="basic" className="mb-3">
          {/* Basic Information Tab */}
          <Tab eventKey="basic" title="Basic Information">
            <Card className="mb-3">
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Asset ID *</Form.Label>
                      <Form.Control
                        type="text"
                        name="AssetID"
                        value={asset.AssetID}
                        onChange={handleChange}
                        required
                        disabled={isEdit}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Main Category *</Form.Label>
                      <Form.Select
                        name="MainCategory"
                        value={asset.MainCategory}
                        onChange={handleChange}
                        required
                      >
                        <option value="Computer">Computer</option>
                        <option value="Display">Display</option>
                        <option value="Mobile Device">Mobile Device</option>
                        <option value="Printer">Printer</option>
                        <option value="Network Equipment">Network Equipment</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Control
                        type="text"
                        name="Category"
                        value={asset.Category}
                        onChange={handleChange}
                        placeholder="e.g., Laptop, Desktop, Monitor"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Status *</Form.Label>
                      <Form.Select
                        name="Status"
                        value={asset.Status}
                        onChange={handleChange}
                        required
                      >
                        <option value="Available">Available</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Under Repair">Under Repair</option>
                        <option value="Retired">Retired</option>
                        <option value="Lost">Lost</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Brand</Form.Label>
                      <Form.Control
                        type="text"
                        name="Brand"
                        value={asset.Brand}
                        onChange={handleChange}
                        placeholder="e.g., Dell, HP, Apple"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Model Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="ModelName"
                        value={asset.ModelName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Model</Form.Label>
                      <Form.Control
                        type="text"
                        name="Model"
                        value={asset.Model}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Serial Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="SerialNumber"
                        value={asset.SerialNumber}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Computer Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="ComputerName"
                        value={asset.ComputerName}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          {/* Hardware Specifications Tab */}
          <Tab eventKey="hardware" title="Hardware Specs">
            <Card className="mb-3">
              <Card.Body>
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>CPU</Form.Label>
                      <Form.Control
                        type="text"
                        name="CPU"
                        value={asset.CPU}
                        onChange={handleChange}
                        placeholder="e.g., Intel Core i7"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>RAM</Form.Label>
                      <Form.Control
                        type="text"
                        name="Ram"
                        value={asset.Ram}
                        onChange={handleChange}
                        placeholder="e.g., 16GB"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Storage (HDD/SSD)</Form.Label>
                      <Form.Control
                        type="text"
                        name="HDD"
                        value={asset.HDD}
                        onChange={handleChange}
                        placeholder="e.g., 512GB SSD"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>WLAN MAC Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="WLANMACAddress"
                        value={asset.WLANMACAddress}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>LAN MAC Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="LANMACAddress"
                        value={asset.LANMACAddress}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Accessories</Form.Label>
                      <Form.Control
                        type="text"
                        name="Accessories"
                        value={asset.Accessories}
                        onChange={handleChange}
                        placeholder="e.g., Mouse, Keyboard, Charger"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          {/* Location & Purchase Tab */}
          <Tab eventKey="location" title="Location & Purchase">
            <Card className="mb-3">
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Location *</Form.Label>
                      <Form.Select
                        name="LocationID"
                        value={asset.LocationID}
                        onChange={handleChange}
                        required
                      >
                        <option value={0}>Select Location</option>
                        {locations.map((location) => (
                          <option key={location.LocationID} value={location.LocationID}>
                            {location.LocationName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Control
                        type="text"
                        name="Department"
                        value={asset.Department}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Purchase Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="DatePurchase"
                        value={asset.DatePurchase?.split('T')[0]}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>First Use Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="DateFirstUse"
                        value={asset.DateFirstUse?.split('T')[0]}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Price</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="Price"
                        value={asset.Price}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Comments</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="Comment"
                        value={asset.Comment}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>

        <div className="d-flex gap-2">
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : (isEdit ? 'Update Asset' : 'Create Asset')}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/assets')}>
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default AssetFormNew;
