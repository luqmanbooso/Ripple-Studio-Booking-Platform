/**
 * Currency formatting utilities for Ripple Studio Platform
 * 
 * Since the platform uses PayHere (Sri Lankan payment gateway),
 * all prices are in LKR (Sri Lankan Rupees) but need proper display formatting.
 */

// Default currency for the platform
export const DEFAULT_CURRENCY = 'LKR'

// Currency symbols mapping
export const CURRENCY_SYMBOLS = {
  LKR: 'Rs.',
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹'
}

// Currency formatting options
export const CURRENCY_FORMAT_OPTIONS = {
  LKR: {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true
  },
  USD: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true
  }
}

/**
 * Format currency amount with proper symbol and formatting
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: LKR)
 * @param {object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = DEFAULT_CURRENCY, options = {}) => {
  // Handle invalid amounts
  if (!amount && amount !== 0) return `${CURRENCY_SYMBOLS[currency] || currency} 0`
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numericAmount)) return `${CURRENCY_SYMBOLS[currency] || currency} 0`

  const symbol = CURRENCY_SYMBOLS[currency] || currency
  const formatOptions = { 
    ...CURRENCY_FORMAT_OPTIONS[currency], 
    ...options 
  }

  // Format the number with proper grouping and decimals
  const formattedNumber = numericAmount.toLocaleString('en-US', formatOptions)
  
  return `${symbol} ${formattedNumber}`
}

/**
 * Format currency for compact display (e.g., 1.5K, 2.3M)
 * @param {number|string} amount - Amount to format
 * @param {string} currency - Currency code (default: LKR)
 * @returns {string} Compact formatted currency string
 */
export const formatCurrencyCompact = (amount, currency = DEFAULT_CURRENCY) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numericAmount) || !numericAmount) return `${CURRENCY_SYMBOLS[currency] || currency} 0`

  const symbol = CURRENCY_SYMBOLS[currency] || currency
  
  const formatCompact = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toLocaleString()
  }

  return `${symbol} ${formatCompact(numericAmount)}`
}

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed amount
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString === 'number') return currencyString
  
  // Remove currency symbols and spaces, then parse
  const cleanString = currencyString.replace(/[^\d.-]/g, '')
  return parseFloat(cleanString) || 0
}

/**
 * Convert currency amounts (for future multi-currency support)
 * Currently returns the same amount since we only support LKR
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency
 * @param {string} toCurrency - Target currency
 * @returns {number} Converted amount
 */
export const convertCurrency = (amount, fromCurrency = 'LKR', toCurrency = 'LKR') => {
  // For now, we only support LKR, so no conversion needed
  // This function is prepared for future multi-currency support
  return amount
}

/**
 * Get currency info for a given currency code
 * @param {string} currency - Currency code
 * @returns {object} Currency information
 */
export const getCurrencyInfo = (currency = DEFAULT_CURRENCY) => {
  return {
    code: currency,
    symbol: CURRENCY_SYMBOLS[currency] || currency,
    name: getCurrencyName(currency),
    formatOptions: CURRENCY_FORMAT_OPTIONS[currency] || CURRENCY_FORMAT_OPTIONS.LKR
  }
}

/**
 * Get full currency name
 * @param {string} currency - Currency code
 * @returns {string} Currency name
 */
const getCurrencyName = (currency) => {
  const names = {
    LKR: 'Sri Lankan Rupee',
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    INR: 'Indian Rupee'
  }
  return names[currency] || currency
}

/**
 * Format price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @param {string} currency - Currency code
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (minPrice, maxPrice, currency = DEFAULT_CURRENCY) => {
  if (!minPrice && !maxPrice) return 'Price on request'
  if (!maxPrice || minPrice === maxPrice) return formatCurrency(minPrice, currency)
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  return `${symbol} ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`
}

export default {
  formatCurrency,
  formatCurrencyCompact,
  parseCurrency,
  convertCurrency,
  getCurrencyInfo,
  formatPriceRange,
  DEFAULT_CURRENCY,
  CURRENCY_SYMBOLS
}