import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Table, Badge, ProgressBar, Tabs, Tab, Form } from 'react-bootstrap';
import api from '../../services/api';
import { loadSharePointData, initializeMsal, isAuthenticated, loginWithPopup, logout } from '../../services/sharepoint';
import './SharePointSync.css';

interface SyncResults {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  failed: number;
  errors: Array<{ assetId: string; error: string }>;
}

interface SyncLog {
  SyncLogID: number;
  SyncDirection: string;
  EntityType: string;
  EntityID: string;
  SharePointItemID: number;
  Operation: string;
  Status: string;
  ErrorMessage: string;
  SyncedAt: string;
}

interface SyncStats {
  SyncDirection: string;
  EntityType: string;
  Status: string;
  Count: number;
  LastSync: string;
}

const SharePointSync: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncResults, setSyncResults] = useState<any>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [stats, setStats] = useState<SyncStats[]>([]);
  const [lastSyncTimes, setLastSyncTimes] = useState<any[]>([]);
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [comparison, setComparison] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  
  // MSAL Authentication state
  const [useMSAL, setUseMSAL] = useState(false);
  const [msalAuthenticated, setMsalAuthenticated] = useState(false);
  const [siteName, setSiteName] = useState('IT');
  const [listName, setListName] = useState('IT Asset DB');
  const [tenantHostname, setTenantHostname] = useState('rmaadminrmagroup.sharepoint.com');
  const [msalData, setMsalData] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
    
    // Initialize MSAL asynchronously
    const initMsal = async () => {
      try {
        await initializeMsal();
        setMsalAuthenticated(isAuthenticated());
        console.log('✓ MSAL initialized in SharePoint Sync');
      } catch (error) {
        console.error('MSAL initialization error:', error);
      }
    };
    
    initMsal();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get<SyncLog[]>('/sync/logs?limit=50');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get<{ statistics: SyncStats[]; lastSyncTimestamps: any[] }>('/sync/stats');
      setStats(response.data.statistics);
      setLastSyncTimes(response.data.lastSyncTimestamps);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSyncFromSharePoint = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setSyncResults(null);

    try {
      if (useMSAL) {
        // Load data from SharePoint using MSAL
        const result = await loadSharePointData({
          siteName,
          listName,
          tenantHostname,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to load SharePoint data');
        }

        // Send MSAL data to backend for processing
        const response = await api.post<{ results: any }>('/sync/process-sharepoint-data', {
          items: result.data,
          source: 'MSAL',
          siteId: result.details?.siteId,
          listId: result.details?.listId,
        });

        setSyncResults(response.data.results);
        setSuccess(`Successfully synced ${result.data?.length} items from SharePoint to Database using MSAL`);
        fetchLogs();
        fetchStats();
      } else {
        // Use backend service
        const response = await api.post<{ results: any }>('/sync/from-sharepoint');
        setSyncResults(response.data.results);
        setSuccess('Successfully synced from SharePoint to Database');
        fetchLogs();
        fetchStats();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to sync from SharePoint');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToSharePoint = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setSyncResults(null);

    try {
      const response = await api.post<{ results: any }>('/sync/to-sharepoint');
      setSyncResults(response.data.results);
      setSuccess('Successfully synced from Database to SharePoint');
      fetchLogs();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sync to SharePoint');
    } finally {
      setLoading(false);
    }
  };

  const handleBidirectionalSync = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setSyncResults(null);

    try {
      const response = await api.post<{ results: any }>('/sync/bidirectional');
      setSyncResults(response.data.results);
      setSuccess(`Bidirectional sync completed in ${response.data.results.duration}s`);
      fetchLogs();
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to perform bidirectional sync');
    } finally {
      setLoading(false);
    }
  };

  const handleMSALLogin = async () => {
    try {
      setError('');
      const result = await loginWithPopup();
      
      if (result.success) {
        setMsalAuthenticated(true);
        setSuccess('Successfully logged in to Office 365!');
      } else {
        setError(`Login failed: ${result.error}`);
      }
    } catch (err: any) {
      setError(`Login error: ${err.message}`);
    }
  };

  const handleMSALLogout = async () => {
    try {
      await logout();
      setMsalAuthenticated(false);
      setMsalData(null);
      setSuccess('Logged out successfully');
    } catch (err: any) {
      setError(`Logout error: ${err.message}`);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setError('');
    setConnectionTest(null);

    try {
      if (useMSAL) {
        // Use MSAL to test connection
        const result = await loadSharePointData({
          siteName,
          listName,
          tenantHostname,
        });

        if (result.success) {
          setConnectionTest({
            success: true,
            message: `✓ MSAL: Successfully connected. Found ${result.details?.itemCount} items in list "${listName}"`,
            mockMode: false,
            details: {
              siteUrl: `https://${tenantHostname}/sites/${siteName}`,
              listName: listName,
              authenticated: true,
              listAccessible: true,
              itemCount: result.details?.itemCount || 0,
              sampleItems: result.data?.slice(0, 5).map((item: any) => ({
                ID: item.ID || item.id,
                AssetID: item.AssetID || item.Title,
                MainCategory: item.MainCategory || item.Category,
                Status: item.Status,
              })) || [],
            },
          });
          setMsalData(result.data);
          setSuccess('SharePoint connection successful via MSAL!');
        } else {
          setError(result.error || 'Failed to connect to SharePoint');
          setConnectionTest({ success: false, message: result.error });
        }
      } else {
        // Use backend mock/service
        const response = await api.get<any>('/sync/test-connection');
        setConnectionTest(response.data);
        if (response.data.success) {
          setSuccess('SharePoint connection successful!');
        } else {
          setError(response.data.message);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to test connection');
      setConnectionTest({ success: false, message: err.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleCompareData = async () => {
    setComparing(true);
    setError('');
    setComparison(null);

    try {
      if (useMSAL && msalData) {
        // Use MSAL data for comparison
        const dbResponse = await api.get<any>('/assets');
        const dbAssets = dbResponse.data;

        const comparison = {
          sharepoint: {
            total: msalData.length,
            items: msalData,
          },
          database: {
            total: dbAssets.length,
            items: dbAssets,
          },
          matching: { count: 0, items: [] },
          onlyInSharePoint: { count: 0, items: [] },
          onlyInDatabase: { count: 0, items: [] },
          conflicts: { count: 0, items: [] },
        };

        // Compare logic
        const spMap = new Map(msalData.map((item: any) => [item.AssetID || item.Title, item]));
        const dbMap = new Map(dbAssets.map((item: any) => [item.AssetID, item]));

        // Find matching and conflicts
        for (const [assetId, spItem] of spMap) {
          if (dbMap.has(assetId)) {
            const dbItem: any = dbMap.get(assetId);
            const spItemAny: any = spItem;
            if (spItemAny.Status === dbItem.Status && spItemAny.MainCategory === dbItem.MainCategory) {
              comparison.matching.count++;
              (comparison.matching.items as any[]).push({ AssetID: assetId });
            } else {
              comparison.conflicts.count++;
              (comparison.conflicts.items as any[]).push({
                AssetID: assetId,
                sharepoint: spItem,
                database: dbItem,
              });
            }
          } else {
            comparison.onlyInSharePoint.count++;
            (comparison.onlyInSharePoint.items as any[]).push(spItem);
          }
        }

        // Find items only in database
        for (const [assetId, dbItem] of dbMap) {
          if (!spMap.has(assetId)) {
            comparison.onlyInDatabase.count++;
            (comparison.onlyInDatabase.items as any[]).push(dbItem);
          }
        }

        setComparison(comparison);
        setSuccess('Data comparison completed using MSAL data');
      } else {
        // Use backend comparison
        const response = await api.get<any>('/sync/compare');
        setComparison(response.data.comparison);
        setSuccess('Data comparison completed');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to compare data');
    } finally {
      setComparing(false);
    }
  };

  const handlePreviewSync = async (direction: string) => {
    setPreviewing(true);
    setError('');
    setPreview(null);

    try {
      const response = await api.get<any>(`/sync/preview?direction=${direction}`);
      setPreview(response.data.preview);
      setSuccess('Sync preview completed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to preview sync');
    } finally {
      setPreviewing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Success':
        return 'success';
      case 'Failed':
        return 'danger';
      case 'Skipped':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'Insert':
        return 'bi-plus-circle';
      case 'Update':
        return 'bi-arrow-repeat';
      case 'Skip':
        return 'bi-dash-circle';
      default:
        return 'bi-question-circle';
    }
  };

  return (
    <div className="sharepoint-sync">
      <div className="sync-header mb-4">
        <h2>
          <i className="bi bi-cloud-arrow-up-down me-2"></i>
          SharePoint Synchronization
        </h2>
        <p className="text-muted">
          Sync assets between SQL Server Database and SharePoint Lists
        </p>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Tabs defaultActiveKey="test" className="mb-3">
        {/* Test Connection Tab */}
        <Tab eventKey="test" title="Test & Compare">
          {/* MSAL Configuration Card */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-gear me-2"></i>
                Connection Method
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Check
                  type="switch"
                  id="use-msal-switch"
                  label={
                    <span>
                      <strong>Use MSAL Authentication</strong>
                      <br />
                      <small className="text-muted">
                        {useMSAL 
                          ? 'Using Microsoft Authentication Library (MSAL) for real SharePoint connection'
                          : 'Using backend service (Mock mode or configured service)'}
                      </small>
                    </span>
                  }
                  checked={useMSAL}
                  onChange={(e) => setUseMSAL(e.target.checked)}
                  className="mb-3"
                />

                {useMSAL && (
                  <>
                    <Alert variant="info">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>MSAL Mode:</strong> You'll authenticate directly with Office 365 and load data from SharePoint using Microsoft Graph API.
                    </Alert>

                    <div className="mb-3">
                      <div className="d-flex align-items-center gap-2 mb-3">
                        {msalAuthenticated ? (
                          <>
                            <Badge bg="success" className="p-2">
                              <i className="bi bi-check-circle me-1"></i>
                              Authenticated
                            </Badge>
                            <Button variant="outline-secondary" size="sm" onClick={handleMSALLogout}>
                              <i className="bi bi-box-arrow-right me-1"></i>
                              Logout
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge bg="warning" className="p-2">
                              <i className="bi bi-exclamation-circle me-1"></i>
                              Not Authenticated
                            </Badge>
                            <Button variant="primary" size="sm" onClick={handleMSALLogin}>
                              <i className="bi bi-box-arrow-in-right me-1"></i>
                              Login with Office 365
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label>Tenant Hostname</Form.Label>
                      <Form.Control
                        type="text"
                        value={tenantHostname}
                        onChange={(e) => setTenantHostname(e.target.value)}
                        placeholder="yourtenant.sharepoint.com"
                      />
                      <Form.Text className="text-muted">
                        Your SharePoint tenant hostname (e.g., contoso.sharepoint.com)
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
                  </>
                )}
              </Form>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-plug me-2"></i>
                Test SharePoint Connection
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Test the connection to your SharePoint site and verify list access before syncing.
              </p>
              <Button
                variant="primary"
                onClick={handleTestConnection}
                disabled={testingConnection || (useMSAL && !msalAuthenticated)}
              >
                <i className="bi bi-lightning me-2"></i>
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
              
              {useMSAL && !msalAuthenticated && (
                <Alert variant="warning" className="mt-3 mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Please login with Office 365 first to test the connection.
                </Alert>
              )}

              {connectionTest && (
                <div className="mt-4">
                  {useMSAL && connectionTest.success && (
                    <Alert variant="info" className="mb-3">
                      <i className="bi bi-shield-check me-2"></i>
                      <strong>MSAL Mode:</strong> Connected using Microsoft Authentication Library with real SharePoint data.
                    </Alert>
                  )}
                  {!useMSAL && connectionTest.mockMode && (
                    <Alert variant="info" className="mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Mock Mode:</strong> Using simulated SharePoint data for testing. No real SharePoint connection.
                    </Alert>
                  )}
                  <Alert variant={connectionTest.success ? 'success' : 'danger'}>
                    <strong>{connectionTest.success ? '✓ Success' : '✗ Failed'}:</strong> {connectionTest.message}
                  </Alert>

                  {connectionTest.details && (
                    <Card>
                      <Card.Header>Connection Details</Card.Header>
                      <Card.Body>
                        <Table bordered>
                          <tbody>
                            <tr>
                              <td><strong>Site URL:</strong></td>
                              <td>{connectionTest.details.siteUrl}</td>
                            </tr>
                            <tr>
                              <td><strong>List Name:</strong></td>
                              <td>{connectionTest.details.listName}</td>
                            </tr>
                            <tr>
                              <td><strong>Authenticated:</strong></td>
                              <td>
                                {connectionTest.details.authenticated ? (
                                  <Badge bg="success">Yes</Badge>
                                ) : (
                                  <Badge bg="danger">No</Badge>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td><strong>List Accessible:</strong></td>
                              <td>
                                {connectionTest.details.listAccessible ? (
                                  <Badge bg="success">Yes</Badge>
                                ) : (
                                  <Badge bg="danger">No</Badge>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td><strong>Items Found:</strong></td>
                              <td><Badge bg="info">{connectionTest.details.itemCount}</Badge></td>
                            </tr>
                          </tbody>
                        </Table>

                        {connectionTest.details.sampleItems && connectionTest.details.sampleItems.length > 0 && (
                          <div className="mt-3">
                            <h6>Sample Items (First 5):</h6>
                            <Table striped bordered hover size="sm">
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Asset ID</th>
                                  <th>Category</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {connectionTest.details.sampleItems.map((item: any) => (
                                  <tr key={item.ID}>
                                    <td>{item.ID}</td>
                                    <td><code>{item.AssetID}</code></td>
                                    <td>{item.MainCategory}</td>
                                    <td><Badge bg="info">{item.Status}</Badge></td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-arrow-left-right me-2"></i>
                Compare Data
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Compare data between SharePoint and Database to identify differences before syncing.
              </p>
              <Button
                variant="info"
                onClick={handleCompareData}
                disabled={comparing}
              >
                <i className="bi bi-diagram-3 me-2"></i>
                {comparing ? 'Comparing...' : 'Compare Data'}
              </Button>

              {comparison && (
                <div className="mt-4">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <Card>
                        <Card.Body className="text-center">
                          <h3>{comparison.sharepoint.total}</h3>
                          <p className="mb-0">Items in SharePoint</p>
                        </Card.Body>
                      </Card>
                    </div>
                    <div className="col-md-6">
                      <Card>
                        <Card.Body className="text-center">
                          <h3>{comparison.database.total}</h3>
                          <p className="mb-0">Items in Database</p>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-3">
                      <div className="stat-box stat-success">
                        <div className="stat-value">{comparison.matching.count}</div>
                        <div className="stat-label">Matching</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-box stat-info">
                        <div className="stat-value">{comparison.onlyInSharePoint.count}</div>
                        <div className="stat-label">Only in SharePoint</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-box stat-info">
                        <div className="stat-value">{comparison.onlyInDatabase.count}</div>
                        <div className="stat-label">Only in Database</div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-box stat-danger">
                        <div className="stat-value">{comparison.conflicts.count}</div>
                        <div className="stat-label">Conflicts</div>
                      </div>
                    </div>
                  </div>

                  {comparison.conflicts.count > 0 && (
                    <Alert variant="warning" className="mt-3">
                      <strong>⚠ Conflicts Found:</strong> {comparison.conflicts.count} items have different data in SharePoint and Database.
                      <details className="mt-2">
                        <summary>View Conflicts</summary>
                        <Table striped bordered size="sm" className="mt-2">
                          <thead>
                            <tr>
                              <th>Asset ID</th>
                              <th>SharePoint</th>
                              <th>Database</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparison.conflicts.items.slice(0, 10).map((conflict: any, index: number) => (
                              <tr key={index}>
                                <td><code>{conflict.AssetID}</code></td>
                                <td>
                                  <small>
                                    {conflict.sharepoint.MainCategory} | {conflict.sharepoint.Status}
                                  </small>
                                </td>
                                <td>
                                  <small>
                                    {conflict.database.MainCategory} | {conflict.database.Status}
                                  </small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </details>
                    </Alert>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Sync Tab */}
        <Tab eventKey="sync" title="Synchronization">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-arrow-left-right me-2"></i>
                Sync Operations
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSyncFromSharePoint}
                  disabled={loading}
                >
                  <i className="bi bi-cloud-download me-2"></i>
                  {loading ? 'Syncing...' : 'Sync from SharePoint to Database'}
                </Button>

                <Button
                  variant="info"
                  size="lg"
                  onClick={handleSyncToSharePoint}
                  disabled={loading}
                >
                  <i className="bi bi-cloud-upload me-2"></i>
                  {loading ? 'Syncing...' : 'Sync from Database to SharePoint'}
                </Button>

                <Button
                  variant="success"
                  size="lg"
                  onClick={handleBidirectionalSync}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-left-right me-2"></i>
                  {loading ? 'Syncing...' : 'Bidirectional Sync (Both Ways)'}
                </Button>
              </div>

              {loading && (
                <div className="mt-4">
                  <ProgressBar animated now={100} label="Syncing..." />
                </div>
              )}
            </Card.Body>
          </Card>

          {syncResults && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-bar-chart me-2"></i>
                  Sync Results
                </h5>
              </Card.Header>
              <Card.Body>
                {syncResults.fromSharePoint && (
                  <div className="mb-4">
                    <h6>From SharePoint to Database:</h6>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="stat-box">
                          <div className="stat-value">{syncResults.fromSharePoint.total}</div>
                          <div className="stat-label">Total</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="stat-box stat-success">
                          <div className="stat-value">{syncResults.fromSharePoint.inserted}</div>
                          <div className="stat-label">Inserted</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="stat-box stat-info">
                          <div className="stat-value">{syncResults.fromSharePoint.updated}</div>
                          <div className="stat-label">Updated</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="stat-box stat-danger">
                          <div className="stat-value">{syncResults.fromSharePoint.failed}</div>
                          <div className="stat-label">Failed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {syncResults.toSharePoint && (
                  <div>
                    <h6>From Database to SharePoint:</h6>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="stat-box">
                          <div className="stat-value">{syncResults.toSharePoint.total}</div>
                          <div className="stat-label">Total</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="stat-box stat-success">
                          <div className="stat-value">{syncResults.toSharePoint.inserted}</div>
                          <div className="stat-label">Inserted</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="stat-box stat-info">
                          <div className="stat-value">{syncResults.toSharePoint.updated}</div>
                          <div className="stat-label">Updated</div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="stat-box stat-danger">
                          <div className="stat-value">{syncResults.toSharePoint.failed}</div>
                          <div className="stat-label">Failed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {syncResults.errors && syncResults.errors.length > 0 && (
                  <div className="mt-3">
                    <Alert variant="warning">
                      <strong>Errors:</strong>
                      <ul className="mb-0 mt-2">
                        {syncResults.errors.map((err: any, index: number) => (
                          <li key={index}>
                            {err.assetId}: {err.error}
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Tab>

        {/* Statistics Tab */}
        <Tab eventKey="stats" title="Statistics">
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="bi bi-graph-up me-2"></i>
                Sync Statistics
              </h5>
            </Card.Header>
            <Card.Body>
              {stats.length > 0 ? (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Direction</th>
                      <th>Entity Type</th>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Last Sync</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((stat, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg={stat.SyncDirection === 'ToDatabase' ? 'primary' : 'info'}>
                            {stat.SyncDirection}
                          </Badge>
                        </td>
                        <td>{stat.EntityType}</td>
                        <td>
                          <Badge bg={getStatusBadge(stat.Status)}>
                            {stat.Status}
                          </Badge>
                        </td>
                        <td>{stat.Count}</td>
                        <td>{new Date(stat.LastSync).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No sync statistics available</p>
              )}

              <h6 className="mt-4">Last Sync Timestamps:</h6>
              {lastSyncTimes.length > 0 ? (
                <Table striped bordered>
                  <thead>
                    <tr>
                      <th>Direction</th>
                      <th>Entity Type</th>
                      <th>Last Sync Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastSyncTimes.map((time, index) => (
                      <tr key={index}>
                        <td>
                          <Badge bg={time.SyncDirection === 'ToDatabase' ? 'primary' : 'info'}>
                            {time.SyncDirection}
                          </Badge>
                        </td>
                        <td>{time.EntityType}</td>
                        <td>{new Date(time.LastSyncTime).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No sync timestamps available</p>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Logs Tab */}
        <Tab eventKey="logs" title="Sync Logs">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Recent Sync Logs
              </h5>
              <Button variant="outline-primary" size="sm" onClick={fetchLogs}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Refresh
              </Button>
            </Card.Header>
            <Card.Body>
              {logs.length > 0 ? (
                <div className="table-responsive">
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Direction</th>
                        <th>Entity ID</th>
                        <th>Operation</th>
                        <th>Status</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.SyncLogID}>
                          <td>
                            <small>{new Date(log.SyncedAt).toLocaleString()}</small>
                          </td>
                          <td>
                            <Badge bg={log.SyncDirection === 'ToDatabase' ? 'primary' : 'info'} pill>
                              {log.SyncDirection}
                            </Badge>
                          </td>
                          <td>
                            <code>{log.EntityID}</code>
                          </td>
                          <td>
                            <i className={`bi ${getOperationIcon(log.Operation)} me-1`}></i>
                            {log.Operation}
                          </td>
                          <td>
                            <Badge bg={getStatusBadge(log.Status)} pill>
                              {log.Status}
                            </Badge>
                          </td>
                          <td>
                            {log.ErrorMessage && (
                              <small className="text-danger">{log.ErrorMessage}</small>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted">No sync logs available</p>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default SharePointSync;
