// frontend/src/components/assets/AssetForm.tsx
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { Asset } from '../../types/asset';
import { Location } from '../../types/location';
import api from '../../services/api';

interface AssetFormProps {
  isEdit?: boolean;
}

const AssetForm: React.FC<AssetFormProps> = ({ isEdit = false }) => {
  const [asset, setAsset] = useState<Asset>({
    AssetID: '',
    AssetName: '',
    Category: '',
    PurchaseDate: '',
    PurchasePrice: 0,
    DepreciationValue: 0,
    CurrentValue: 0,
    LocationID: 0,
    Status: 'Available',
    CreatedAt: new Date().toISOString(), // Add this
    UpdatedAt: new Date().toISOString(), // Add this
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
      const response = await api.get('/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to fetch locations');
    }
  };

  const fetchAsset = async (assetId: string) => {
    try {
      const response = await api.get(`/assets/${assetId}`);
      setAsset(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching asset:', error);
      setError('Failed to fetch asset');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAsset({
      ...asset,
      [name]: name === 'PurchasePrice' || name === 'DepreciationValue' || name === 'CurrentValue' || name === 'LocationID'
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
      // Add current timestamp for new assets
      const assetData = {
        ...asset,
        UpdatedAt: new Date().toISOString()
      };

      if (!isEdit) {
        assetData.CreatedAt = new Date().toISOString();
      }

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
        {/* ... rest of the form remains the same */}
      </Form>
    </div>
  );
};

export default AssetForm;