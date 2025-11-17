// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import RouteDebugger from './components/debug/RouteDebugger';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

console.log('🚀 App.tsx loading...');

function App() {
  console.log('📦 App component rendering...');
  
  return (
    <AuthProvider>
      <Router>
        <div style={{ padding: '20px' }}>
          <h1>🔍 Route Debugging Mode</h1>
          <p>Testing routes one by one...</p>
          
          <Routes>
            <Route path="/" element={<Navigate to="/test1" replace />} />
            
            {/* Test Route 1 */}
            <Route path="/test1" element={<RouteDebugger componentName="Test Route 1" />} />
            
            {/* Test Route 2 */}
            <Route path="/test2" element={<RouteDebugger componentName="Test Route 2" />} />
            
            {/* Test Route 3 */}
            <Route path="/test3" element={<RouteDebugger componentName="Test Route 3" />} />
            
            {/* 404 Route */}
            <Route path="*" element={
              <div style={{ border: '2px solid red', padding: '20px' }}>
                <h3>❌ 404 - Route Not Found</h3>
                <p>Current path: {window.location.pathname}</p>
              </div>
            } />
          </Routes>
          
          {/* Navigation for testing */}
          <div style={{ 
            position: 'fixed', 
            top: '10px', 
            right: '10px', 
            backgroundColor: 'white', 
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}>
            <h6>Quick Navigation:</h6>
            <a href="/test1" style={{ display: 'block', margin: '5px 0' }}>Test 1</a>
            <a href="/test2" style={{ display: 'block', margin: '5px 0' }}>Test 2</a>
            <a href="/test3" style={{ display: 'block', margin: '5px 0' }}>Test 3</a>
            <a href="/invalid" style={{ display: 'block', margin: '5px 0', color: 'red' }}>404 Test</a>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;