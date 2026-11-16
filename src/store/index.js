import { configureStore } from '@reduxjs/toolkit';
import { hspriceApi } from './api/hspriceApi';
import hspriceReducer from './slices/hspriceSlice';

export const store = configureStore({
	reducer: {
		hsprice: hspriceReducer,
		[hspriceApi.reducerPath]: hspriceApi.reducer,
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(hspriceApi.middleware),
});
