import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const TOKEN_STORAGE_KEY = 'auth_token';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    return Promise.reject(error);
  }
);
