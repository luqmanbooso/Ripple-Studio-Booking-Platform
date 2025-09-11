import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../../lib/axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');
		setError('');
			try {
				console.log('Sending forgot-password for', email)
				const res = await api.post('/auth/forgot-password', { email });
				console.log('forgot-password response', res)
				setMessage(res.data.message || 'If an account exists, a reset link has been sent.');
		} catch (err) {
			setError(err.response?.data?.message || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	};

		const mode = useSelector((s) => s.theme.mode);

		return (
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className={`max-w-md mx-auto mt-16 p-8 rounded-3xl shadow-2xl ${mode === 'dark' ? 'bg-dark-800' : 'bg-white'}`}
			>
				<h2 className={`text-2xl font-bold mb-6 text-center ${mode === 'dark' ? 'text-primary-500' : 'text-primary-600'}`}>
					Forgot Password
				</h2>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label htmlFor="email" className={`block text-sm font-medium mb-2 ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Email address</label>
						<input
							type="email"
							id="email"
							className={`w-full px-4 py-2 rounded-xl ${mode === 'dark' ? 'bg-dark-700 text-gray-100 border border-gray-600 focus:border-primary-500' : 'bg-gray-50 text-gray-900 border border-gray-200 focus:border-primary-500'}`}
							value={email}
							onChange={e => setEmail(e.target.value)}
							required
							disabled={loading}
						/>
					</div>

					<button
						type="submit"
						className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors duration-200"
						disabled={loading}
					>
						{loading ? 'Sending...' : 'Send Reset Link'}
					</button>
				</form>

				<div className="mt-4 text-center">
					<Link to="/login" className={`text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-600'} hover:text-primary-600`}>Back to login</Link>
				</div>

				{message && <p className="mt-4 text-green-400 text-center">{message}</p>}
				{error && <p className="mt-4 text-red-400 text-center">{error}</p>}
			</motion.div>
		);
};

export default ForgotPassword;
