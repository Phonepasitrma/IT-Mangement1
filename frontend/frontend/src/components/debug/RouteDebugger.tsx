// frontend/src/components/debug/RouteDebugger.tsx
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteDebuggerProps {
  componentName: string;
}

const RouteDebugger: React.FC<RouteDebuggerProps> = ({ componentName }) => {
  const location = useLocation();
  
  useEffect(() => {
    console.log(`✅ ${componentName} loaded successfully`);
    console.log(`Current path: ${location.pathname}`);
  }, [componentName, location.pathname]);

  return (
    <div style={{ 
      border: '2px solid green', 
      padding: '20px', 
      margin: '10px 0',
      backgroundColor: '#f0fff0'
    }}>
      <h3 style={{ color: 'green' }}>✅ {componentName} is Working!</h3>
      <p>Current Path: <strong>{location.pathname}</strong></p>
      <small>Check console for more details</small>
    </div>
  );
};

export default RouteDebugger;