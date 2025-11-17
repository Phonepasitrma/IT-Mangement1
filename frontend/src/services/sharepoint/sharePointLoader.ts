import { 
  initializeMsal, 
  loginWithPopup, 
  getAccessToken, 
  isAuthenticated 
} from './msalAuth';
import { 
  findSiteId, 
  getListId, 
  getSharePointListItems 
} from './graphApi';
import { 
  SharePointLoadParams, 
  SharePointLoadResult 
} from './types';

/**
 * Main function to load SharePoint data
 * 
 * This function performs the complete workflow:
 * 1. Initialize MSAL
 * 2. Check if user is authenticated, if not - login
 * 3. Acquire access token
 * 4. Find SharePoint site ID
 * 5. Get SharePoint list ID
 * 6. Load all list items
 * 7. Return only item.fields[]
 * 
 * @param params - SharePoint load parameters
 * @returns SharePoint load result with data or error
 */
export const loadSharePointData = async (
  params: SharePointLoadParams
): Promise<SharePointLoadResult> => {
  const { siteName, listName, tenantHostname } = params;
  
  try {
    console.log('=== Starting SharePoint Data Load ===');
    console.log('Parameters:', { siteName, listName, tenantHostname });
    
    // Step 1: Initialize MSAL
    console.log('Step 1: Initializing MSAL...');
    initializeMsal();

    
    // Step 2: Check authentication and login if needed
    console.log('Step 2: Checking authentication...');
    if (!isAuthenticated()) {
      console.log('User not authenticated, initiating login...');
      const loginResult = await loginWithPopup();
      
      if (!loginResult.success) {
        return {
          success: false,
          error: `Login failed: ${loginResult.error}`,
        };
      }
      
      console.log('Login successful');
    } else {
      console.log('User already authenticated');
    }
    
    // Step 3: Acquire access token
    console.log('Step 3: Acquiring access token...');
    const tokenResult = await getAccessToken();
    
    if (!tokenResult.success || !tokenResult.accessToken) {
      return {
        success: false,
        error: `Failed to acquire access token: ${tokenResult.error}`,
      };
    }
    
    const accessToken = tokenResult.accessToken;
    console.log('Access token acquired successfully');

    
    // Step 4: Find SharePoint site ID
    console.log('Step 4: Finding SharePoint site ID...');
    const siteId = await findSiteId(tenantHostname, siteName, accessToken);
    console.log(`Site ID found: ${siteId}`);
    
    // Step 5: Get SharePoint list ID
    console.log('Step 5: Getting SharePoint list ID...');
    const listId = await getListId(siteId, listName, accessToken);
    console.log(`List ID found: ${listId}`);
    
    // Step 6: Load all list items
    console.log('Step 6: Loading list items...');
    const items = await getSharePointListItems(siteId, listId, accessToken);
    console.log(`Successfully loaded ${items.length} items`);
    
    console.log('=== SharePoint Data Load Complete ===');
    
    // Step 7: Return results
    return {
      success: true,
      data: items,
      details: {
        siteId,
        listId,
        itemCount: items.length,
      },
    };
  } catch (error: any) {
    console.error('=== SharePoint Data Load Failed ===');
    console.error('Error:', error);
    
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
};
