/**
 * PayHere Sandbox Testing Utility
 * 
 * This utility helps test PayHere integration in sandbox mode
 */

// PayHere Sandbox Test Card Numbers
export const PAYHERE_TEST_CARDS = {
  visa: {
    number: '4916217501611292',
    expiry: '12/25',
    cvv: '123',
    name: 'Test User'
  },
  mastercard: {
    number: '5313581000123430',
    expiry: '12/25', 
    cvv: '123',
    name: 'Test User'
  },
  amex: {
    number: '346781000000007',
    expiry: '12/25',
    cvv: '1234',
    name: 'Test User'
  }
}

// PayHere Status Codes
export const PAYHERE_STATUS_CODES = {
  SUCCESS: '2',
  PENDING: '0', 
  CANCELLED: '-1',
  FAILED: '-2',
  CHARGEDBACK: '-3'
}

// Test PayHere Response URLs
export const generateTestReturnUrl = (bookingId, status = PAYHERE_STATUS_CODES.SUCCESS) => {
  const orderId = `booking_${bookingId}_${Date.now()}`
  const paymentId = `test_payment_${Date.now()}`
  
  const params = new URLSearchParams({
    order_id: orderId,
    payment_id: paymentId,
    status_code: status,
    payhere_amount: '1000.00',
    payhere_currency: 'LKR'
  })
  
  return `/booking/success?${params.toString()}`
}

// Simulate PayHere redirect for testing
export const simulatePayHereSuccess = (bookingId) => {
  const testUrl = generateTestReturnUrl(bookingId, PAYHERE_STATUS_CODES.SUCCESS)
  window.location.href = testUrl
}

export const simulatePayHerePending = (bookingId) => {
  const testUrl = generateTestReturnUrl(bookingId, PAYHERE_STATUS_CODES.PENDING)
  window.location.href = testUrl
}

export const simulatePayHereFailure = (bookingId) => {
  const testUrl = generateTestReturnUrl(bookingId, PAYHERE_STATUS_CODES.FAILED)
  window.location.href = testUrl
}

// Log PayHere integration details for debugging
export const logPayHereDebugInfo = () => {
  console.group('PayHere Integration Debug Info')
  console.log('Environment:', process.env.NODE_ENV)
  console.log('PayHere Mode:', process.env.VITE_PAYHERE_MODE || 'sandbox')
  console.log('Test Cards Available:', Object.keys(PAYHERE_TEST_CARDS))
  console.log('Status Codes:', PAYHERE_STATUS_CODES)
  console.groupEnd()
}

// Validate PayHere response parameters
export const validatePayHereResponse = (searchParams) => {
  const orderId = searchParams.get('order_id')
  const paymentId = searchParams.get('payment_id')
  const statusCode = searchParams.get('status_code')
  
  const validation = {
    hasOrderId: !!orderId,
    hasPaymentId: !!paymentId,
    hasStatusCode: !!statusCode,
    isValidOrderFormat: orderId ? orderId.startsWith('booking_') : false,
    statusCodeMeaning: getStatusCodeMeaning(statusCode)
  }
  
  console.log('PayHere Response Validation:', validation)
  return validation
}

const getStatusCodeMeaning = (code) => {
  switch (code) {
    case '2': return 'SUCCESS'
    case '0': return 'PENDING'
    case '-1': return 'CANCELLED'
    case '-2': return 'FAILED'
    case '-3': return 'CHARGEDBACK'
    default: return 'UNKNOWN'
  }
}

export default {
  PAYHERE_TEST_CARDS,
  PAYHERE_STATUS_CODES,
  generateTestReturnUrl,
  simulatePayHereSuccess,
  simulatePayHerePending,
  simulatePayHereFailure,
  logPayHereDebugInfo,
  validatePayHereResponse
}
