import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Alert, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import AssetController from './AssetController';
import UserController from './UserController';

interface CodePattern {
  type: string;
  country: string;
  company: string;
  province: string;
  year: string;
  runningNumber: string;
}

const SystemConfig: React.FC = () => {
  const [pattern, setPattern] = useState<CodePattern>({
    type: 'W',
    country: 'TH',
    company: 'COMN',
    province: 'RMA',
    year: '24',
    runningNumber: '001'
  });

  const [generatedCode, setGeneratedCode] = useState('');
  const [activeTab, setActiveTab] = useState('generator');

  // Configuration data organized by groups
  const configGroups = {
    assetTypes: [
      { code: 'W', name: 'Workstation', description: 'Desktop computers' },
      { code: 'L', name: 'Laptop', description: 'Portable computers' },
      { code: 'P', name: 'POS', description: 'Point of Sale systems' },
      { code: 'M', name: 'Mobile Device', description: 'Smartphones and tablets' },
      { code: 'N', name: 'Network Equipment', description: 'Routers, switches, etc.' },
      { code: 'S', name: 'Server', description: 'Server hardware' },
      { code: 'D', name: 'Display', description: 'Monitors and screens' },
      { code: 'R', name: 'Printer', description: 'Printing devices' },
    ],

    countries: [
      { code: 'TH', name: 'Thailand', description: 'Thailand operations' },
      { code: 'LA', name: 'Lao PDR', description: 'Laos operations' },
      { code: 'AV', name: 'AVIS', description: 'AVIS operations' },
    ],

    companies: [
      { code: 'COMN', name: 'Comin', description: 'Comin company' },
      { code: 'DVCO', name: 'Devco Capital', description: 'Devco Capital company' },
      { code: 'FORD', name: 'FORD/RMA City Motors', description: 'Ford dealership' },
      { code: 'GLFS', name: 'Global Fleet Sales', description: 'Fleet sales division' },
      { code: 'LARV', name: 'Land Rover', description: 'Land Rover dealership' },
      { code: 'EFGL', name: 'Express Food Laos', description: 'Food service company' },
    ],

    provinces: [
      { code: 'RMA', name: 'RMA', description: 'RMA location' },
      { code: 'GLB', name: 'Global', description: 'Global/Central location' },
      { code: 'LPB', name: 'Luang Prabang', description: 'Luang Prabang branch' },
      { code: 'VTE', name: 'Vientiane', description: 'Vientiane branch' },
      { code: 'BKK', name: 'Bangkok', description: 'Bangkok branch' },
      { code: 'CMI', name: 'Chiang Mai', description: 'Chiang Mai branch' },
    ],

    assetStatuses: [
      { code: 'Available', name: 'Available', description: 'Ready to be assigned', color: 'success' },
      { code: 'Assigned', name: 'Assigned', description: 'Currently in use', color: 'primary' },
      { code: 'Under Repair', name: 'Under Repair', description: 'Being repaired', color: 'warning' },
      { code: 'Retired', name: 'Retired', description: 'No longer in service', color: 'secondary' },
      { code: 'Lost', name: 'Lost', description: 'Missing or stolen', color: 'danger' },
    ],

    categories: [
      { group: 'Computer', items: ['Laptop', 'Desktop', 'Workstation', 'All-in-One'] },
      { group: 'Display', items: ['Monitor', 'Projector', 'TV Screen'] },
      { group: 'Mobile Device', items: ['Smartphone', 'Tablet', 'iPad'] },
      { group: 'Network Equipment', items: ['Router', 'Switch', 'Access Point', 'Firewall'] },
      { group: 'Printer', items: ['Laser Printer', 'Inkjet Printer', 'Multi-function Printer'] },
      { group: 'Other', items: ['UPS', 'Scanner', 'External HDD', 'Webcam'] },
    ],

    departments: [
      'IT', 'Sales', 'Marketing', 'Finance', 'HR', 'Operations', 
      'Customer Service', 'Logistics', 'Administration', 'Management'
    ],

    warrantyTypes: [
      { name: 'Standard Warranty', description: 'Manufacturer standard warranty' },
      { name: 'Extended Warranty', description: 'Extended coverage period' },
      { name: 'On-site Support', description: 'On-site repair service' },
      { name: 'Next Business Day', description: 'Next day replacement' },
      { name: 'Premium Support', description: '24/7 support coverage' },
    ],
  };

  const handleChange = (field: keyof CodePattern, value: string) => {
    setPattern({
      ...pattern,
      [field]: value
    });
  };

  const generateCode = () => {
    const code = `${pattern.type}${pattern.country}${pattern.company}${pattern.province}${pattern.year}${pattern.runningNumber}`;
    setGeneratedCode(code);
  };

  const getCodeBreakdown = () => {
    if (!generatedCode) return null;
    
    return [
      { position: '1', value: generatedCode[0], description: 'Type', detail: configGroups.assetTypes.find(t => t.code === pattern.type)?.name },
      { position: '2-3', value: generatedCode.substring(1, 3), description: 'Country', detail: configGroups.countries.find(c => c.code === pattern.country)?.name },
      { position: '4-7', value: generatedCode.substring(3, 7), description: 'Company', detail: configGroups.companies.find(c => c.code === pattern.company)?.name },
      { position: '8-10', value: generatedCode.substring(7, 10), description: 'Province/Branch', detail: configGroups.provinces.find(p => p.code === pattern.province)?.name },
      { position: '11-12', value: generatedCode.substring(10, 12), description: 'Year', detail: `20${pattern.year}` },
      { position: '13-15', value: generatedCode.substring(12, 15), description: 'Running Number', detail: pattern.runningNumber },
    ];
  };

  return (
    <div>
      <h2>System Configuration</h2>
      <p className="text-muted">Manage all system settings and code patterns</p>

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'generator')} className="mb-3">
        {/* Asset ID Generator Tab */}
        <Tab eventKey="generator" title="Asset ID Generator">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">🔢 Asset ID Code Pattern Generator</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info">
                <strong>Asset ID Format:</strong> [Type][Country][Company][Province][Year][Running Number]
                <br />
                <strong>Example:</strong> WTHCOMNRMA24001 = Workstation, Thailand, Comin, RMA, 2024, #001
              </Alert>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Type (1 digit)</Form.Label>
                    <Form.Select
                      value={pattern.type}
                      onChange={(e) => handleChange('type', e.target.value)}
                    >
                      {configGroups.assetTypes.map((type) => (
                        <option key={type.code} value={type.code}>
                          {type.code} - {type.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Country (2 digits)</Form.Label>
                    <Form.Select
                      value={pattern.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                    >
                      {configGroups.countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code} - {country.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Company (4 digits)</Form.Label>
                    <Form.Select
                      value={pattern.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                    >
                      {configGroups.companies.map((company) => (
                        <option key={company.code} value={company.code}>
                          {company.code} - {company.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Province/Branch (3 digits)</Form.Label>
                    <Form.Select
                      value={pattern.province}
                      onChange={(e) => handleChange('province', e.target.value)}
                    >
                      {configGroups.provinces.map((province) => (
                        <option key={province.code} value={province.code}>
                          {province.code} - {province.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Year (2 digits)</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={2}
                      value={pattern.year}
                      onChange={(e) => handleChange('year', e.target.value)}
                      placeholder="24"
                    />
                    <Form.Text className="text-muted">
                      Last 2 digits of year (e.g., 24 for 2024)
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Running Number (3 digits)</Form.Label>
                    <Form.Control
                      type="text"
                      maxLength={3}
                      value={pattern.runningNumber}
                      onChange={(e) => handleChange('runningNumber', e.target.value)}
                      placeholder="001"
                    />
                    <Form.Text className="text-muted">
                      Sequential number (001-999)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" onClick={generateCode} size="lg">
                🎯 Generate Asset ID
              </Button>

              {generatedCode && (
                <div className="mt-4">
                  <Alert variant="success">
                    <h5>Generated Asset ID:</h5>
                    <h3 className="mb-0">
                      <Badge bg="success" style={{ fontSize: '1.5rem', padding: '15px 30px' }}>
                        {generatedCode}
                      </Badge>
                    </h3>
                  </Alert>

                  <Card>
                    <Card.Header>Code Breakdown</Card.Header>
                    <Card.Body>
                      <Table striped bordered hover>
                        <thead>
                          <tr>
                            <th>Position</th>
                            <th>Value</th>
                            <th>Description</th>
                            <th>Detail</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getCodeBreakdown()?.map((item, index) => (
                            <tr key={index}>
                              <td><Badge bg="secondary">{item.position}</Badge></td>
                              <td><strong>{item.value}</strong></td>
                              <td>{item.description}</td>
                              <td>{item.detail}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Asset Types Tab */}
        <Tab eventKey="types" title="Asset Types">
          <Card>
            <Card.Header>
              <h5 className="mb-0">💻 Asset Type Codes</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {configGroups.assetTypes.map((type) => (
                    <tr key={type.code}>
                      <td><Badge bg="primary" style={{ fontSize: '1rem' }}>{type.code}</Badge></td>
                      <td><strong>{type.name}</strong></td>
                      <td>{type.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Locations Tab */}
        <Tab eventKey="locations" title="Locations">
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">🌍 Country Codes</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configGroups.countries.map((country) => (
                        <tr key={country.code}>
                          <td><Badge bg="info">{country.code}</Badge></td>
                          <td><strong>{country.name}</strong></td>
                          <td>{country.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">📍 Province/Branch Codes</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configGroups.provinces.map((province) => (
                        <tr key={province.code}>
                          <td><Badge bg="success">{province.code}</Badge></td>
                          <td><strong>{province.name}</strong></td>
                          <td>{province.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Companies Tab */}
        <Tab eventKey="companies" title="Companies">
          <Card>
            <Card.Header>
              <h5 className="mb-0">🏢 Company Codes</h5>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Company Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {configGroups.companies.map((company) => (
                    <tr key={company.code}>
                      <td><Badge bg="warning" style={{ fontSize: '0.9rem' }}>{company.code}</Badge></td>
                      <td><strong>{company.name}</strong></td>
                      <td>{company.description}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        {/* Status & Categories Tab */}
        <Tab eventKey="status" title="Status & Categories">
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">📊 Asset Status</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configGroups.assetStatuses.map((status) => (
                        <tr key={status.code}>
                          <td><Badge bg={status.color as any}>{status.name}</Badge></td>
                          <td>{status.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">🏷️ Asset Categories</h5>
                </Card.Header>
                <Card.Body>
                  {configGroups.categories.map((category) => (
                    <div key={category.group} className="mb-3">
                      <h6><Badge bg="secondary">{category.group}</Badge></h6>
                      <div className="ms-3">
                        {category.items.map((item) => (
                          <Badge key={item} bg="light" text="dark" className="me-2 mb-2">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Departments & Warranty Tab */}
        <Tab eventKey="other" title="Departments & Warranty">
          <Row>
            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">🏛️ Departments</h5>
                </Card.Header>
                <Card.Body>
                  <div className="d-flex flex-wrap gap-2">
                    {configGroups.departments.map((dept) => (
                      <Badge key={dept} bg="primary" style={{ fontSize: '0.9rem', padding: '8px 15px' }}>
                        {dept}
                      </Badge>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-3">
                <Card.Header>
                  <h5 className="mb-0">🛡️ Warranty Types</h5>
                </Card.Header>
                <Card.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configGroups.warrantyTypes.map((warranty, index) => (
                        <tr key={index}>
                          <td><strong>{warranty.name}</strong></td>
                          <td>{warranty.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* Asset Controller Tab */}
        <Tab eventKey="controller" title="Asset Controller">
          <AssetController />
        </Tab>

        {/* User Management Tab */}
        <Tab eventKey="users" title="User Management">
          <UserController />
        </Tab>
      </Tabs>
    </div>
  );
};

export default SystemConfig;
