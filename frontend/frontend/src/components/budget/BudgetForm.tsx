import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { BudgetPlan } from '../../types/budgetPlan';
import api from '../../services/api';

interface BudgetFormProps {
  isEdit?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ isEdit = false }) => {
  const [budgetPlan, setBudgetPlan] = useState<BudgetPlan>({
    PlanID: 0,
    Year: Number(new Date().getFullYear()),
    Department: '',
    EstimatedReplacementCost: 0,
    Approved: false,
    foo: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (isEdit && id) {
      fetchBudgetPlan(id);
    } else {
      setLoading(false);
    }
  }, [isEdit, id]);

const fetchBudgetPlan = async (planId: string) => {
  try {
    const response = await api.get(`/budgets/${planId}`);
    setBudgetPlan(response.data as BudgetPlan); // <-- Fix here
    setLoading(false);
  } catch (error) {
    console.error('Error fetching budget plan:', error);
    setError('Failed to fetch budget plan');
    setLoading(false);
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value, type } = target;
    setBudgetPlan({
      ...budgetPlan,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : 
              name === 'Year' || name === 'EstimatedReplacementCost' ? 
              Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isEdit && id) {
        await api.put(`/budgets/${id}`, budgetPlan);
        setSuccess('Budget plan updated successfully');
      } else {
        await api.post('/budgets', budgetPlan);
        setSuccess('Budget plan created successfully');
      }
      
      setTimeout(() => {
        navigate('/budget');
      }, 1500);
    } catch (error: any) {
      console.error('Error saving budget plan:', error);
      setError(error.response?.data?.message || 'Failed to save budget plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2>{isEdit ? 'Edit Budget Plan' : 'Add New Budget Plan'}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="Year">
              <Form.Label>Year</Form.Label>
              <Form.Control
                type="number"
                name="Year"
                value={budgetPlan.Year}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="Department">
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                name="Department"
                value={budgetPlan.Department}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="EstimatedReplacementCost">
              <Form.Label>Estimated Replacement Cost</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="EstimatedReplacementCost"
                value={budgetPlan.EstimatedReplacementCost}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="Approved">
              <Form.Check
                type="checkbox"
                name="Approved"
                label="Approved"
                checked={budgetPlan.Approved}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
        </Row>
        
        <Button variant="primary" type="submit" disabled={saving}>
          {saving ? 'Saving...' : (isEdit ? 'Update Budget Plan' : 'Create Budget Plan')}
        </Button>
        <Button variant="secondary" className="ms-2" onClick={() => navigate('/budget')}>
          Cancel
        </Button>
      </Form>
    </div>
  );
};

export default BudgetForm;
