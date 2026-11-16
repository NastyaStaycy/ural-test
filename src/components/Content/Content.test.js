import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import hspriceReducer from '../../store/slices/hspriceSlice';
import Content from './Content';

// Мокаем дочерние компоненты, чтобы тестировать логику ветвлений в Content
jest.mock('./components/DataTable/DataTable', () => ({
	DataTable: ({ item }) => (
		<div data-testid="data-table">{`${item.brand} - ${item.name}`}</div>
	),
}));

jest.mock('./components/Analogues/Analogues', () => ({
	Analogues: ({ items }) => (
		<div data-testid="analogues">{`Аналогов: ${items.length}`}</div>
	),
}));

// Хелпер для рендера с изолированным Redux Store
function renderContent(props = {}, preloadedState = {}) {
	const store = configureStore({
		reducer: {
			hsprice: hspriceReducer,
		},
		preloadedState: {
			hsprice: {
				selectedBrand: '',
				selectedNumber: '',
				...preloadedState.hsprice,
			},
		},
	});

	const defaultProps = {
		data: [],
		isLoading: false,
		isFetching: false,
		isError: false,
		error: undefined,
		...props,
	};

	return render(
		<Provider store={store}>
			<Content {...defaultProps} />
		</Provider>,
	);
}

describe('Content', () => {
	test('отображает спиннер при загрузке с пустыми данными, когда бренд не выбран', () => {
		const { rerender } = renderContent({
			data: [],
			isLoading: true,
			isFetching: false,
		});

		expect(screen.getByRole('status')).toBeInTheDocument();

		const store = configureStore({
			reducer: { hsprice: hspriceReducer },
			preloadedState: {
				hsprice: { selectedNumber: '01089', selectedBrand: '' },
			},
		});

		rerender(
			<Provider store={store}>
				<Content
					data={[]}
					isLoading={false}
					isFetching={true}
					isError={false}
				/>
			</Provider>,
		);

		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	test('отображает сообщение об ошибке из объекта RTK Query (error.data или error.error) или строки', () => {
		// 1. Бизнес-ошибка API в формате { status: 'API_ERROR', data: '...' }
		const { rerender } = renderContent({
			isError: true,
			error: { status: 'API_ERROR', data: 'Invalid key client!' },
		});

		const alert = screen.getByRole('alert');
		expect(alert).toHaveClass('alert-danger');
		expect(alert).toHaveTextContent('Invalid key client!');

		// 2. Сетевая ошибка в формате { status: 'FETCH_ERROR', error: 'Failed to fetch' }
		const store = configureStore({ reducer: { hsprice: hspriceReducer } });
		rerender(
			<Provider store={store}>
				<Content
					data={[]}
					isLoading={false}
					isFetching={false}
					isError={true}
					error={{ status: 'FETCH_ERROR', error: 'Failed to fetch' }}
				/>
			</Provider>,
		);
		expect(screen.getByRole('alert')).toHaveTextContent('Failed to fetch');

		// 3. Дефолтный текст ошибки, если объект error пустой
		rerender(
			<Provider store={store}>
				<Content
					data={[]}
					isLoading={false}
					isFetching={false}
					isError={true}
					error={{}}
				/>
			</Provider>,
		);
		expect(screen.getByRole('alert')).toHaveTextContent(
			'Ошибка получения данных',
		);
	});

	test('показывает начальную подсказку, если ни номер, ни бренд не выбраны', () => {
		renderContent(
			{ data: [] },
			{ hsprice: { selectedNumber: '', selectedBrand: '' } },
		);

		const alert = screen.getByRole('alert');
		expect(alert).toHaveClass('alert-light');
		expect(alert).toHaveTextContent(
			'Введите номер автозапчасти для поиска и выберите бренд',
		);
	});

	test('показывает подсказку "Выберите бренд", если артикул введён, а бренд ещё не выбран', () => {
		renderContent(
			{ data: [] },
			{ hsprice: { selectedNumber: '01089', selectedBrand: '' } },
		);

		const alert = screen.getByRole('alert');
		expect(alert).toHaveClass('alert-light');
		expect(alert).toHaveTextContent('Выберите бренд');
	});

	test('показывает сообщение "предложений не найдено", если бренд выбран, но массив data пуст', () => {
		renderContent(
			{ data: [] },
			{ hsprice: { selectedNumber: '7260500039S', selectedBrand: 'MEYLE' } },
		);

		const alert = screen.getByRole('alert');
		expect(alert).toHaveClass('alert-secondary');
		expect(alert).toHaveTextContent(
			'По артикулу 7260500039S и бренду MEYLE предложений не найдено',
		);
	});

	test('отображает спиннер при первичной загрузке (isLoading) с пустыми данными', () => {
		renderContent({
			data: [],
			isLoading: true,
			isFetching: false,
		});

		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	test('рендерит заголовок с брендом, таблицы товаров и блок аналогов (только если аналоги есть)', () => {
		const mockData = [
			{
				goodsID: '1',
				brand: 'MEYLE',
				number: '7160500039S',
				name: 'Рычаг задней подвески',
				analogues: [
					{ goodsID: '101', brand: 'MAPCO', name: 'Комплект рычагов' },
					{ goodsID: '102', brand: 'FEBI', name: 'Рычаг' },
				],
			},
			{
				goodsID: '2',
				brand: 'MEYLE',
				number: '7160500039S-2',
				name: 'Болт крепления',
				analogues: [], // Аналогов нет — компонент Analogues не должен рендериться
			},
		];

		renderContent(
			{ data: mockData },
			{ hsprice: { selectedNumber: '7160500039S', selectedBrand: 'MEYLE' } },
		);

		expect(
			screen.getByRole('heading', { name: 'Автозапчасти бренда MEYLE' }),
		).toBeInTheDocument();

		const tables = screen.getAllByTestId('data-table');
		expect(tables).toHaveLength(2);
		expect(tables[0]).toHaveTextContent('MEYLE - Рычаг задней подвески');
		expect(tables[1]).toHaveTextContent('MEYLE - Болт крепления');

		// Блок Analogues отрендерился только один раз (для первой позиции)
		const analoguesBlocks = screen.getAllByTestId('analogues');
		expect(analoguesBlocks).toHaveLength(1);
		expect(analoguesBlocks[0]).toHaveTextContent('Аналогов: 2');
	});
});
