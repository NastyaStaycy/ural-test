import { createSlice } from '@reduxjs/toolkit';

// Начальное состояние (initialState)
const initialState = {
	value: 0,
	selectedBrand: '',
	selectedNumber: '',
};

export const hspriceSlice = createSlice({
	name: 'hsprice', // Уникальное имя слайса
	initialState,
	// Редьюсеры — функции, которые изменяют состояние
	reducers: {
		increment: (state) => {
			// В Redux Toolkit можно писать мутирующий код (state.value += 1),
			// под капотом библиотека Immer сделает его безопасным и иммутабельным
			state.value += 1;
		},
		decrement: (state) => {
			state.value -= 1;
		},
		// Пример экшена с передачей данных (payload)
		incrementByAmount: (state, action) => {
			state.value += action.payload;
		},
		setSelectedBrand: (state, action) => {
			state.selectedBrand = action.payload;
		},
		setSelectedNumber: (state, action) => {
			state.selectedNumber = action.payload;
		},
	},
});

// Экспортируем экшены (actions), чтобы вызывать их в компонентах
export const {
	increment,
	decrement,
	incrementByAmount,
	setSelectedBrand,
	setSelectedNumber,
} = hspriceSlice.actions;

// Экспортируем редьюсер, чтобы подключить его к главному стору
export default hspriceSlice.reducer;
