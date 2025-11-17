import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Modal, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BudgetPlan } from '../../types/budgetPlan';
import api from '../../services/api';

const BudgetList: React.FC = () => {
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<BudgetPlan[]>([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BudgetPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBudgetPlans();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [budgetPlans, yearFilter]);

  const fetchBudgetPlans = async () => {
    try {
      const response = await api.get<BudgetPlan[]>('/budgets');
      setBudgetPlans(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budget plans:', error);
      setError('Failed to fetch budget plans');
      setLoading(false);
    }
  };

  const filterPlans = () => {
    const filtered = budgetPlans.filter(plan => plan.Year === yearFilter);
    setFilteredPlans(filtered);
  };

  const handleDelete = async () => {
    if (selectedPlan) {
      try {
        await api.delete(`/budgets/${selectedPlan.PlanID}`);
        fetchBudgetPlans();
        setShowDeleteModal(false);
        setSelectedPlan(null);
        setSuccess('Budget plan deleted successfully');
      } catch (error: any) {
        console.error('Error deleting budget plan:', error);
        setError(error.response?.data?.message || 'Failed to delete budget plan');
      }
    }
  };

  const handleApprove = async (planId: number) => {
    try {
      await api.put(`/budgets/${planId}/approve`);
      fetchBudgetPlans();
      setSuccess('Budget plan approved successfully');
    } catch (error: any) {
      console.error('Error approving budget plan:', error);
      setError(error.response?.data?.message || 'Failed to approve budget plan');
    }
  };

  const handleGenerateForecast = async () => {
    try {
      await api.post(`/budgets/forecast/${yearFilter}`);
      fetchBudgetPlans();
      setSuccess('Budget forecast generated successfully');
    } catch (error: any) {
      console.error('Error generating budget forecast:', error);
      setError(error.response?.data?.message || 'Failed to generate budget forecast');
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get(`/reports/budget?year=${yearFilter}`, {
        responseType: 'blob',
      });
      
      const blob = response.data as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `budget_report_${yearFilter}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting budget report:', error);
    }
  };

  const years = [...new Set(budgetPlans.map(plan => plan.Year))].sort((a, b) => b - a);

  if (loading) {
    return <p>Loading budget plans...</p>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Budget Plans</h2>
        <div>
          <Link to="/budget/new" className="btn btn-primary me-2">
            Add Budget Plan
          </Link>
          <Button variant="outline-primary" className="me-2" onClick={handleGenerateForecast}>
            Generate Forecast
          </Button>
          <Button variant="outline-primary" onClick={handleExport}>
            Export
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="mb-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filter by Year</Form.Label>
            <Form.Select
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Plan ID</th>
            <th>Year</th>
            <th>Department</th>
            <th>Estimated Cost</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlans.map((plan) => (
            <tr key={plan.PlanID}>
              <td>{plan.PlanID}</td>
              <td>{plan.Year}</td>
              <td>{plan.Department}</td>
              <td>${plan.EstimatedReplacementCost.toFixed(2)}</td>
              <td>
                {plan.Approved ? (
                  <span className="badge bg-success">Approved</span>
                ) : (
                  <span className="badge bg-warning">Pending</span>
                )}
              </td>
              <td>
                <Link to={`/budget/${plan.PlanID}/edit`} className="btn btn-sm btn-warning me-1">
                  Edit
                </Link>
                {!plan.Approved && (
                  <Button
                    variant="success"
                    size="sm"
                    className="me-1"
                    onClick={() => handleApprove(plan.PlanID)}
                  >
                    Approve
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedPlan(plan);
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

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the budget plan for {selectedPlan?.Department} - {selectedPlan?.Year}?
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

export default BudgetList;
