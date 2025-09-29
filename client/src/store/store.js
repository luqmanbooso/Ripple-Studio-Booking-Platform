import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

// Slices
import authSlice from './authSlice'
import themeSlice from './themeSlice'

// API slices
import { userApi } from './userApi'
import { studioApi } from './studioApi'
import { bookingApi } from './bookingApi'
import { reviewApi } from './reviewApi'
import { paymentApi } from './paymentApi'
import { adminApi } from './adminApi'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    theme: themeSlice,
    [userApi.reducerPath]: userApi.reducer,
    [studioApi.reducerPath]: studioApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
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
      adminApi.middleware
    ),
  devTools: process.env.NODE_ENV !== 'production',
})

setupListeners(store.dispatch)

// Type aliases for RootState and AppDispatch are only valid in TypeScript files.
// Remove or move these to a .ts or .d.ts file if you need type safety.
