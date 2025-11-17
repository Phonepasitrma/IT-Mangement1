/**
 * SharePoint MSAL Demo Script
 * 
 * This file demonstrates how to use the SharePoint loader
 * Copy these examples into your components
 */

import { loadSharePointData, SharePointLoadParams } from './index';

/**
 * Example 1: Basic Usage
 * Load SharePoint data with one function call
 */
export const example1_basicUsage = async () => {
  console.log('=== Example 1: Basic Usage ===');
  
  const result = await loadSharePointData({
    siteName: 'IT Assets',
    listName: 'Assets',
    tenantHostname: 'yourtenant.sharepoint.com'
  });
  
  if (result.success) {
    console.log('✅ Success!');
    console.log('Items loaded:', result.data?.length);
    console.log('Site ID:', result.details?.siteId);
    console.log('List ID:', result.details?.listId);
    console.log('Sample data:', result.data?.[0]);
  } else {
    console.error('❌ Error:', result.error);
  }
  
  return result;
};

/**
 * Example 2: With Error Handling
 * Proper error handling for production use
 */
export const example2_withErrorHandling = async (params: SharePointLoadParams) => {
  console.log('=== Example 2: With Error Handling ===');
  
  try {
    const result = await loadSharePointData(params);
    
    if (!result.success) {
      // Handle specific errors
      if (result.error?.includes('Login failed')) {
        console.error('User cancelled login or login failed');
        return { error: 'Authentication required' };
      } else if (result.error?.includes('Site not found')) {
        console.error('SharePoint site not found');
        return { error: 'Invalid site name' };
      } else if (result.error?.includes('List not found')) {
        console.error('SharePoint list not found');
        return { error: 'Invalid list name' };
      } else {
        console.error('Unknown error:', result.error);
        return { error: result.error };
      }
    }
    
    console.log('✅ Data loaded successfully');
    return { data: result.data, count: result.details?.itemCount };
  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return { error: error.message };
  }
};

/**
 * Example 3: Load and Process Data
 * Load data and transform it for your application
 */
export const example3_loadAndProcess = async () => {
  console.log('=== Example 3: Load and Process ===');
  
  const result = await loadSharePointData({
    siteName: 'IT Assets',
    listName: 'Assets',
    tenantHostname: 'yourtenant.sharepoint.com'
  });
  
  if (result.success && result.data) {
    // Process the data
    const processedData = result.data.map(item => ({
      assetId: item.AssetID || item.Title,
      category: item.MainCategory || item.Category,
      status: item.Status,
      brand: item.Brand,
      model: item.ModelName || item.Model,
      // Add more field mappings as needed
    }));
    
    console.log('✅ Processed', processedData.length, 'items');
    return processedData;
  }
  
  return [];
};

/**
 * Example 4: Load and Send to Backend
 * Load from SharePoint and sync to your database
 */
export const example4_syncToBackend = async () => {
  console.log('=== Example 4: Sync to Backend ===');
  
  // Load from SharePoint
  const result = await loadSharePointData({
    siteName: 'IT Assets',
    listName: 'Assets',
    tenantHostname: 'yourtenant.sharepoint.com'
  });
  
  if (!result.success) {
    console.error('❌ Failed to load from SharePoint:', result.error);
    return { success: false, error: result.error };
  }
  
  console.log('✅ Loaded', result.data?.length, 'items from SharePoint');
  
  // Send to backend
  try {
    const response = await fetch('http://localhost:5000/api/sync/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: result.data,
        source: 'SharePoint',
        siteId: result.details?.siteId,
        listId: result.details?.listId,
      }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Synced to database successfully');
      return { success: true, ...data };
    } else {
      console.error('❌ Backend sync failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error: any) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Example 5: Load Multiple Lists
 * Load data from multiple SharePoint lists
 */
export const example5_loadMultipleLists = async () => {
  console.log('=== Example 5: Load Multiple Lists ===');
  
  const lists = [
    { siteName: 'IT Assets', listName: 'Assets' },
    { siteName: 'IT Assets', listName: 'Locations' },
    { siteName: 'IT Assets', listName: 'Companies' },
  ];
  
  const results = await Promise.all(
    lists.map(({ siteName, listName }) =>
      loadSharePointData({
        siteName,
        listName,
        tenantHostname: 'yourtenant.sharepoint.com'
      })
    )
  );
  
  const allData = {
    assets: results[0].success ? results[0].data : [],
    locations: results[1].success ? results[1].data : [],
    companies: results[2].success ? results[2].data : [],
  };
  
  console.log('✅ Loaded data from', lists.length, 'lists');
  console.log('Assets:', allData.assets?.length);
  console.log('Locations:', allData.locations?.length);
  console.log('Companies:', allData.companies?.length);
  
  return allData;
};

/**
 * Example 6: React Component Usage
 * How to use in a React component
 */
export const example6_reactComponent = `
import React, { useState } from 'react';
import { loadSharePointData } from './services/sharepoint';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoad = async () => {
    setLoading(true);
    setError('');
    
    const result = await loadSharePointData({
      siteName: 'IT Assets',
      listName: 'Assets',
      tenantHostname: 'yourtenant.sharepoint.com'
    });
    
    if (result.success) {
      setData(result.data || []);
    } else {
      setError(result.error || 'Failed to load data');
    }
    
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleLoad} disabled={loading}>
        {loading ? 'Loading...' : 'Load SharePoint Data'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {data.length > 0 && (
        <div>
          <p>Loaded {data.length} items</p>
          <ul>
            {data.map((item, idx) => (
              <li key={idx}>{item.AssetID} - {item.Status}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
`;

/**
 * Run all examples
 * Uncomment to test
 */
export const runAllExamples = async () => {
  console.log('🚀 Running all SharePoint MSAL examples...\n');
  
  // await example1_basicUsage();
  // await example2_withErrorHandling({ ... });
  // await example3_loadAndProcess();
  // await example4_syncToBackend();
  // await example5_loadMultipleLists();
  
  console.log('\n✅ All examples completed!');
  console.log('📖 See demo.ts for more details');
};

// Export all examples
export default {
  example1_basicUsage,
  example2_withErrorHandling,
  example3_loadAndProcess,
  example4_syncToBackend,
  example5_loadMultipleLists,
  example6_reactComponent,
  runAllExamples,
};
