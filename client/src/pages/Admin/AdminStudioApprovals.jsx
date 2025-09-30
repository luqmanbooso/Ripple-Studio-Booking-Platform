import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  X, 
  Eye, 
  Clock, 
  Mail, 
  Phone, 
  MapPin,
  Calendar,
  Building,
  User
} from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'

const AdminStudioApprovals = () => {
  const [pendingStudios, setPendingStudios] = useState([])
  const [selectedStudio, setSelectedStudio] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  // Mock data for now - replace with actual API call
  React.useEffect(() => {
    fetchPendingStudios()
  }, [])

  const fetchPendingStudios = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockStudios = [
        {
          _id: '1',
          name: 'Sound Wave Studios',
          description: 'Professional recording studio with state-of-the-art equipment',
          location: { city: 'Colombo', country: 'Sri Lanka', address: '123 Music Street' },
          user: {
            name: 'John Doe',
            email: 'john@soundwave.lk',
            phone: '+94771234567',
            createdAt: new Date('2024-01-15')
          },
          equipment: ['Pro Tools', 'SSL Console', 'Neumann Microphones'],
          services: [
            { name: 'Recording', price: 5000, durationMins: 120 },
            { name: 'Mixing', price: 3000, durationMins: 60 }
          ],
          createdAt: new Date('2024-01-15')
        },
        {
          _id: '2',
          name: 'Harmony Hub',
          description: 'Cozy studio perfect for acoustic recordings',
          location: { city: 'Kandy', country: 'Sri Lanka', address: '456 Harmony Lane' },
          user: {
            name: 'Jane Smith',
            email: 'jane@harmonyhub.lk',
            phone: '+94777654321',
            createdAt: new Date('2024-01-20')
          },
          equipment: ['Logic Pro', 'Acoustic Treatment', 'Vintage Mics'],
          services: [
            { name: 'Recording', price: 3500, durationMins: 90 }
          ],
          createdAt: new Date('2024-01-20')
        }
      ]
      setPendingStudios(mockStudios)
    } catch (error) {
      toast.error('Failed to fetch pending studios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (studioId) => {
    setActionLoading(studioId)
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPendingStudios(prev => prev.filter(studio => studio._id !== studioId))
      toast.success('Studio approved successfully!')
    } catch (error) {
      toast.error('Failed to approve studio')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setActionLoading(selectedStudio._id)
    try {
      // Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setPendingStudios(prev => prev.filter(studio => studio._id !== selectedStudio._id))
      setShowRejectModal(false)
      setRejectReason('')
      setSelectedStudio(null)
      toast.success('Studio rejected successfully!')
    } catch (error) {
      toast.error('Failed to reject studio')
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectModal = (studio) => {
    setSelectedStudio(studio)
    setShowRejectModal(true)
  }

  const openDetailsModal = (studio) => {
    setSelectedStudio(studio)
    setShowDetailsModal(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Studio Approvals</h1>
          <p className="text-gray-400 mt-1">
            Review and approve studio registrations
          </p>
        </div>
        <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
          {pendingStudios.length} Pending
        </div>
      </div>

      {pendingStudios.length === 0 ? (
        <Card className="p-12 text-center">
          <Building className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-100 mb-2">
            No Pending Approvals
          </h3>
          <p className="text-gray-400">
            All studio registrations have been processed.
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {pendingStudios.map((studio, index) => (
            <motion.div
              key={studio._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-100">
                        {studio.name}
                      </h3>
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
                        Pending
                      </span>
                    </div>

                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {studio.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-400">
                          <User className="w-4 h-4 mr-2" />
                          {studio.user.name}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Mail className="w-4 h-4 mr-2" />
                          {studio.user.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Phone className="w-4 h-4 mr-2" />
                          {studio.user.phone}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          {studio.location.city}, {studio.location.country}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          Registered {studio.createdAt.toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Clock className="w-4 h-4 mr-2" />
                          {studio.services.length} Services
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {studio.equipment.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs"
                        >
                          {item}
                        </span>
                      ))}
                      {studio.equipment.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{studio.equipment.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetailsModal(studio)}
                      icon={<Eye className="w-4 h-4" />}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(studio._id)}
                      disabled={actionLoading === studio._id}
                      icon={actionLoading === studio._id ? 
                        <Spinner size="sm" /> : 
                        <Check className="w-4 h-4" />
                      }
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openRejectModal(studio)}
                      disabled={actionLoading === studio._id}
                      icon={<X className="w-4 h-4" />}
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Studio Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Studio Details"
        size="lg"
      >
        {selectedStudio && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">
                {selectedStudio.name}
              </h3>
              <p className="text-gray-400">
                {selectedStudio.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-100 mb-3">Owner Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name:</span>
                    <span className="text-gray-100">{selectedStudio.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-gray-100">{selectedStudio.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-gray-100">{selectedStudio.user.phone}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-100 mb-3">Location</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">City:</span>
                    <span className="text-gray-100">{selectedStudio.location.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Country:</span>
                    <span className="text-gray-100">{selectedStudio.location.country}</span>
                  </div>
                  {selectedStudio.location.address && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Address:</span>
                      <span className="text-gray-100">{selectedStudio.location.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-100 mb-3">Equipment</h4>
              <div className="flex flex-wrap gap-2">
                {selectedStudio.equipment.map((item, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-100 mb-3">Services</h4>
              <div className="space-y-2">
                {selectedStudio.services.map((service, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                    <div>
                      <span className="text-gray-100 font-medium">{service.name}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({service.durationMins} mins)
                      </span>
                    </div>
                    <span className="text-primary-400 font-semibold">
                      LKR {service.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Studio Application"
      >
        <div className="space-y-4">
          <p className="text-gray-400">
            Please provide a reason for rejecting this studio application. 
            This will be sent to the studio owner via email.
          </p>
          
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter rejection reason..."
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          />
          
          <div className="flex space-x-3">
            <Button
              onClick={handleReject}
              disabled={actionLoading === selectedStudio?._id || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700"
              icon={actionLoading === selectedStudio?._id ? 
                <Spinner size="sm" /> : 
                <X className="w-4 h-4" />
              }
            >
              Reject Studio
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminStudioApprovals
