import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert, Card, Tabs, Tab } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Asset } from '../../types/asset';
import { Location } from '../../types/location';
import api from '../../services/api';

interface AssetFormProps {
  isEdit?: boolean;
}

const AssetForm: React.FC<AssetFormProps> = ({ isEdit = false }) => {
  const [asset, setAsset] = useState<Partial<Asset>>({
    AssetID: '',
    MainCategory: '',
    Status: 'Available',
    ModelName: '',
    Brand: '',
    Category: '',
    LocationID: 0,
    CompanyID: 0,
    DatePurchase: new Date().toISOString().split('T')[0],
  });
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [mainCategories, setMainCategories] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchAllData();
    if (isEdit && id) {
      fetchAsset(id);
    } else {
      setLoading(false);
    }
  }, [isEdit, id]);

  // Auto-generate Asset ID when key fields change
  useEffect(() => {
    if (!isEdit && asset.MainCategory && asset.CompanyID && asset.LocationID && asset.DatePurchase) {
      generateAssetId();
    }
  }, [asset.MainCategory, asset.CompanyID, asset.LocationID, asset.DatePurchase, isEdit]);

  const fetchAllData = async () => {
    try {
      const [locationsRes, companiesRes, mainCatRes, catRes, deptRes] = await Promise.all([
        api.get<Location[]>('/locations'),
        api.get<any[]>('/config/companies'),
        api.get<any[]>('/config/maincategories'),
        api.get<any[]>('/config/categories'),
        api.get<any[]>('/config/departments'),
      ]);
      
      setLocations(locationsRes.data);
      setCompanies(companiesRes.data);
      setMainCategories(mainCatRes.data);
      setCategories(catRes.data);
      setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch form data');
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

  const generateAssetId = async () => {
    try {
      const response = await api.post<{ assetId: string }>('/assetid/generate', {
        mainCategory: asset.MainCategory,
        companyId: asset.CompanyID,
        locationId: asset.LocationID,
        purchaseDate: asset.DatePurchase,
      });
      
      setAsset(prev => ({
        ...prev,
        AssetID: response.data.assetId,
      }));
    } catch (error) {
      console.error('Error generating asset ID:', error);
      setError('Failed to generate asset ID');
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedAsset = {
      ...asset,
      [name]: value,
    };
    setAsset(updatedAsset);

    // Auto-generate Asset ID when all required fields are filled
    if (!isEdit && ['MainCategory', 'CompanyID', 'LocationID', 'DatePurchase'].includes(name)) {
      if (updatedAsset.MainCategory && updatedAsset.CompanyID && updatedAsset.LocationID && updatedAsset.DatePurchase) {
        try {
          const response = await api.post<{ assetId: string }>('/assetid/generate', {
            mainCategory: updatedAsset.MainCategory,
            companyId: parseInt(updatedAsset.CompanyID.toString()),
            locationId: parseInt(updatedAsset.LocationID.toString()),
            purchaseDate: updatedAsset.DatePurchase,
          });
          setAsset(prev => ({
            ...prev,
            AssetID: response.data.assetId,
          }));
        } catch (error) {
          console.error('Error generating asset ID:', error);
        }
      }
    }
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
        wlanMacAddress: asset.WLANMACAddress,
        lanMacAddress: asset.LANMACAddress,
        description: asset.Description,
        department: asset.Department,
        datePurchase: asset.DatePurchase,
        dateFirstUse: asset.DateFirstUse,
        serialNumber: asset.SerialNumber,
        snType: asset.SNType,
        poNumber: asset.PONumber,
        price: asset.Price ? parseFloat(asset.Price.toString()) : 0,
        computerName: asset.ComputerName,
        companyId: asset.CompanyID ? parseInt(asset.CompanyID.toString()) : null,
        locationId: asset.LocationID ? parseInt(asset.LocationID.toString()) : null,
        accessories: asset.Accessories,
        comment: asset.Comment,
        replacementCost: asset.ReplacementCost ? parseFloat(asset.ReplacementCost.toString()) : null,
        createdBy: null,
        modifiedBy: null,
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
              <Card.Header className="bg-primary text-white">
                <strong>Asset ID Generation Fields</strong>
                <small className="ms-2">(Required for auto-generating Asset ID)</small>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Main Category <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="MainCategory"
                        value={asset.MainCategory || ''}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Category</option>
                        {mainCategories.map((cat) => (
                          <option key={cat.MainCategoryID} value={cat.CategoryName}>
                            {cat.CategoryName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Company <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="CompanyID"
                        value={asset.CompanyID || ''}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Company</option>
                        {companies.map((company) => (
                          <option key={company.CompanyID} value={company.CompanyID}>
                            {company.CompanyName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Location <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="LocationID"
                        value={asset.LocationID || ''}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Location</option>
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
                      <Form.Label>Purchase Date <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="date"
                        name="DatePurchase"
                        value={asset.DatePurchase ? asset.DatePurchase.split('T')[0] : ''}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Asset ID <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="AssetID"
                        value={asset.AssetID || ''}
                        onChange={handleChange}
                        placeholder="Auto-generated (15 chars)"
                        required
                        disabled={isEdit}
                        readOnly={!isEdit}
                        className="form-control-lg bg-light"
                      />
                      {!isEdit && (
                        <Form.Text className="text-success">
                          ✓ Asset ID will be auto-generated when you fill the fields above
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Header>Asset Details</Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="Status"
                        value={asset.Status || ''}
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
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="Category"
                        value={asset.Category || ''}
                        onChange={handleChange}
                      >
                        <option value="">Select Type</option>
                        {categories
                          .filter(cat => cat.MainCategoryName === asset.MainCategory)
                          .map((cat) => (
                            <option key={cat.CategoryID} value={cat.CategoryName}>
                              {cat.CategoryName}
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Brand</Form.Label>
                      <Form.Control
                        type="text"
                        name="Brand"
                        value={asset.Brand || ''}
                        onChange={handleChange}
                        placeholder="e.g., Dell, HP, Apple"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Model Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="ModelName"
                        value={asset.ModelName || ''}
                        onChange={handleChange}
                        placeholder="e.g., XPS 15, MacBook Pro"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Model</Form.Label>
                      <Form.Control
                        type="text"
                        name="Model"
                        value={asset.Model || ''}
                        onChange={handleChange}
                        placeholder="Model number"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        name="Category"
                        value={asset.Category || ''}
                        onChange={handleChange}
                      >
                        <option value="">Select Type</option>
                        {categories
                          .filter(cat => cat.MainCategoryName === asset.MainCategory)
                          .map((cat) => (
                            <option key={cat.CategoryID} value={cat.CategoryName}>
                              {cat.CategoryName}
                            </option>
                          ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Status <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        name="Status"
                        value={asset.Status || ''}
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
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Serial Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="SerialNumber"
                        value={asset.SerialNumber || ''}
                        onChange={handleChange}
                        placeholder="Serial number"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="Description"
                        value={asset.Description || ''}
                        onChange={handleChange}
                        placeholder="Additional details about the asset"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          {/* Technical Specifications Tab */}
          <Tab eventKey="specs" title="Technical Specs">
            <Card className="mb-3">
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>CPU</Form.Label>
                      <Form.Control
                        type="text"
                        name="CPU"
                        value={asset.CPU || ''}
                        onChange={handleChange}
                        placeholder="e.g., Intel Core i7-10750H"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>RAM</Form.Label>
                      <Form.Control
                        type="text"
                        name="Ram"
                        value={asset.Ram || ''}
                        onChange={handleChange}
                        placeholder="e.g., 16GB"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Storage (HDD/SSD)</Form.Label>
                      <Form.Control
                        type="text"
                        name="HDD"
                        value={asset.HDD || ''}
                        onChange={handleChange}
                        placeholder="e.g., 512GB SSD"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Computer Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="ComputerName"
                        value={asset.ComputerName || ''}
                        onChange={handleChange}
                        placeholder="e.g., LAPTOP-IT-01"
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
                        value={asset.WLANMACAddress || ''}
                        onChange={handleChange}
                        placeholder="e.g., 00:1A:2B:3C:4D:5E"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>LAN MAC Address</Form.Label>
                      <Form.Control
                        type="text"
                        name="LANMACAddress"
                        value={asset.LANMACAddress || ''}
                        onChange={handleChange}
                        placeholder="e.g., 00:1A:2B:3C:4D:5F"
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
                        value={asset.Accessories || ''}
                        onChange={handleChange}
                        placeholder="e.g., Mouse, Keyboard, Charger"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          {/* Location & Assignment Tab */}
          <Tab eventKey="location" title="Assignment">
            <Card className="mb-3">
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Department</Form.Label>
                      <Form.Select
                        name="Department"
                        value={asset.Department || ''}
                        onChange={handleChange}
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept.DepartmentID} value={dept.DepartmentName}>
                            {dept.DepartmentName}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>S/N Type</Form.Label>
                      <Form.Control
                        type="text"
                        name="SNType"
                        value={asset.SNType || ''}
                        onChange={handleChange}
                        placeholder="Serial number type"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          {/* Purchase Information Tab */}
          <Tab eventKey="purchase" title="Purchase Info">
            <Card className="mb-3">
              <Card.Body>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>First Use Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="DateFirstUse"
                        value={asset.DateFirstUse ? asset.DateFirstUse.split('T')[0] : ''}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>PO Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="PONumber"
                        value={asset.PONumber || ''}
                        onChange={handleChange}
                        placeholder="Purchase Order Number"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Price</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="Price"
                        value={asset.Price || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Replacement Cost</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        name="ReplacementCost"
                        value={asset.ReplacementCost || ''}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                </Row>


              </Card.Body>
            </Card>
          </Tab>

          {/* Additional Info Tab */}
          <Tab eventKey="additional" title="Additional Info">
            <Card className="mb-3">
              <Card.Body>
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Comments</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="Comment"
                        value={asset.Comment || ''}
                        onChange={handleChange}
                        placeholder="Any additional notes or comments"
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

export default AssetForm;
