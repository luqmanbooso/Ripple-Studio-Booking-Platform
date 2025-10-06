import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, AlertCircle, FileText, Upload, DollarSign, 
  Clock, User, MessageCircle, Camera, Paperclip
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useCreateTicketMutation } from '../../store/ticketApi'

const CreateTicketModal = ({ isOpen, onClose, booking }) => {
  const [createTicket, { isLoading }] = useCreateTicketMutation()
  
  const [formData, setFormData] = useState({
    type: 'dispute',
    title: '',
    description: '',
    priority: 'medium',
    evidence: []
  })

  const ticketTypes = [
    { value: 'cancellation', label: 'Cancellation Request', icon: X, color: 'text-red-500' },
    { value: 'refund', label: 'Refund Request', icon: DollarSign, color: 'text-green-500' },
    { value: 'dispute', label: 'General Dispute', icon: AlertCircle, color: 'text-yellow-500' },
    { value: 'no_show', label: 'No Show Report', icon: Clock, color: 'text-orange-500' },
    { value: 'quality_issue', label: 'Quality Issue', icon: User, color: 'text-purple-500' },
    { value: 'technical_issue', label: 'Technical Problem', icon: MessageCircle, color: 'text-blue-500' },
    { value: 'other', label: 'Other Issue', icon: FileText, color: 'text-gray-500' }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      await createTicket({
        bookingId: booking._id,
        ...formData
      }).unwrap()
      
      toast.success('Support ticket created successfully!')
      onClose()
      
      // Reset form
      setFormData({
        type: 'dispute',
        title: '',
        description: '',
        priority: 'medium',
        evidence: []
      })
    } catch (error) {
      console.error('Failed to create ticket:', error)
      toast.error(error?.data?.message || 'Failed to create ticket')
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    // In a real implementation, you'd upload these files first
    // For now, we'll just add them to the evidence array
    const newEvidence = files.map(file => ({
      type: file.type.startsWith('image/') ? 'image' : 'document',
      filename: file.name,
      url: URL.createObjectURL(file) // Temporary URL for preview
    }))
    
    setFormData(prev => ({
      ...prev,
      evidence: [...prev.evidence, ...newEvidence]
    }))
  }

  const removeEvidence = (index) => {
    setFormData(prev => ({
      ...prev,
      evidence: prev.evidence.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Support Ticket
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Booking #{booking?._id?.slice(-8)} - {booking?.service?.name}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Ticket Type */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Issue Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ticketTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        formData.type === type.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 ${type.color}`} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {type.label}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                Priority Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {priorityLevels.map((priority) => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.value }))}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      formData.priority === priority.value
                        ? priority.color + ' ring-2 ring-blue-500'
                        : priority.color + ' opacity-60 hover:opacity-100'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Issue Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of the issue"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Detailed Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please provide as much detail as possible about the issue..."
                maxLength={2000}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/2000 characters
              </p>
            </div>

            {/* Evidence Upload */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Supporting Evidence (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="evidence-upload"
                />
                <label
                  htmlFor="evidence-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Click to upload images or documents
                    <br />
                    <span className="text-xs">Supports: JPG, PNG, PDF, DOC</span>
                  </p>
                </label>

                {/* Evidence Preview */}
                {formData.evidence.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploaded Files:
                    </p>
                    {formData.evidence.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center space-x-2">
                          {file.type === 'image' ? (
                            <Camera className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Paperclip className="w-4 h-4 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {file.filename}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEvidence(index)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.title.trim() || !formData.description.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Ticket'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default CreateTicketModal
