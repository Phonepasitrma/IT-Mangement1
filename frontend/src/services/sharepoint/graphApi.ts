import { 
  SharePointSite, 
  SharePointList, 
  SharePointListItem, 
  GraphError 
} from './types';

/**
 * Make a request to Microsoft Graph API
 */
const callGraphApi = async (
  endpoint: string,
  accessToken: string,
  method: string = 'GET'
): Promise<any> => {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: GraphError = await response.json();
      throw new Error(
        `Graph API error: ${errorData.error.code} - ${errorData.error.message}`
      );
    }

    return await response.json();
  } catch (error: any) {
    console.error('Graph API call failed:', error);
    throw error;
  }
};

/**
 * Find SharePoint site ID by tenant hostname and site name
 * 
 * @param tenantHostname - Tenant hostname (e.g., "contoso.sharepoint.com")
 * @param siteName - Site name (e.g., "IT Assets")
 * @param accessToken - Access token from MSAL
 * @returns Site ID
 */
export const findSiteId = async (
  tenantHostname: string,
  siteName: string,
  accessToken: string
): Promise<string> => {
  try {
    const endpoint = `https://graph.microsoft.com/v1.0/sites/${tenantHostname}:/sites/${siteName}`;
    
    console.log(`Finding site ID for: ${tenantHostname}/sites/${siteName}`);
    
    const data: SharePointSite = await callGraphApi(endpoint, accessToken);
    
    if (!data.id) {
      throw new Error(`Site not found: ${siteName}`);
    }
    
    console.log(`Found site ID: ${data.id}`);
    return data.id;
  } catch (error: any) {
    console.error('Find site ID error:', error);
    throw new Error(`Failed to find site "${siteName}": ${error.message}`);
  }
};

/**
 * Get SharePoint list ID by site ID and list display name
 * 
 * @param siteId - SharePoint site ID
 * @param listName - List display name (e.g., "Assets")
 * @param accessToken - Access token from MSAL
 * @returns List ID
 */
export const getListId = async (
  siteId: string,
  listName: string,
  accessToken: string
): Promise<string> => {
  try {
    const endpoint = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists?$filter=displayName eq '${listName}'`;
    
    console.log(`Finding list ID for: ${listName}`);
    
    const data = await callGraphApi(endpoint, accessToken);
    
    if (!data.value || data.value.length === 0) {
      throw new Error(`List not found: ${listName}`);
    }
    
    const list: SharePointList = data.value[0];
    
    if (!list.id) {
      throw new Error(`List ID not found for: ${listName}`);
    }
    
    console.log(`Found list ID: ${list.id}`);
    return list.id;
  } catch (error: any) {
    console.error('Get list ID error:', error);
    throw new Error(`Failed to find list "${listName}": ${error.message}`);
  }
};

/**
 * Get all items from a SharePoint list
 * Returns only the fields data from each item
 * 
 * @param siteId - SharePoint site ID
 * @param listId - SharePoint list ID
 * @param accessToken - Access token from MSAL
 * @returns Array of item fields
 */
export const getSharePointListItems = async (
  siteId: string,
  listId: string,
  accessToken: string
): Promise<any[]> => {
  try {
    const endpoint = `https://graph.microsoft.com/v1.0/sites/${siteId}/lists/${listId}/items?$expand=fields`;
    
    console.log(`Loading list items from list: ${listId}`);
    
    const data = await callGraphApi(endpoint, accessToken);
    
    if (!data.value) {
      throw new Error('No items returned from list');
    }
    
    // Extract only the fields from each item
    const items: any[] = data.value.map((item: SharePointListItem) => item.fields);
    
    console.log(`Loaded ${items.length} items from list`);
    return items;
  } catch (error: any) {
    console.error('Get list items error:', error);
    throw new Error(`Failed to load list items: ${error.message}`);
  }
};
