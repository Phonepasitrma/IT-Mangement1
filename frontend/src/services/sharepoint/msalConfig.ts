import { Configuration, LogLevel } from '@azure/msal-browser';

/**
 * MSAL Configuration for Office 365 Authentication
 * 
 * To use this configuration:
 * 1. Register an app in Azure AD (https://portal.azure.com)
 * 2. Set redirect URI to: http://localhost:3000 (for development)
 * 3. Enable "Access tokens" and "ID tokens" in Authentication
 * 4. Add API permissions: User.Read, Sites.Read.All
 * 5. Replace CLIENT_ID and TENANT_ID below
 */

// Using PnP Management Shell public client ID
// This is widely used for SharePoint access and accepts localhost redirects
const CLIENT_ID = '31359c7f-bd7e-475c-86db-fdb8c937548e'; // PnP Management Shell
const TENANT_ID = 'common'; // Works with any Microsoft 365 account

/**
 * MSAL Configuration object
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: CLIENT_ID,
    authority: `https://login.microsoftonline.com/${TENANT_ID}`,
    redirectUri: window.location.origin, // Will use current origin (e.g., http://localhost:3000)
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage', // Changed to localStorage for better compatibility
    storeAuthStateInCookie: true, // Enable cookie storage as fallback
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
        }
      },
      logLevel: LogLevel.Warning,
      piiLoggingEnabled: false,
    },
  },
};

/**
 * Scopes for login request
 * These permissions will be requested when user logs in
 * Using Microsoft Graph API to access SharePoint
 */
export const loginRequest = {
  scopes: [
    'User.Read',
    'Sites.ReadWrite.All',
    'Files.ReadWrite.All',
  ],
};

/**
 * Scopes for token request
 * Used when silently acquiring tokens
 */
export const tokenRequest = {
  scopes: [
    'User.Read',
    'Sites.ReadWrite.All',
    'Files.ReadWrite.All',
  ],
};

/**
 * Microsoft Graph API endpoint
 */
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
  graphSitesEndpoint: 'https://graph.microsoft.com/v1.0/sites',
};
