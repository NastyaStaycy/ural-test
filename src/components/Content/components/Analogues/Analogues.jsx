import { useMemo } from 'react';
import { DataTable } from '../DataTable/DataTable';

export function Analogues({ items }) {
	const sortedItems = useMemo(() => {
		return [...items].sort((a, b) => b.count - a.count);
	}, [items]);

	return (
		<div>
			<h5 className="mb-3">Аналоги</h5>

			{sortedItems.map((item) => (
				<DataTable
					key={`${item.goodsID}-${item.brand}-${item.number}`}
					item={item}
				/>
			))}
		</div>
	);
}
