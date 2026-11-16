import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	selectedBrand: '',
	selectedNumber: '',
};

export const hspriceSlice = createSlice({
	name: 'hsprice',
	initialState,
	reducers: {
		setSelectedBrand: (state, action) => {
			state.selectedBrand = action.payload;
		},
		setSelectedNumber: (state, action) => {
			state.selectedNumber = action.payload;
		},
	},
});

export const { setSelectedBrand, setSelectedNumber } = hspriceSlice.actions;

export default hspriceSlice.reducer;
