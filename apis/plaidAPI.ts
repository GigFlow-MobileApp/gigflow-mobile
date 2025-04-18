import axios from 'axios';
import Config from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Creates a link token for Plaid Link initialization
 * @returns {Promise<string>} The link token
 */
export const createLinkToken = async (): Promise<string> => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      throw new Error('Authentication token not found');
    }

    console.log("Making request to create link token...");
    const response = await axios.post(
      `${Config.apiBaseUrl}/api/v1/plaid/link/token/create`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
      }
    );

    console.log("Link token response:", response.data);
    if (!response.data || !response.data.link_token) {
      throw new Error('Invalid response format from server');
    }

    return response.data.link_token;
  } catch (error) {
    console.error('Failed to create link token:', error);
    throw error;
  }
};

/**
 * Exchanges a public token for an access token
 * @param {string} publicToken The public token from Plaid Link
 * @returns {Promise<{message: string, accounts: Array}>} The response containing accounts information
 */
export const exchangePublicToken = async (publicToken: string): Promise<{message: string, accounts: Array<any>}> => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.post(
      `${Config.apiBaseUrl}/api/v1/plaid/exchange_token`,
      { public_token: publicToken },
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
      }
    );

    if (!response.data || !response.data.accounts) {
      throw new Error('Invalid response format from server');
    }

    return response.data;
  } catch (error) {
    console.error('Failed to exchange public token:', error);
    throw error;
  }
};

/**
 * Gets the user's linked bank accounts
 * @returns {Promise<Array>} The user's linked bank accounts
 */
export const getLinkedBankAccounts = async (): Promise<any[]> => {
  try {
    const userToken = await AsyncStorage.getItem('userToken');
    if (!userToken) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.get(
      `${Config.apiBaseUrl}/api/v1/plaid/accounts`,
      {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data || [];
  } catch (error) {
    console.error('Failed to get linked bank accounts:', error);
    return [];
  }
};




