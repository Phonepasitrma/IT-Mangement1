/**
 * TypeScript types for SharePoint data structures
 */

/**
 * SharePoint site information from Microsoft Graph
 */
export interface SharePointSite {
  id: string;
  displayName: string;
  name: string;
  webUrl: string;
  siteCollection?: {
    hostname: string;
  };
}

/**
 * SharePoint list information from Microsoft Graph
 */
export interface SharePointList {
  id: string;
  displayName: string;
  name: string;
  webUrl: string;
  list?: {
    template: string;
  };
}

/**
 * SharePoint list item from Microsoft Graph
 */
export interface SharePointListItem {
  id: string;
  fields: Record<string, any>; // Dynamic fields based on list schema
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

/**
 * Parameters for loading SharePoint data
 */
export interface SharePointLoadParams {
  siteName: string;        // Name of the SharePoint site (e.g., "IT Assets")
  listName: string;        // Display name of the list (e.g., "Assets")
  tenantHostname: string;  // Tenant hostname (e.g., "contoso.sharepoint.com")
}

/**
 * Result of SharePoint data loading operation
 */
export interface SharePointLoadResult {
  success: boolean;
  data?: any[];           // Array of item.fields
  error?: string;
  details?: {
    siteId?: string;
    listId?: string;
    itemCount?: number;
  };
}

/**
 * Microsoft Graph API error response
 */
export interface GraphError {
  error: {
    code: string;
    message: string;
    innerError?: {
      date: string;
      'request-id': string;
      'client-request-id': string;
    };
  };
}

/**
 * MSAL authentication result
 */
export interface AuthResult {
  success: boolean;
  accessToken?: string;
  error?: string;
}
