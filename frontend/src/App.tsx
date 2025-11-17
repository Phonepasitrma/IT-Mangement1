import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import ChangePassword from './components/auth/ChangePassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Dashboard from './components/dashboard/Dashboard';
import AssetList from './components/assets/AssetList';
import AssetForm from './components/assets/AssetForm';
import AssetDetail from './components/assets/AssetDetail';
import CheckInOut from './components/checkInOut/CheckInOut';
import StockCount from './components/stockCount/StockCount';
import BudgetList from './components/budget/BudgetList';
import BudgetForm from './components/budget/BudgetForm';
import ReportList from './components/reports/ReportList';
import SystemConfig from './components/config/SystemConfig';
import SharePointSync from './components/sync/SharePointSync';
import ExcelImportExport from './components/excel/ExcelImportExport';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Change Password Route (Protected but outside Layout) */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            <Route path="dashboard" element={<Dashboard />} />
            
            <Route
              path="assets"
              element={
                <ProtectedRoute requiredPermission="assets.view">
                  <AssetList />
                </ProtectedRoute>
              }
            />
            <Route
              path="assets/new"
              element={
                <ProtectedRoute requiredPermission="assets.create">
                  <AssetForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="assets/:id"
              element={
                <ProtectedRoute requiredPermission="assets.view">
                  <AssetDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="assets/:id/edit"
              element={
                <ProtectedRoute requiredPermission="assets.edit">
                  <AssetForm isEdit />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="checkinout"
              element={
                <ProtectedRoute requiredPermission="assets.view">
                  <CheckInOut />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="stockcount"
              element={
                <ProtectedRoute requireManager>
                  <StockCount />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="budget"
              element={
                <ProtectedRoute requireManager>
                  <BudgetList />
                </ProtectedRoute>
              }
            />
            <Route
              path="budget/new"
              element={
                <ProtectedRoute requireManager>
                  <BudgetForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="budget/:id/edit"
              element={
                <ProtectedRoute requireManager>
                  <BudgetForm isEdit />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="reports"
              element={
                <ProtectedRoute requiredPermission="reports.view">
                  <ReportList />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="config"
              element={
                <ProtectedRoute requiredPermission="config.view">
                  <SystemConfig />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="sync"
              element={
                <ProtectedRoute requireAdmin>
                  <SharePointSync />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="excel"
              element={
                <ProtectedRoute requireAdmin>
                  <ExcelImportExport />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;