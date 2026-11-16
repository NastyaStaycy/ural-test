import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { USER_KEY } from './consts';
import { useGetHspriceQuery } from './store/api/hspriceApi';
import hspriceReducer, {
	setSelectedBrand,
	setSelectedNumber,
} from './store/slices/hspriceSlice';

// Мокаем хук RTK Query, чтобы изолировать компонент от реальной сети
jest.mock('./store/api/hspriceApi', () => ({
	useGetHspriceQuery: jest.fn(),
}));

// Мокаем дочерние компоненты, чтобы проверить именно логику App.js и передачу пропсов
jest.mock('./components/SearchDropdown/SearchDropdown', () => {
	return function MockSearchDropdown(props) {
		return (
			<div data-testid="search-dropdown">
				<span data-testid="dropdown-brands">
					{JSON.stringify(props.brandsList)}
				</span>
				<span data-testid="dropdown-loading">{String(props.isLoading)}</span>
				<span data-testid="dropdown-fetching">{String(props.isFetching)}</span>
				<span data-testid="dropdown-error">{String(props.isError)}</span>
			</div>
		);
	};
});

jest.mock('./components/Content/Content', () => {
	return function MockContent(props) {
		return (
			<div data-testid="content">
				<span data-testid="content-data">{JSON.stringify(props.data)}</span>
				<span data-testid="content-loading">{String(props.isLoading)}</span>
				<span data-testid="content-fetching">{String(props.isFetching)}</span>
				<span data-testid="content-error">{String(props.isError)}</span>
			</div>
		);
	};
});

// Хелпер для рендера App с чистым Redux Store
function renderWithStore(preloadedState = {}) {
	const store = configureStore({
		reducer: {
			hsprice: hspriceReducer,
		},
		preloadedState,
	});

	return {
		store,
		...render(
			<Provider store={store}>
				<App />
			</Provider>,
		),
	};
}

describe('App', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		useGetHspriceQuery.mockReturnValue({
			data: undefined,
			isLoading: false,
			isFetching: false,
			isError: false,
			error: undefined,
		});
	});

	test('рендерит заголовок и пропускает запрос (skip: true), если артикул пустой', () => {
		renderWithStore({
			hsprice: { selectedNumber: '', selectedBrand: '' },
		});

		expect(
			screen.getByText('Сервис поиска автозапчастей и аналогов'),
		).toBeInTheDocument();

		expect(useGetHspriceQuery).toHaveBeenCalledWith(
			{ key: USER_KEY, number: '' },
			{ skip: true },
		);

		expect(screen.getByTestId('dropdown-brands')).toHaveTextContent('[]');
		expect(screen.getByTestId('content-data')).toHaveTextContent('[]');
	});

	test('этап 1: передаёт только key и number (без brand и analogues), фильтрует дубли и пустые бренды', () => {
		useGetHspriceQuery.mockReturnValue({
			data: {
				goods: [
					{ goodsID: '1', brand: 'OSSCA', name: 'Деталь 1' },
					{ goodsID: '2', brand: 'OSSCA', name: 'Деталь 2' },
					{ goodsID: '3', brand: 'FEBI', name: 'Деталь 3' },
					{ goodsID: '4', brand: '', name: '' }, // пустая структура из API
				],
			},
			isLoading: false,
			isFetching: false,
			isError: false,
			error: undefined,
		});

		renderWithStore({
			hsprice: { selectedNumber: '01089', selectedBrand: '' },
		});

		// Проверяем, что запрос вызван без brand и analogues
		expect(useGetHspriceQuery).toHaveBeenCalledWith(
			{ key: USER_KEY, number: '01089' },
			{ skip: false },
		);

		// Уникальные непустые бренды попали в SearchDropdown
		expect(screen.getByTestId('dropdown-brands')).toHaveTextContent(
			JSON.stringify(['OSSCA', 'FEBI']),
		);

		// Пока бренд не выбран, в Content передаётся пустой массив
		expect(screen.getByTestId('content-data')).toHaveTextContent('[]');
	});

	test('этап 2: при выбранном бренде добавляет brand и analogues: "on" и передаёт goods в Content', () => {
		const mockGoods = [
			{
				goodsID: '1',
				brand: 'MEYLE',
				number: '7160500039S',
				name: 'Рычаг подвески',
				count: 20,
			},
		];

		useGetHspriceQuery.mockReturnValue({
			data: { goods: mockGoods },
			isLoading: false,
			isFetching: true,
			isError: false,
			error: undefined,
		});

		renderWithStore({
			hsprice: { selectedNumber: '7160500039S', selectedBrand: 'MEYLE' },
		});

		expect(useGetHspriceQuery).toHaveBeenCalledWith(
			{
				key: USER_KEY,
				number: '7160500039S',
				brand: 'MEYLE',
				analogues: 'on',
			},
			{ skip: false },
		);

		expect(screen.getByTestId('content-data')).toHaveTextContent(
			JSON.stringify(mockGoods),
		);
		expect(screen.getByTestId('content-fetching')).toHaveTextContent('true');
		expect(screen.getByTestId('dropdown-fetching')).toHaveTextContent('true');
	});

	test('корректно реагирует на динамическое изменение Redux Store (ввод номера и выбор бренда)', () => {
		const { store } = renderWithStore({
			hsprice: { selectedNumber: '', selectedBrand: '' },
		});

		// Шаг 1: пользователь ввёл артикул
		act(() => {
			store.dispatch(setSelectedNumber('7160500039S'));
		});

		expect(useGetHspriceQuery).toHaveBeenLastCalledWith(
			{ key: USER_KEY, number: '7160500039S' },
			{ skip: false },
		);

		// Шаг 2: пользователь выбрал бренд
		act(() => {
			store.dispatch(setSelectedBrand('MEYLE'));
		});

		expect(useGetHspriceQuery).toHaveBeenLastCalledWith(
			{
				key: USER_KEY,
				number: '7160500039S',
				brand: 'MEYLE',
				analogues: 'on',
			},
			{ skip: false },
		);
	});
});
