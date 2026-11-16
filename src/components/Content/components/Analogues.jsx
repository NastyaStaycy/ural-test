import React, { Fragment, useMemo, useState } from 'react';
import { Container, Dropdown, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { DataTable } from '../components/DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';

export function Analogues({ items }) {
	console.log('items', items);
	const sortedItems = useMemo(() => {
		return [...items].sort((a, b) => b.count - a.count);
	}, [items]);
	return (
		<div>
			<h5 className="mb-3">Аналоги</h5>

			{sortedItems.map((item) => (
				<DataTable key={item.goodsID} item={item} />
			))}
		</div>
	);
}
