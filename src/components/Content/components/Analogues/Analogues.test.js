import { render, screen } from '@testing-library/react';
import { Analogues } from './Analogues';

// Мокаем DataTable, чтобы проверить сам факт рендера и порядок элементов
jest.mock('../DataTable/DataTable', () => ({
	DataTable: ({ item }) => (
		<div data-testid="analogue-item">{`${item.brand}: ${item.count}`}</div>
	),
}));

describe('Analogues', () => {
	test('отображает заголовок "Аналоги" и сортирует позиции по убыванию остатка (count)', () => {
		const mockItems = [
			{
				goodsID: '1',
				brand: 'FEBI',
				number: '100',
				name: 'Аналог с нулевым остатком',
				count: 0,
			},
			{
				goodsID: '2',
				brand: 'MAPCO',
				number: '200',
				name: 'Аналог с максимальным остатком',
				count: 25,
			},
			{
				goodsID: '3',
				brand: 'OSSCA',
				number: '300',
				name: 'Аналог со средним остатком',
				count: 10,
			},
		];

		// Сохраняем копию исходного порядка, чтобы проверить отсутствие мутации
		const originalOrder = mockItems.map((el) => el.brand);

		render(<Analogues items={mockItems} />);

		// 1. Заголовок раздела присутствует
		expect(
			screen.getByRole('heading', { level: 5, name: 'Аналоги' }),
		).toBeInTheDocument();

		// 2. Элементы отрендерены в порядке убывания count: 25 -> 10 -> 0
		const renderedItems = screen.getAllByTestId('analogue-item');
		expect(renderedItems).toHaveLength(3);
		expect(renderedItems[0]).toHaveTextContent('MAPCO: 25');
		expect(renderedItems[1]).toHaveTextContent('OSSCA: 10');
		expect(renderedItems[2]).toHaveTextContent('FEBI: 0');

		// 3. Исходный массив props.items не был мутирован при сортировке
		expect(mockItems.map((el) => el.brand)).toEqual(originalOrder);
	});
});
