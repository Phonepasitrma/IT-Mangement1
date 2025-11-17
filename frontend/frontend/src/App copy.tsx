import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/common/Layout';
import Dashboard from './components/dashboard/Dashboard';
import AssetList from './components/assets/AssetList';
import AssetForm from './components/assets/AssetForm';
import AssetDetail from './components/assets/AssetDetail';
import CheckInOut from './components/checkInOut/CheckInOut';
import StockCount from './components/stockCount/StockCount';
import BudgetList from './components/budget/BudgetList';
import BudgetForm from './components/budget/BudgetForm';
import ReportList from './components/reports/ReportList';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="assets" element={<AssetList />} />
            <Route path="assets/new" element={<AssetForm />} />
            <Route path="assets/:id" element={<AssetDetail />} />
            <Route path="assets/:id/edit" element={<AssetForm isEdit />} />
            <Route path="checkinout" element={<CheckInOut />} />
            <Route path="stockcount" element={<StockCount />} />
            <Route path="budget" element={<BudgetList />} />
            <Route path="budget/new" element={<BudgetForm />} />
            <Route path="budget/:id/edit" element={<BudgetForm isEdit />} />
            <Route path="reports" element={<ReportList />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;