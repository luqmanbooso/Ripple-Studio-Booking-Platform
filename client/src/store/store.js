import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// Slices
import authSlice from './authSlice'
import themeSlice from './themeSlice'
import notificationSlice from './notificationSlice'

// API slices
import { userApi } from './userApi'
import { studioApi } from './studioApi'
import { bookingApi } from './bookingApi'
import { reviewApi } from './reviewApi'
import { paymentApi } from './paymentApi'
import { adminApi } from './adminApi'
import { mediaApi } from './mediaApi'
import { equipmentApi } from './equipmentApi'
import { serviceApi } from './serviceApi'
import { notificationApi } from './notificationApi'
import { ticketApi } from './ticketApi'
import { revenueApi } from './revenueApi'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    theme: themeSlice,
    notifications: notificationSlice,
    [userApi.reducerPath]: userApi.reducer,
    [studioApi.reducerPath]: studioApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [equipmentApi.reducerPath]: equipmentApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
    [revenueApi.reducerPath]: revenueApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      userApi.middleware,
      studioApi.middleware,
      bookingApi.middleware,
      reviewApi.middleware,
      paymentApi.middleware,
      adminApi.middleware,
      mediaApi.middleware,
      equipmentApi.middleware,
      serviceApi.middleware,
      notificationApi.middleware,
      ticketApi.middleware,
      revenueApi.middleware,
    ),
  devTools: process.env.NODE_ENV !== 'production',
})

setupListeners(store.dispatch)
// Type aliases for RootState and AppDispatch are only valid in TypeScript files.
// Remove or move these to a .ts or .d.ts file if you need type safety.
