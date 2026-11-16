import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const hspriceApi = createApi({
	// Уникальное имя для редьюсера в сторе
	reducerPath: 'hspriceApi',
	// Базовый URL вашего бэкенда
	baseQuery: fetchBaseQuery({ baseUrl: 'https://api.favorit-parts.ru' }),
	// Описываем эндпоинты (запросы)
	endpoints: (builder) => ({
		// GET-запрос для получения списка постов
		getHsprice: builder.query({
			query: (params) => ({
				url: '/hs/hsprice/',
				method: 'GET',
				params,
			}),
		}),
	}),
});

export const { useGetHspriceQuery } = hspriceApi;
