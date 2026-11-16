import { useState } from 'react';

export function useDebounce(val, delay) {
	const [debouncedVal, setDebouncedVal] = useState(val);

	const timerId = setTimeout(() => {
		setDebouncedVal(val);

		return () => {
			clearTimeout(timerId);
		};
	}, delay);

	return debouncedVal;
}
