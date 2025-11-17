import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Asset } from '../../types/asset';
import api from '../../services/api';

const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchTerm]);

  const fetchAssets = async () => {
    try {
      const response = await api.get<Asset[]>('/assets');
      setAssets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setLoading(false);
    }
  };

  const filterAssets = () => {
    if (!searchTerm) {
      setFilteredAssets(assets);
    } else {
      const filtered = assets.filter(
        asset =>
          asset.AssetID.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.ModelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.Brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.Category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.LocationName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAssets(filtered);
    }
  };

  const handleDelete = async () => {
    if (selectedAsset) {
      try {
        await api.delete(`/assets/${selectedAsset.AssetID}`);
        fetchAssets();
        setShowDeleteModal(false);
        setSelectedAsset(null);
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get<Blob>('/assets/export/all', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'assets_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting assets:', error);
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Assets</h2>
        <div>
          <Link to="/assets/new" className="btn btn-primary me-2">
            Add Asset
          </Link>
          <Button variant="outline-primary" onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      {loading ? (
        <p>Loading assets...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Asset ID</th>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map((asset) => (
              <tr key={asset.AssetID}>
                <td>{asset.AssetID}</td>
                <td>{asset.ModelName || asset.Brand || 'N/A'}</td>
                <td>{asset.Category}</td>
                <td>{asset.LocationName}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(asset.Status)}`}>
                    {asset.Status}
                  </span>
                </td>
                <td>
                  <Link to={`/assets/${asset.AssetID}`} className="btn btn-sm btn-info me-1">
                    View
                  </Link>
                  <Link to={`/assets/${asset.AssetID}/edit`} className="btn btn-sm btn-warning me-1">
                    Edit
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete asset {selectedAsset?.AssetID} - {selectedAsset?.ModelName || selectedAsset?.Brand}?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AssetList;
