import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import api from '../../services/api';

interface MainCategory {
  MainCategoryID?: number;
  CategoryName: string;
  CategoryCode: string;
  Description?: string;
}

interface Category {
  CategoryID?: number;
  CategoryName: string;
  MainCategoryID: number;
  MainCategoryName?: string;
  Description?: string;
}

interface Department {
  DepartmentID?: number;
  DepartmentName: string;
  Description?: string;
}

interface Location {
  LocationID?: number;
  LocationName: string;
  LocationCode?: string;
  Department?: string;
}

interface Company {
  CompanyID?: number;
  CompanyName: string;
  CompanyCode?: string;
}

const AssetController: React.FC = () => {
  const [mainCategories, setMainCategories] = useState<MainCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'mainCategory' | 'category' | 'location' | 'department' | 'company'>('mainCategory');
  const [editItem, setEditItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = () => {
    fetchMainCategories();
    fetchCategories();
    fetchLocations();
    fetchDepartments();
    fetchCompanies();
  };

  const fetchMainCategories = async () => {
    try {
      const response = await api.get<MainCategory[]>('/config/maincategories');
      setMainCategories(response.data);
    } catch (error) {
      console.error('Error fetching main categories:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<Category[]>('/config/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get<Location[]>('/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get<Department[]>('/config/departments');
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get<Company[]>('/config/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleAdd = (type: 'mainCategory' | 'category' | 'location' | 'department' | 'company') => {
    setModalType(type);
    setEditItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (type: 'mainCategory' | 'category' | 'location' | 'department' | 'company', item: any) => {
    setModalType(type);
    setEditItem(item);
    setFormData(item);
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (modalType === 'mainCategory') {
        if (editItem) {
          await api.put(`/config/maincategories/${editItem.MainCategoryID}`, {
            categoryName: formData.CategoryName,
            categoryCode: formData.CategoryCode,
            description: formData.Description,
          });
          setSuccess('Main Category updated successfully');
        } else {
          await api.post('/config/maincategories', {
            categoryName: formData.CategoryName,
            categoryCode: formData.CategoryCode,
            description: formData.Description,
          });
          setSuccess('Main Category created successfully');
        }
        fetchMainCategories();
      } else if (modalType === 'category') {
        if (editItem) {
          await api.put(`/config/categories/${editItem.CategoryID}`, {
            categoryName: formData.CategoryName,
            mainCategoryId: formData.MainCategoryID,
            description: formData.Description,
          });
          setSuccess('Category updated successfully');
        } else {
          await api.post('/config/categories', {
            categoryName: formData.CategoryName,
            mainCategoryId: formData.MainCategoryID,
            description: formData.Description,
          });
          setSuccess('Category created successfully');
        }
        fetchCategories();
      } else if (modalType === 'location') {
        if (editItem) {
          await api.put(`/locations/${editItem.LocationID}`, {
            locationName: formData.LocationName,
            locationCode: formData.LocationCode,
            department: formData.Department,
          });
          setSuccess('Location updated successfully');
        } else {
          await api.post('/locations', {
            locationName: formData.LocationName,
            locationCode: formData.LocationCode,
            department: formData.Department,
          });
          setSuccess('Location created successfully');
        }
        fetchLocations();
      } else if (modalType === 'department') {
        if (editItem) {
          await api.put(`/config/departments/${editItem.DepartmentID}`, {
            departmentName: formData.DepartmentName,
            description: formData.Description,
          });
          setSuccess('Department updated successfully');
        } else {
          await api.post('/config/departments', {
            departmentName: formData.DepartmentName,
            description: formData.Description,
          });
          setSuccess('Department created successfully');
        }
        fetchDepartments();
      } else if (modalType === 'company') {
        if (editItem) {
          await api.put(`/config/companies/${editItem.CompanyID}`, {
            companyName: formData.CompanyName,
            companyCode: formData.CompanyCode,
          });
          setSuccess('Company updated successfully');
        } else {
          await api.post('/config/companies', {
            companyName: formData.CompanyName,
            companyCode: formData.CompanyCode,
          });
          setSuccess('Company created successfully');
        }
        fetchCompanies();
      }
      
      setShowModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: 'mainCategory' | 'category' | 'location' | 'department' | 'company', id: number) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      if (type === 'mainCategory') {
        await api.delete(`/config/maincategories/${id}`);
        setSuccess('Main Category deleted successfully');
        fetchMainCategories();
      } else if (type === 'category') {
        await api.delete(`/config/categories/${id}`);
        setSuccess('Category deleted successfully');
        fetchCategories();
      } else if (type === 'location') {
        await api.delete(`/locations/${id}`);
        setSuccess('Location deleted successfully');
        fetchLocations();
      } else if (type === 'department') {
        await api.delete(`/config/departments/${id}`);
        setSuccess('Department deleted successfully');
        fetchDepartments();
      } else if (type === 'company') {
        await api.delete(`/config/companies/${id}`);
        setSuccess('Company deleted successfully');
        fetchCompanies();
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete');
    }
  };

  const getModalTitle = () => {
    const titles = {
      mainCategory: 'Main Category',
      category: 'Category',
      location: 'Location',
      department: 'Department',
      company: 'Company',
    };
    return `${editItem ? 'Edit' : 'Add'} ${titles[modalType]}`;
  };

  return (
    <div>
      <h2>Asset Controller</h2>
      <p className="text-muted">Manage dropdown data for asset forms</p>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        {/* Main Categories */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📦 Main Categories</h5>
              <Button size="sm" variant="primary" onClick={() => handleAdd('mainCategory')}>
                + Add
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mainCategories.map((item) => (
                    <tr key={item.MainCategoryID}>
                      <td><Badge bg="primary">{item.CategoryCode}</Badge></td>
                      <td><strong>{item.CategoryName}</strong></td>
                      <td>{item.Description}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-1"
                          onClick={() => handleEdit('mainCategory', item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('mainCategory', item.MainCategoryID!)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Categories */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🏷️ Categories</h5>
              <Button size="sm" variant="primary" onClick={() => handleAdd('category')}>
                + Add
              </Button>
            </Card.Header>
            <Card.Body>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Main Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((item) => (
                      <tr key={item.CategoryID}>
                        <td><strong>{item.CategoryName}</strong></td>
                        <td><Badge bg="secondary">{item.MainCategoryName}</Badge></td>
                        <td>
                          <Button
                            size="sm"
                            variant="warning"
                            className="me-1"
                            onClick={() => handleEdit('category', item)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete('category', item.CategoryID!)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Companies */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🏢 Companies</h5>
              <Button size="sm" variant="primary" onClick={() => handleAdd('company')}>
                + Add
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Company Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((item) => (
                    <tr key={item.CompanyID}>
                      <td><Badge bg="success">{item.CompanyCode}</Badge></td>
                      <td><strong>{item.CompanyName}</strong></td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-1"
                          onClick={() => handleEdit('company', item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('company', item.CompanyID!)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Locations */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">📍 Locations</h5>
              <Button size="sm" variant="primary" onClick={() => handleAdd('location')}>
                + Add
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Location Name</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((item) => (
                    <tr key={item.LocationID}>
                      <td><Badge bg="info">{item.LocationCode}</Badge></td>
                      <td><strong>{item.LocationName}</strong></td>
                      <td>{item.Department || '-'}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-1"
                          onClick={() => handleEdit('location', item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('location', item.LocationID!)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Departments */}
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">🏛️ Departments</h5>
              <Button size="sm" variant="primary" onClick={() => handleAdd('department')}>
                + Add
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((item) => (
                    <tr key={item.DepartmentID}>
                      <td><strong>{item.DepartmentName}</strong></td>
                      <td>{item.Description || '-'}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-1"
                          onClick={() => handleEdit('department', item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete('department', item.DepartmentID!)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{getModalTitle()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === 'mainCategory' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formData.CategoryName || ''}
                  onChange={(e) => setFormData({ ...formData, CategoryName: e.target.value })}
                  placeholder="e.g., Computer, Display"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category Code <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  maxLength={10}
                  value={formData.CategoryCode || ''}
                  onChange={(e) => setFormData({ ...formData, CategoryCode: e.target.value })}
                  placeholder="e.g., W, D, M"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  placeholder="Brief description"
                />
              </Form.Group>
            </>
          )}

          {modalType === 'category' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Main Category <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={formData.MainCategoryID || ''}
                  onChange={(e) => setFormData({ ...formData, MainCategoryID: parseInt(e.target.value) })}
                >
                  <option value="">Select Main Category</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.MainCategoryID} value={cat.MainCategoryID}>
                      {cat.CategoryName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Category Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formData.CategoryName || ''}
                  onChange={(e) => setFormData({ ...formData, CategoryName: e.target.value })}
                  placeholder="e.g., Laptop, Monitor"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  placeholder="Brief description"
                />
              </Form.Group>
            </>
          )}

          {modalType === 'location' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Location Code <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  maxLength={3}
                  value={formData.LocationCode || ''}
                  onChange={(e) => setFormData({ ...formData, LocationCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., VTE, LPB, PKS"
                  style={{ textTransform: 'uppercase' }}
                />
                <Form.Text className="text-muted">
                  3-letter code used for asset ID generation
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Location Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formData.LocationName || ''}
                  onChange={(e) => setFormData({ ...formData, LocationName: e.target.value })}
                  placeholder="e.g., Vientiane Main Office, Luang Prabang Branch"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Department</Form.Label>
                <Form.Select
                  value={formData.Department || ''}
                  onChange={(e) => setFormData({ ...formData, Department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.DepartmentID} value={dept.DepartmentName}>
                      {dept.DepartmentName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </>
          )}

          {modalType === 'department' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Department Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formData.DepartmentName || ''}
                  onChange={(e) => setFormData({ ...formData, DepartmentName: e.target.value })}
                  placeholder="e.g., IT, Sales, Marketing"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={formData.Description || ''}
                  onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                  placeholder="Brief description"
                />
              </Form.Group>
            </>
          )}

          {modalType === 'company' && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Company Code <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  maxLength={4}
                  value={formData.CompanyCode || ''}
                  onChange={(e) => setFormData({ ...formData, CompanyCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., RMAL, COMI, DEVC"
                  style={{ textTransform: 'uppercase' }}
                />
                <Form.Text className="text-muted">
                  4-letter code used for asset ID generation
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Company Name <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={formData.CompanyName || ''}
                  onChange={(e) => setFormData({ ...formData, CompanyName: e.target.value })}
                  placeholder="e.g., RMA Group, Comin, Devco Capital"
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssetController;
