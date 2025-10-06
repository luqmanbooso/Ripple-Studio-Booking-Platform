import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Ticket, AlertCircle, Clock, CheckCircle, XCircle, 
  Search, Filter, Plus, MessageCircle, User, Calendar,
  DollarSign, FileText, Zap, AlertTriangle, Eye
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { 
  useGetTicketsQuery, 
  useGetTicketStatsQuery,
  useUpdateTicketStatusMutation,
  useAssignTicketMutation 
} from '../../store/ticketApi'
import CreateTicketModal from '../../components/tickets/CreateTicketModal'

const TicketManagement = () => {
  const { user } = useSelector(state => state.auth)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    type: '',
    search: ''
  })
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const { data: ticketsData, isLoading } = useGetTicketsQuery({
    ...filters,
    page: currentPage,
    limit: 20
  })
  
  const { data: statsData } = useGetTicketStatsQuery(undefined, {
    skip: user?.role !== 'admin'
  })

  const [updateTicketStatus] = useUpdateTicketStatusMutation()
  const [assignTicket] = useAssignTicketMutation()

  const tickets = ticketsData?.data?.tickets || []
  const totalPages = ticketsData?.data?.totalPages || 1
  const stats = statsData?.data || {}

  const ticketTypeIcons = {
    cancellation: XCircle,
    refund: DollarSign,
    dispute: AlertCircle,
    no_show: Clock,
    quality_issue: User,
    technical_issue: MessageCircle,
    other: FileText
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  }

  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    escalated: 'bg-red-100 text-red-800'
  }

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchesSearch = !filters.search || 
        ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.ticketId.toLowerCase().includes(filters.search.toLowerCase()) ||
        ticket.client?.name?.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesStatus = !filters.status || ticket.status === filters.status
      const matchesPriority = !filters.priority || ticket.priority === filters.priority
      const matchesType = !filters.type || ticket.type === filters.type

      return matchesSearch && matchesStatus && matchesPriority && matchesType
    })
  }, [tickets, filters])

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      await updateTicketStatus({ ticketId, status: newStatus }).unwrap()
      toast.success('Ticket status updated successfully')
    } catch (error) {
      toast.error('Failed to update ticket status')
    }
  }

  const handleAssignTicket = async (ticketId, adminId) => {
    try {
      await assignTicket({ ticketId, adminId }).unwrap()
      toast.success('Ticket assigned successfully')
    } catch (error) {
      toast.error('Failed to assign ticket')
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const ticketDate = new Date(date)
    const diffInHours = Math.floor((now - ticketDate) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return ticketDate.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <Ticket className="w-8 h-8 mr-3 text-blue-600" />
                Support Tickets
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and resolve customer support tickets
              </p>
            </div>
            {user?.role !== 'admin' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Ticket</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards (Admin Only) */}
        {user?.role === 'admin' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalTickets || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Ticket className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Open Tickets</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.openTickets || 0}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.overdueCount || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Resolution</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {Math.round(stats.avgResolutionHours || 0)}h
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="escalated">Escalated</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="cancellation">Cancellation</option>
              <option value="refund">Refund</option>
              <option value="dispute">Dispute</option>
              <option value="no_show">No Show</option>
              <option value="quality_issue">Quality Issue</option>
              <option value="technical_issue">Technical Issue</option>
              <option value="other">Other</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => setFilters({ status: '', priority: '', type: '', search: '' })}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Tickets List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No tickets found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTickets.map((ticket) => {
                const TypeIcon = ticketTypeIcons[ticket.type] || FileText
                return (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <TypeIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                              {ticket.title}
                            </h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              #{ticket.ticketId}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                            {ticket.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              {ticket.client?.name || 'Unknown Client'}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {getTimeAgo(ticket.createdAt)}
                            </span>
                            {ticket.messages?.length > 0 && (
                              <span className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-1" />
                                {ticket.messages.length} messages
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                          {ticket.priority?.charAt(0).toUpperCase() + ticket.priority?.slice(1)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status]}`}>
                          {ticket.status?.replace('_', ' ').charAt(0).toUpperCase() + ticket.status?.replace('_', ' ').slice(1)}
                        </span>
                        {user?.role === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              // Handle quick actions
                            }}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        booking={null} // You'd pass the selected booking here
      />
    </div>
  )
}

export default TicketManagement
