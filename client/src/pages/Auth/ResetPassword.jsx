import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../../lib/axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = useSelector((s) => s.theme.mode);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Reset token missing. Please request a new reset link.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      console.log('Resetting password with token', token);
      const res = await api.post('/auth/reset-password', { token, password });
      console.log('reset-password response', res);
      setMessage(res.data.message || 'Password reset successful. Redirecting to login...');
      // brief success animation then redirect
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      console.error('Reset error', err);
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`max-w-md mx-auto mt-16 p-8 rounded-3xl shadow-2xl ${mode === 'dark' ? 'bg-dark-800' : 'bg-white'}`}
    >
      <h2 className={`text-2xl font-bold mb-6 text-center ${mode === 'dark' ? 'text-primary-500' : 'text-primary-600'}`}>
        Reset Password
      </h2>

      {!token ? (
        <div className="text-center">
          <p className="text-red-400 mb-4">Reset token missing or invalid.</p>
          <Link to="/forgot-password" className="text-primary-500 underline">Request a new link</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
            <input
              type="password"
              id="password"
              className={`w-full px-4 py-2 rounded-xl ${mode === 'dark' ? 'bg-dark-700 text-gray-100 border border-gray-600 focus:border-primary-500' : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-primary-500'} focus:outline-none`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirm" className={`block text-sm font-medium mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
            <input
              type="password"
              id="confirm"
              className={`w-full px-4 py-2 rounded-xl ${mode === 'dark' ? 'bg-dark-700 text-gray-100 border border-gray-600 focus:border-primary-500' : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-primary-500'} focus:outline-none`}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded transition-colors duration-200"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {message && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-green-400 text-center">
          {message}
        </motion.p>
      )}
      {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
    </motion.div>
  );
};

export default ResetPassword;
