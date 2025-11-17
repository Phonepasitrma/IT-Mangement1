/**
 * SharePoint Service - Main Export
 * 
 * This module provides complete SharePoint integration using MSAL and Microsoft Graph API
 */

// Main function
export { loadSharePointData } from './sharePointLoader';

// Authentication functions
export {
  initializeMsal,
  getMsalInstance,
  getAccount,
  loginWithPopup,
  loginWithRedirect,
  handleRedirectResponse,
  logout,
  getAccessToken,
  isAuthenticated,
} from './msalAuth';

// Graph API functions
export {
  findSiteId,
  getListId,
  getSharePointListItems,
} from './graphApi';

// Configuration
export {
  msalConfig,
  loginRequest,
  tokenRequest,
  graphConfig,
} from './msalConfig';

// Types
export type {
  SharePointSite,
  SharePointList,
  SharePointListItem,
  SharePointLoadParams,
  SharePointLoadResult,
  GraphError,
  AuthResult,
} from './types';
