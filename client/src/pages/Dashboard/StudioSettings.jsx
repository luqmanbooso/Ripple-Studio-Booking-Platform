import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useGetStudioQuery, useUpdateStudioMutation } from '../../store/studioApi'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Spinner from '../../components/ui/Spinner'
import { toast } from 'react-hot-toast'
import api from '../../lib/axios'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../store/authSlice'

const emptyService = () => ({ name: '', price: '', durationMins: 60, description: '' })

const StudioSettings = () => {
  const { user } = useSelector((s) => s.auth)
  const navigate = useNavigate()
  // Resolve studio id whether user.studio is an object or a string
  const studioId = (() => {
    const s = user?.studio
    if (!s) return null
    if (typeof s === 'string') return s
    if (s._id) return s._id
    if (s.id) return s.id
    return null
  })()

  const { data, isLoading, refetch } = useGetStudioQuery(studioId, { skip: !studioId })
  const studio = data?.data?.studio
  const dispatch = useDispatch()

  const [services, setServices] = useState([])
  const [updateStudio, { isLoading: isSaving }] = useUpdateStudioMutation()

  useEffect(() => {
    if (studio) {
      setServices(studio.services?.map(s => ({ ...s })) || [])
    }
  }, [studio])

  const addService = () => setServices(prev => [...prev, emptyService()])

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me')
      const user = res.data.data.user
      // Keep token from existing state if available
      const saved = JSON.parse(localStorage.getItem('auth') || '{}')
      const token = saved.token || null
      dispatch(setCredentials({ user, token }))
      toast.success('Profile refreshed')
      // update studioId and refetch studio
      refetch()
    } catch (err) {
      toast.error('Failed to refresh profile')
    }
  }

  const updateService = (index, key, value) => {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, [key]: value } : s))
  }

  const removeService = (index) => setServices(prev => prev.filter((_, i) => i !== index))

  const onSave = async () => {
    if (!studioId) {
      toast.error('No studio profile found for this account. Please create or link a studio profile first.')
      return
    }
    // Basic client-side validation
    for (const s of services) {
      if (!s.name || s.name.trim().length === 0) {
        toast.error('Service name is required')
        return
      }
      if (isNaN(Number(s.price)) || Number(s.price) < 0) {
        toast.error('Service price must be a valid non-negative number')
        return
      }
      if (isNaN(Number(s.durationMins)) || Number(s.durationMins) < 30) {
        toast.error('Service duration must be at least 30 minutes')
        return
      }
    }

    try {
      await updateStudio({ id: studioId, services: services.map(s => ({ ...s, price: Number(s.price), durationMins: Number(s.durationMins) })) }).unwrap()
      toast.success('Services updated')
      refetch()
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to update services')
    }
  }

  if (isLoading) return <div className="p-8"><Spinner /></div>

  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Studio Settings</h1>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Services</h2>
            <div className="flex items-center space-x-2">
              <Button onClick={addService} icon={null} disabled={!studioId}>Add Service</Button>
              <Button variant="outline" onClick={refreshProfile}>Refresh Profile</Button>
            </div>
          </div>

          {!studioId ? (
            <div className="py-6 text-center text-gray-500">
              No studio profile found for your account. Make sure you're signed in as a studio user and your profile is linked. Check your Profile page or contact support.
            </div>
          ) : services.length === 0 ? (
            <div className="py-6 text-center text-gray-500">No services yet. Click "Add Service" to create one.</div>
          ) : (
            <div className="space-y-4">
              {services.map((s, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <input
                      className="border px-2 py-1 rounded w-2/5 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
                      placeholder="Service name"
                      value={s.name}
                      onChange={(e) => updateService(i, 'name', e.target.value)}
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        className="border px-2 py-1 rounded w-28 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
                        placeholder="Price"
                        value={s.price}
                        onChange={(e) => updateService(i, 'price', e.target.value)}
                      />
                      <input
                        className="border px-2 py-1 rounded w-28 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
                        placeholder="Duration (mins)"
                        value={s.durationMins}
                        onChange={(e) => updateService(i, 'durationMins', e.target.value)}
                      />
                      <Button variant="danger" onClick={() => removeService(i)}>Remove</Button>
                    </div>
                  </div>
                  <textarea
                    className="border rounded w-full p-2 bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Description (optional)"
                    value={s.description}
                    onChange={(e) => updateService(i, 'description', e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end mt-6 space-x-2">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button onClick={onSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Services'}</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default StudioSettings
