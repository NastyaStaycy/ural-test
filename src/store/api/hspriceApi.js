import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const rawBaseQuery = fetchBaseQuery({
	baseUrl: 'https://api.favorit-parts.ru',
});

const baseQueryWithApiError = async (args, api, extraOptions) => {
	const result = await rawBaseQuery(args, api, extraOptions);

	if (result.data?.error) {
		return {
			error: {
				status: 'API_ERROR',
				data: result.data.error,
			},
		};
	}

	return result;
};

export const hspriceApi = createApi({
	reducerPath: 'hspriceApi',
	baseQuery: baseQueryWithApiError,
	endpoints: (builder) => ({
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
