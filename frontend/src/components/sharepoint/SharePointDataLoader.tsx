import React, { useState } from 'react';
import { Button, Card, Form, Alert, Spinner, Table } from 'react-bootstrap';
import { loadSharePointData, SharePointLoadResult } from '../../services/sharepoint';

/**
 * Example component demonstrating how to use the SharePoint loader
 */
const SharePointDataLoader: React.FC = () => {
  const [siteName, setSiteName] = useState('IT Assets');
  const [listName, setListName] = useState('Assets');
  const [tenantHostname, setTenantHostname] = useState('yourtenant.sharepoint.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SharePointLoadResult | null>(null);

  const handleLoadData = async () => {
    setLoading(true);
    setResult(null);

    try {
      const loadResult = await loadSharePointData({
        siteName,
        listName,
        tenantHostname,
      });

      setResult(loadResult);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sharepoint-data-loader p-4">
      <h2>SharePoint Data Loader</h2>
      <p className="text-muted">
        Load data from SharePoint using Microsoft Graph API
      </p>

      <Card className="mb-4">
        <Card.Header>
          <h5>Configuration</h5>
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tenant Hostname</Form.Label>
              <Form.Control
                type="text"
                value={tenantHostname}
                onChange={(e) => setTenantHostname(e.target.value)}
                placeholder="yourtenant.sharepoint.com"
              />
              <Form.Text className="text-muted">
                Your SharePoint tenant hostname
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Site Name</Form.Label>
              <Form.Control
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="IT Assets"
              />
              <Form.Text className="text-muted">
                Name of the SharePoint site
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>List Name</Form.Label>
              <Form.Control
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Assets"
              />
              <Form.Text className="text-muted">
                Display name of the SharePoint list
              </Form.Text>
            </Form.Group>

            <Button
              variant="primary"
              onClick={handleLoadData}
              disabled={loading || !siteName || !listName || !tenantHostname}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />
                  Loading...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-download me-2"></i>
                  Load Data
                </>
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {result && (
        <Card>
          <Card.Header>
            <h5>
              {result.success ? (
                <span className="text-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Success
                </span>
              ) : (
                <span className="text-danger">
                  <i className="bi bi-x-circle me-2"></i>
                  Error
                </span>
              )}
            </h5>
          </Card.Header>
          <Card.Body>
            {result.success ? (
              <>
                <Alert variant="success">
                  Successfully loaded {result.details?.itemCount} items
                </Alert>

                {result.details && (
                  <div className="mb-3">
                    <p>
                      <strong>Site ID:</strong> {result.details.siteId}
                    </p>
                    <p>
                      <strong>List ID:</strong> {result.details.listId}
                    </p>
                    <p>
                      <strong>Item Count:</strong> {result.details.itemCount}
                    </p>
                  </div>
                )}

                {result.data && result.data.length > 0 && (
                  <div>
                    <h6>Sample Data (first 5 items):</h6>
                    <div className="table-responsive">
                      <Table striped bordered hover size="sm">
                        <thead>
                          <tr>
                            {Object.keys(result.data[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.data.slice(0, 5).map((item, idx) => (
                            <tr key={idx}>
                              {Object.values(item).map((value: any, vidx) => (
                                <td key={vidx}>
                                  {typeof value === 'object'
                                    ? JSON.stringify(value)
                                    : String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    <details>
                      <summary>View Full JSON Data</summary>
                      <pre className="bg-light p-3 mt-2">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </>
            ) : (
              <Alert variant="danger">
                <strong>Error:</strong> {result.error}
              </Alert>
            )}
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default SharePointDataLoader;
