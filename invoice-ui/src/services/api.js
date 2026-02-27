import axios from 'axios';

const API_URL = 'http://localhost:5238/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => api.post('/Auth/login', data);

export const getInvoices = (startDate, endDate) =>
  api.get('/Invoice', { params: { startDate, endDate } });

export const saveInvoice = (data) => api.post('/Invoice', data);

export const updateInvoice = (data) => api.put('/Invoice', data);

export const deleteInvoice = (data) => api.delete('/Invoice', { data });

export const getCustomers = () => api.get('/Customer');

export const saveCustomer = (data) => api.post('/Customer', data);

export const updateCustomer = (data) => api.put('/Customer', data);

export const deleteCustomer = (id, force = false) =>
  api.delete(`/Customer/${id}?force=${force}`);

export default api;