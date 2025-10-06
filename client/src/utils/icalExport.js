/**
 * iCal Export Utility for Booking Calendar Integration
 * Generates .ics files that can be imported into Google Calendar, Outlook, Apple Calendar, etc.
 */

export const generateICalEvent = (booking) => {
  const startDate = new Date(booking.start)
  const endDate = new Date(booking.end)
  
  // Format dates for iCal (YYYYMMDDTHHMMSSZ)
  const formatICalDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  
  // Generate unique ID for the event
  const uid = `booking-${booking._id}@ripple-studios.com`
  
  // Escape special characters for iCal format
  const escapeText = (text) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '')
  }
  
  const summary = escapeText(`Studio Session - ${booking.studio?.name || 'Studio'}`)
  const description = escapeText([
    `Service: ${booking.service?.name || 'Recording Session'}`,
    `Studio: ${booking.studio?.name || 'Studio'}`,
    `Location: ${booking.studio?.location?.address || booking.studio?.location?.city || 'Studio Location'}`,
    booking.notes ? `Notes: ${booking.notes}` : '',
    `Booking ID: ${booking._id}`,
    `Status: ${booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}`
  ].filter(Boolean).join('\\n'))
  
  const location = escapeText(
    booking.studio?.location?.address || 
    `${booking.studio?.location?.city}, ${booking.studio?.location?.country}` || 
    'Studio Location'
  )
  
  // Generate iCal content
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ripple Studios//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${formatICalDate(startDate)}`,
    `DTEND:${formatICalDate(endDate)}`,
    `DTSTAMP:${formatICalDate(new Date())}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'CATEGORIES:Music,Studio,Recording',
    // Add alarm 15 minutes before
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Studio session reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  
  return icalContent
}

export const downloadICalFile = (booking, filename) => {
  const icalContent = generateICalEvent(booking)
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `studio-booking-${booking._id.slice(-8)}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const generateGoogleCalendarUrl = (booking) => {
  const startDate = new Date(booking.start)
  const endDate = new Date(booking.end)
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSSZ)
  const formatGoogleDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  }
  
  const title = encodeURIComponent(`Studio Session - ${booking.studio?.name || 'Studio'}`)
  const details = encodeURIComponent([
    `Service: ${booking.service?.name || 'Recording Session'}`,
    `Studio: ${booking.studio?.name || 'Studio'}`,
    booking.notes ? `Notes: ${booking.notes}` : '',
    `Booking ID: ${booking._id}`
  ].filter(Boolean).join('\n'))
  
  const location = encodeURIComponent(
    booking.studio?.location?.address || 
    `${booking.studio?.location?.city}, ${booking.studio?.location?.country}` || 
    'Studio Location'
  )
  
  const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`
}

export const generateOutlookUrl = (booking) => {
  const startDate = new Date(booking.start)
  const endDate = new Date(booking.end)
  
  const title = encodeURIComponent(`Studio Session - ${booking.studio?.name || 'Studio'}`)
  const body = encodeURIComponent([
    `Service: ${booking.service?.name || 'Recording Session'}`,
    `Studio: ${booking.studio?.name || 'Studio'}`,
    booking.notes ? `Notes: ${booking.notes}` : '',
    `Booking ID: ${booking._id}`
  ].filter(Boolean).join('\n'))
  
  const location = encodeURIComponent(
    booking.studio?.location?.address || 
    `${booking.studio?.location?.city}, ${booking.studio?.location?.country}` || 
    'Studio Location'
  )
  
  const startTime = startDate.toISOString()
  const endTime = endDate.toISOString()
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${body}&location=${location}&startdt=${startTime}&enddt=${endTime}`
}

// Bulk export for multiple bookings
export const generateMultipleBookingsICal = (bookings) => {
  const events = bookings.map(booking => {
    const lines = generateICalEvent(booking).split('\r\n')
    // Remove VCALENDAR wrapper, keep only VEVENT
    return lines.slice(6, -1).join('\r\n')
  }).join('\r\n')
  
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ripple Studios//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR'
  ].join('\r\n')
  
  return icalContent
}

export const downloadMultipleBookingsICal = (bookings, filename) => {
  const icalContent = generateMultipleBookingsICal(bookings)
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `studio-bookings-${new Date().toISOString().split('T')[0]}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
