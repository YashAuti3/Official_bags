/**
 * Auth service — abstracts authentication API calls.
 * Swap implementations here when connecting to a real backend.
 */

export const loginUser = async (email, password) => {
  // TODO: Replace with real API call
  // return await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }).then(r => r.json());

  // Mock: admin if email contains 'admin'
  if (!email || !password) throw new Error('Email and password are required.');
  const isAdmin = email.toLowerCase().includes('admin');
  return {
    user: { name: 'Sachin Kumar', email, avatar: null },
    isAdmin,
    token: 'mock-token-123',
  };
};

export const registerUser = async (name, email, password) => {
  // TODO: Replace with real API call
  if (!name || !email || !password) throw new Error('All fields are required.');
  return {
    user: { name, email, avatar: null },
    token: 'mock-token-456',
  };
};

export const logoutUser = async () => {
  // TODO: Replace with real API call (invalidate token)
  return Promise.resolve();
};
