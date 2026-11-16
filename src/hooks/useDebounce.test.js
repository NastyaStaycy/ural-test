import { act, renderHook } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test('возвращает начальное значение сразу при первом рендере', () => {
		const { result } = renderHook(() => useDebounce('01089', 500));

		expect(result.current).toBe('01089');
	});

	test('обновляет значение только после истечения указанной задержки (delay)', () => {
		const { result, rerender } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{ initialProps: { value: '010', delay: 500 } },
		);

		// Меняем входное значение
		rerender({ value: '01089', delay: 500 });

		// Прошло меньше 500 мс — значение должно оставаться старым
		act(() => {
			jest.advanceTimersByTime(300);
		});
		expect(result.current).toBe('010');

		// Прошли оставшиеся 200 мс (итого 500 мс) — значение обновилось
		act(() => {
			jest.advanceTimersByTime(200);
		});
		expect(result.current).toBe('01089');
	});

	test('сбрасывает предыдущий таймер при быстром последовательном вводе', () => {
		const { result, rerender } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{ initialProps: { value: '0', delay: 500 } },
		);

		// Быстро вводим символы каждые 200 мс (меньше delay)
		rerender({ value: '01', delay: 500 });
		act(() => {
			jest.advanceTimersByTime(200);
		});

		rerender({ value: '010', delay: 500 });
		act(() => {
			jest.advanceTimersByTime(200);
		});

		rerender({ value: '01089', delay: 500 });
		act(() => {
			jest.advanceTimersByTime(200);
		});

		// С момента последнего ввода прошло только 200 мс — промежуточные значения не применились
		expect(result.current).toBe('0');

		// Дожидаемся оставшиеся 300 мс после последнего ввода
		act(() => {
			jest.advanceTimersByTime(300);
		});
		expect(result.current).toBe('01089');
	});
});
