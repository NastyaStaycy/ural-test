import { configureStore } from '@reduxjs/toolkit';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import hspriceReducer from '../../store/slices/hspriceSlice';
import SearchDropdown from './SearchDropdown';

// Хелпер для рендера компонента с изолированным Redux Store
function renderSearchDropdown(props = {}, preloadedState = {}) {
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
		brandsList: [],
		isLoading: false,
		isFetching: false,
		isError: false,
		error: undefined,
		...props,
	};

	return {
		store,
		...render(
			<Provider store={store}>
				<SearchDropdown {...defaultProps} />
			</Provider>,
		),
	};
}

describe('SearchDropdown', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
	});

	test('рендерит поле поиска и не открывает выпадающий список при пустом запросе', () => {
		renderSearchDropdown({ brandsList: ['OSSCA', 'FEBI'] });

		const input = screen.getByPlaceholderText(
			'Введите артикул автозапчасти...',
		);
		expect(input).toBeInTheDocument();

		// Фокусируемся на пустом поле — меню не должно появляться
		fireEvent.focus(input);
		expect(screen.queryByText('OSSCA')).not.toBeInTheDocument();
		expect(screen.queryByText('Ничего не найдено')).not.toBeInTheDocument();
	});

	test('обновляет selectedNumber в Redux только после истечения debounce (500 мс)', () => {
		const { store } = renderSearchDropdown();

		const input = screen.getByPlaceholderText(
			'Введите артикул автозапчасти...',
		);

		// Вводим артикул с пробелами по краям, чтобы проверить .trim()
		fireEvent.change(input, { target: { value: '  7160500039S  ' } });

		// Сразу после ввода в сторе ещё пусто
		expect(store.getState().hsprice.selectedNumber).toBe('');

		// Перематываем таймер на 500 мс
		act(() => {
			jest.advanceTimersByTime(500);
		});

		expect(store.getState().hsprice.selectedNumber).toBe('7160500039S');
	});

	test('отображает список брендов и сохраняет выбранный бренд в Redux при клике', () => {
		const { store } = renderSearchDropdown(
			{ brandsList: ['OSSCA', 'MEYLE'] },
			{ hsprice: { selectedNumber: '7160500039S', selectedBrand: '' } },
		);

		const input = screen.getByPlaceholderText(
			'Введите артикул автозапчасти...',
		);
		fireEvent.focus(input);

		const brandOption = screen.getByText('MEYLE');
		expect(brandOption).toBeInTheDocument();

		// Кликаем по бренду
		fireEvent.click(brandOption);

		// Бренд сохранился в стор, а выпадающий список закрылся
		expect(store.getState().hsprice.selectedBrand).toBe('MEYLE');
		expect(screen.queryByText('OSSCA')).not.toBeInTheDocument();
	});

	test('сбрасывает выбранный бренд при вводе нового артикула', () => {
		const { store } = renderSearchDropdown(
			{ brandsList: ['MEYLE'] },
			{ hsprice: { selectedNumber: '7160500039S', selectedBrand: 'MEYLE' } },
		);

		const input = screen.getByPlaceholderText(
			'Введите артикул автозапчасти...',
		);
		fireEvent.change(input, { target: { value: '01089' } });

		expect(store.getState().hsprice.selectedBrand).toBe('');
	});

	test('кнопка "Очистить" очищает поле ввода, сбрасывает номер и бренд в Redux и возвращает фокус', () => {
		const { store } = renderSearchDropdown(
			{ brandsList: ['MEYLE'] },
			{ hsprice: { selectedNumber: '7160500039S', selectedBrand: 'MEYLE' } },
		);

		const input = screen.getByPlaceholderText(
			'Введите артикул автозапчасти...',
		);
		const clearBtn = screen.getByRole('button', { name: 'Очистить' });

		fireEvent.click(clearBtn);

		expect(input).toHaveValue('');
		expect(input).toHaveFocus();
		expect(store.getState().hsprice.selectedNumber).toBe('');
		expect(store.getState().hsprice.selectedBrand).toBe('');
	});

	test('отображает бейдж выбранного бренда и позволяет сбросить только бренд', () => {
		const { store } = renderSearchDropdown(
			{ brandsList: ['MEYLE'] },
			{ hsprice: { selectedNumber: '7160500039S', selectedBrand: 'MEYLE' } },
		);

		expect(screen.getByText('Выбранный бренд:')).toBeInTheDocument();
		expect(screen.getByText('MEYLE')).toBeInTheDocument();

		const clearBrandBtn = screen.getByRole('button', {
			name: 'Очистить бренд',
		});
		fireEvent.click(clearBrandBtn);

		// Бренд сбросился, а номер детали остался
		expect(store.getState().hsprice.selectedBrand).toBe('');
		expect(store.getState().hsprice.selectedNumber).toBe('7160500039S');
	});

	test('корректно отображает спиннер загрузки, пустой результат и сообщение об ошибке', () => {
		const { rerender } = render(
			<Provider
				store={configureStore({
					reducer: { hsprice: hspriceReducer },
					preloadedState: {
						hsprice: { selectedNumber: '01089', selectedBrand: '' },
					},
				})}
			>
				<SearchDropdown
					brandsList={[]}
					isLoading={true}
					isFetching={false}
					isError={false}
				/>
			</Provider>,
		);

		const input = screen.getByPlaceholderText(
			'Введите артикул автозапчасти...',
		);
		fireEvent.focus(input);

		// 1. Состояние загрузки
		expect(screen.getByRole('status')).toBeInTheDocument();

		// 2. Пустой результат
		rerender(
			<Provider
				store={configureStore({
					reducer: { hsprice: hspriceReducer },
					preloadedState: {
						hsprice: { selectedNumber: '01089', selectedBrand: '' },
					},
				})}
			>
				<SearchDropdown
					brandsList={[]}
					isLoading={false}
					isFetching={false}
					isError={false}
				/>
			</Provider>,
		);
		expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();

		// 3. Ошибка API (в виде объекта RTK Query)
		rerender(
			<Provider
				store={configureStore({
					reducer: { hsprice: hspriceReducer },
					preloadedState: {
						hsprice: { selectedNumber: '01089', selectedBrand: '' },
					},
				})}
			>
				<SearchDropdown
					brandsList={[]}
					isLoading={false}
					isFetching={false}
					isError={true}
					error={{ status: 'API_ERROR', data: 'Invalid key client!' }}
				/>
			</Provider>,
		);
		expect(screen.getByText('Invalid key client!')).toBeInTheDocument();
	});
});
