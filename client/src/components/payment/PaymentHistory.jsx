import React, { useState } from 'react';
import { useGetMyPaymentsQuery } from '../../store/paymentApi';
import { 
  CreditCard, 
  Download, 
  RefreshCw, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

const PaymentHistory = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError, refetch } = useGetMyPaymentsQuery({
    page,
    limit: 10,
    status: statusFilter,
  });

  const getStatusColor = (status) => {
    const colors = {
      Completed: 'bg-green-100 text-green-800 border-green-200',
      Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Failed: 'bg-red-100 text-red-800 border-red-200',
      Refunded: 'bg-blue-100 text-blue-800 border-blue-200',
      Chargeback: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Completed: <CheckCircle className="w-4 h-4" />,
      Pending: <Clock className="w-4 h-4" />,
      Failed: <XCircle className="w-4 h-4" />,
      Refunded: <RefreshCw className="w-4 h-4" />,
      Chargeback: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || <CreditCard className="w-4 h-4" />;
  };

  const calculateStats = () => {
    if (!data?.data?.stats) return null;

    const statsMap = data.data.stats.reduce((acc, stat) => {
      acc[stat._id] = stat;
      return acc;
    }, {});

    return {
      totalPaid: statsMap.Completed?.totalAmount || 0,
      totalRefunded: statsMap.Refunded?.totalAmount || 0,
      totalPending: statsMap.Pending?.totalAmount || 0,
      completedCount: statsMap.Completed?.count || 0,
    };
  };

  const stats = calculateStats();
  const payments = data?.data?.payments || [];
  const pagination = data?.data?.pagination || {};

  // Filter payments by search term
  const filteredPayments = payments.filter(payment =>
    !searchTerm || 
    payment.payhereOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.bookingSnapshot?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load payments</h3>
        <button
          onClick={() => refetch()}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Spending History</h1>
            <p className="text-gray-400">Track your studio booking expenses and download reports</p>
          </div>
        </div>

        <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100">Total Paid</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold">LKR {stats.totalPaid.toLocaleString()}</p>
            <p className="text-sm text-green-100 mt-1">{stats.completedCount} transactions</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100">Refunded</span>
              <RefreshCw className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold">LKR {stats.totalRefunded.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-yellow-100">Pending</span>
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold">LKR {stats.totalPending.toLocaleString()}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-100">Total Transactions</span>
              <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold">{payments.length}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by order ID or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.payhereOrderId}
                      </div>
                      {payment.payherePaymentId && (
                        <div className="text-xs text-gray-500">
                          Payment: {payment.payherePaymentId.slice(-8)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {payment.bookingSnapshot?.service?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.bookingSnapshot?.studio?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                      <div className="text-xs text-gray-400">
                        {format(new Date(payment.createdAt), 'hh:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {payment.currency} {payment.amount.toLocaleString()}
                      </div>
                      {payment.refundAmount > 0 && (
                        <div className="text-xs text-blue-600">
                          Refunded: {payment.currency} {payment.refundAmount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        onClick={() => window.open(`/payments/${payment._id}`, '_blank')}
                      >
                        <Download className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{((page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(page * pagination.limit, pagination.total)}
              </span> of{' '}
              <span className="font-medium">{pagination.total}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
