import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const customerService = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
};

export const policyService = {
  getAll: (customerId = null) => {
    const url = customerId ? `/policies?customer_id=${customerId}` : '/policies';
    return api.get(url);
  },
  getById: (id) => api.get(`/policies/${id}`),
  create: (data) => api.post('/policies', data),
  update: (id, data) => api.put(`/policies/${id}`, data),
  renew: (id) => api.post(`/policies/${id}/renew`),
  cancel: (id) => api.post(`/policies/${id}/cancel`)
};

export const claimService = {
  getAll: (status = null) => {
    const url = status ? `/claims?status=${status}` : '/claims';
    return api.get(url);
  },
  getById: (id) => api.get(`/claims/${id}`),
  create: (data) => api.post('/claims', data),
  assign: (id, agentId) => api.put(`/claims/${id}/assign`, { agent_id: agentId }),
  approve: (id, remarks = '') => api.put(`/claims/${id}/approve`, { remarks }),
  reject: (id, remarks = '') => api.put(`/claims/${id}/reject`, { remarks })
};

export default api;
