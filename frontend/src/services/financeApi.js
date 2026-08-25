import api from '../components/api';
export const financeSummary = (branch) => api.get('/api/finance/summary', { params: { branch } });
export const financePayments = (branch, search) => api.get('/api/finance/payments', { params: { branch, search } });
