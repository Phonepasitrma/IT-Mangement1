import React, { useState } from 'react';
import { Alert, Button, Card, Form, ProgressBar, Table } from 'react-bootstrap';
import './ExcelImportExport.css';

interface ImportResult {
  total: number;
  inserted: number;
  updated: number;
  errors: Array<{
    row: number;
    assetId?: string;
    error: string;
  }>;
}

const ExcelImportExport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setError('Please select an Excel file (.xlsx or .xls)');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError('');
      setImportResult(null);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setError('');
      setSuccess('');

      const response = await fetch('http://localhost:5000/api/excel/export', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `assets_export_${new Date().toISOString().split('T')[0]}.xlsx`;

      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Assets exported successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to export assets');
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setError('');

      const response = await fetch('http://localhost:5000/api/excel/template', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Template download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'assets_import_template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('Template downloaded successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to download template');
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    try {
      setImporting(true);
      setError('');
      setSuccess('');
      setImportResult(null);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5000/api/excel/import', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Import failed');
      }

      setImportResult(data.results);
      setSuccess(data.message);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.message || 'Failed to import assets');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="excel-import-export">
      <h2>Excel Import/Export</h2>
      <p className="text-muted">Import and export asset data using Excel files</p>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <div className="row">
        {/* Export Section */}
        <div className="col-md-6 mb-4">
          <Card>
            <Card.Header>
              <h5><i className="bi bi-download me-2"></i>Export Assets</h5>
            </Card.Header>
            <Card.Body>
              <p>Export all assets from the database to an Excel file.</p>
              <ul className="text-muted small">
                <li>Includes all asset fields</li>
                <li>Includes location and company names</li>
                <li>Ready for editing and re-import</li>
              </ul>
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={exporting}
                className="w-100"
              >
                {exporting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Exporting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-file-earmark-excel me-2"></i>
                    Export to Excel
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </div>

        {/* Import Section */}
        <div className="col-md-6 mb-4">
          <Card>
            <Card.Header>
              <h5><i className="bi bi-upload me-2"></i>Import Assets</h5>
            </Card.Header>
            <Card.Body>
              <p>Import assets from an Excel file to the database.</p>
              <ul className="text-muted small">
                <li>Updates existing assets (by Asset ID)</li>
                <li>Creates new assets if not found</li>
                <li>Download template for correct format</li>
              </ul>
              
              <Button
                variant="outline-secondary"
                onClick={handleDownloadTemplate}
                className="w-100 mb-3"
                size="sm"
              >
                <i className="bi bi-file-earmark-arrow-down me-2"></i>
                Download Template
              </Button>

              <Form.Group className="mb-3">
                <Form.Label>Select Excel File</Form.Label>
                <Form.Control
                  id="fileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={importing}
                />
                {selectedFile && (
                  <Form.Text className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    {selectedFile.name}
                  </Form.Text>
                )}
              </Form.Group>

              <Button
                variant="success"
                onClick={handleImport}
                disabled={!selectedFile || importing}
                className="w-100"
              >
                {importing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Importing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-upload me-2"></i>
                    Import from Excel
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Import Progress */}
      {importing && (
        <Card className="mb-4">
          <Card.Body>
            <h6>Importing...</h6>
            <ProgressBar animated now={100} />
          </Card.Body>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card className="mb-4">
          <Card.Header>
            <h5><i className="bi bi-clipboard-check me-2"></i>Import Results</h5>
          </Card.Header>
          <Card.Body>
            <div className="row text-center mb-3">
              <div className="col-md-3">
                <div className="stat-box">
                  <h3 className="text-primary">{importResult.total}</h3>
                  <p className="text-muted mb-0">Total Rows</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-box">
                  <h3 className="text-success">{importResult.inserted}</h3>
                  <p className="text-muted mb-0">Inserted</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-box">
                  <h3 className="text-info">{importResult.updated}</h3>
                  <p className="text-muted mb-0">Updated</p>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-box">
                  <h3 className="text-danger">{importResult.errors.length}</h3>
                  <p className="text-muted mb-0">Errors</p>
                </div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="mt-4">
                <h6 className="text-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Errors ({importResult.errors.length})
                </h6>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Asset ID</th>
                        <th>Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importResult.errors.map((err, idx) => (
                        <tr key={idx}>
                          <td>{err.row}</td>
                          <td>{err.assetId || '-'}</td>
                          <td className="text-danger">{err.error}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <Card.Header>
          <h5><i className="bi bi-info-circle me-2"></i>Instructions</h5>
        </Card.Header>
        <Card.Body>
          <h6>Export Process:</h6>
          <ol>
            <li>Click "Export to Excel" to download all assets</li>
            <li>File will be saved with current date in filename</li>
            <li>Open in Excel to view or edit data</li>
          </ol>

          <h6 className="mt-3">Import Process:</h6>
          <ol>
            <li>Download the template file for correct format</li>
            <li>Fill in your asset data following the template structure</li>
            <li>Ensure Asset ID and Main Category are filled (required fields)</li>
            <li>Location and Company names must match existing records</li>
            <li>Select your completed Excel file</li>
            <li>Click "Import from Excel"</li>
            <li>Review the results and fix any errors if needed</li>
          </ol>

          <h6 className="mt-3">Important Notes:</h6>
          <ul>
            <li><strong>Asset ID:</strong> If exists, asset will be updated; if new, asset will be created</li>
            <li><strong>Dates:</strong> Use format YYYY-MM-DD (e.g., 2024-01-15)</li>
            <li><strong>Location/Company:</strong> Must exactly match names in your database</li>
            <li><strong>Status:</strong> Available, Assigned, Maintenance, or Retired</li>
            <li><strong>File Size:</strong> Maximum 10MB per file</li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ExcelImportExport;
