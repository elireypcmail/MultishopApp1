import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { createSerializableStateInvariantMiddleware } from '@reduxjs/toolkit'
import clientSlicer from './slicers/clientSlicer'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage,
}

const rootReducer = combineReducers({
  clients: clientSlicer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

const nonSerializableMiddleware = createSerializableStateInvariantMiddleware({
  ignoredActions: ['persist/PERSIST'],
})

export const store = configureStore({ 
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(nonSerializableMiddleware),
})