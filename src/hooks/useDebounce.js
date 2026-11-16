import { useEffect, useState } from 'react';

export function useDebounce(val, delay) {
	const [debouncedVal, setDebouncedVal] = useState(val);

	useEffect(() => {
		const timerId = setTimeout(() => {
			setDebouncedVal(val);
		}, delay);

		return () => {
			clearTimeout(timerId);
		};
	}, [val, delay]);

	return debouncedVal;
}
