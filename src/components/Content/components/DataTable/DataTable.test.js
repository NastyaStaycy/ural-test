import { render, screen, within } from '@testing-library/react';
import { DataTable } from './DataTable';

describe('DataTable', () => {
	test('корректно отображает товар в наличии, список складов, цены и общий остаток', () => {
		const mockItem = {
			goodsID: '1FAFD8CA-F73E-11DC-A83E-000E0CE9B9AA',
			brand: 'MEYLE',
			number: '7160500039/S',
			name: 'Рычаги задней подвески',
			count: 30,
			price: 99999, // Корневая цена не должна использоваться
			warehouses: [
				{
					id: 'wh-1',
					code: 'МСК РС',
					price: 12533.62,
					stock: 20,
				},
				{
					id: 'wh-2',
					code: 'СПБ РС',
					price: 13000,
					stock: 10,
				},
			],
		};

		render(<DataTable item={mockItem} />);

		// 1. Заголовок карточки (название + бренд) и активный стиль table-primary
		const titleCell = screen.getByText(/Рычаги задней подвески/).closest('th');
		expect(titleCell).toHaveTextContent('Рычаги задней подвески / MEYLE');
		expect(titleCell.closest('tr')).toHaveClass('table-primary');

		// 2. Заголовки колонок присутствуют
		expect(screen.getByText('Склад')).toBeInTheDocument();
		expect(screen.getByText('Стоимость, руб.')).toBeInTheDocument();
		expect(screen.getByText('Доступный остаток, шт.')).toBeInTheDocument();

		// 3. Строки складов (цены берутся из warehouses, а не из item.price)
		expect(screen.queryByText(/99\s?999/)).not.toBeInTheDocument();

		const row1 = screen.getByText('МСК РС').closest('tr');
		expect(within(row1).getByText(/12\s533,62/)).toBeInTheDocument();
		expect(within(row1).getByText('20')).toBeInTheDocument();

		const row2 = screen.getByText('СПБ РС').closest('tr');
		expect(within(row2).getByText(/13\s000/)).toBeInTheDocument();
		expect(within(row2).getByText('10')).toBeInTheDocument();

		// 4. Итоговый подвал с общим остатком
		const footerRow = screen
			.getByText('Остаток на всех складах, шт.')
			.closest('tr');
		expect(within(footerRow).getByText('30')).toBeInTheDocument();
	});

	test('подставляет "—" если у склада отсутствует сокращённое название (code), и поддерживает строковую цену', () => {
		const mockItem = {
			goodsID: '2',
			brand: 'OSSCA',
			name: 'Фильтр масляный',
			count: 5,
			warehouses: [
				{
					id: 'wh-no-code',
					code: '',
					price: '450.00',
					stock: 5,
				},
			],
		};

		render(<DataTable item={mockItem} />);

		const row = screen.getByText('—').closest('tr');
		expect(row).toBeInTheDocument();
		expect(within(row).getByText('450.00')).toBeInTheDocument();
		expect(within(row).getByText('5')).toBeInTheDocument();
	});

	test('отображает заглушку "Товар отсутствует на складе" и скрывает заголовки колонок с итогом при count === 0', () => {
		const emptyItem = {
			goodsID: '3',
			brand: 'NGK',
			name: 'Свеча зажигания',
			count: 0,
			warehouses: [],
		};

		render(<DataTable item={emptyItem} />);

		// Заголовок помечен как неактивный (table-secondary)
		const titleCell = screen.getByText(/Свеча зажигания/).closest('th');
		expect(titleCell.closest('tr')).toHaveClass('table-secondary');

		// Заголовки колонок и итоговая строка скрыты
		expect(screen.queryByText('Склад')).not.toBeInTheDocument();
		expect(screen.queryByText('Стоимость, руб.')).not.toBeInTheDocument();
		expect(
			screen.queryByText('Остаток на всех складах, шт.'),
		).not.toBeInTheDocument();

		// Выведено сообщение об отсутствии товара
		expect(screen.getByText('Товар отсутствует на складе')).toBeInTheDocument();
	});
});
