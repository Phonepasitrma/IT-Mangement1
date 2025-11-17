import { PublicClientApplication, AccountInfo, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig, loginRequest, tokenRequest } from './msalConfig';
import { AuthResult } from './types';

/**
 * MSAL instance - singleton pattern
 */
let msalInstance: PublicClientApplication | null = null;
let msalInitialized = false;

/**
 * Initialize MSAL instance
 * MUST be called and awaited before any other MSAL operations
 */
export const initializeMsal = async (): Promise<PublicClientApplication> => {
  if (!msalInstance) {
    try {
      // Check if crypto is available
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        throw new Error('Web Crypto API not available. MSAL requires HTTPS or localhost.');
      }
      
      msalInstance = new PublicClientApplication(msalConfig);
      await msalInstance.initialize();
      msalInitialized = true;
      console.log('✓ MSAL initialized successfully');
    } catch (error: any) {
      console.error('MSAL initialization failed:', error);
      throw new Error(`MSAL initialization failed: ${error.message}. Make sure you're using HTTPS or localhost.`);
    }
  }
  return msalInstance;
};

/**
 * Get the current MSAL instance
 */
export const getMsalInstance = (): PublicClientApplication => {
  if (!msalInstance) {
    throw new Error('MSAL not initialized. Call initializeMsal() first.');
  }
  return msalInstance;
};

/**
 * Get the current authenticated account
 */
export const getAccount = (): AccountInfo | null => {
  const msal = getMsalInstance();
  const accounts = msal.getAllAccounts();
  
  if (accounts.length === 0) {
    return null;
  }
  
  return accounts[0];
};

/**
 * Login with popup
 * Opens a popup window for user to authenticate
 */
export const loginWithPopup = async (): Promise<AuthResult> => {
  try {
    // Ensure MSAL is initialized
    if (!msalInitialized) {
      await initializeMsal();
    }
    
    const msal = getMsalInstance();
    
    const response: AuthenticationResult = await msal.loginPopup(loginRequest);
    
    if (response.account) {
      msal.setActiveAccount(response.account);
      
      return {
        success: true,
        accessToken: response.accessToken,
      };
    }
    
    return {
      success: false,
      error: 'No account returned from login',
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message || 'Login failed',
    };
  }
};

/**
 * Login with redirect
 * Redirects the entire page to Microsoft login
 */
export const loginWithRedirect = async (): Promise<void> => {
  try {
    const msal = getMsalInstance();
    await msal.loginRedirect(loginRequest);
  } catch (error: any) {
    console.error('Login redirect error:', error);
    throw error;
  }
};

/**
 * Handle redirect response after login
 * Call this on app initialization
 */
export const handleRedirectResponse = async (): Promise<AuthResult> => {
  try {
    const msal = getMsalInstance();
    const response = await msal.handleRedirectPromise();
    
    if (response) {
      msal.setActiveAccount(response.account);
      
      return {
        success: true,
        accessToken: response.accessToken,
      };
    }
    
    return {
      success: false,
      error: 'No response from redirect',
    };
  } catch (error: any) {
    console.error('Redirect response error:', error);
    return {
      success: false,
      error: error.message || 'Failed to handle redirect',
    };
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<void> => {
  try {
    const msal = getMsalInstance();
    const account = getAccount();
    
    if (account) {
      await msal.logoutPopup({ account });
    }
  } catch (error: any) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Get access token silently
 * Attempts to acquire token without user interaction
 * Falls back to interactive login if silent acquisition fails
 */
export const getAccessToken = async (): Promise<AuthResult> => {
  try {
    const msal = getMsalInstance();
    const account = getAccount();
    
    if (!account) {
      return {
        success: false,
        error: 'No account found. Please login first.',
      };
    }
    
    try {
      // Try to acquire token silently
      const response = await msal.acquireTokenSilent({
        ...tokenRequest,
        account: account,
      });
      
      return {
        success: true,
        accessToken: response.accessToken,
      };
    } catch (silentError: any) {
      console.warn('Silent token acquisition failed, trying interactive:', silentError);
      
      // If silent acquisition fails, try interactive popup
      try {
        const response = await msal.acquireTokenPopup(tokenRequest);
        
        return {
          success: true,
          accessToken: response.accessToken,
        };
      } catch (interactiveError: any) {
        console.error('Interactive token acquisition failed:', interactiveError);
        
        return {
          success: false,
          error: interactiveError.message || 'Failed to acquire access token',
        };
      }
    }
  } catch (error: any) {
    console.error('Get access token error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get access token',
    };
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const account = getAccount();
  return account !== null;
};
