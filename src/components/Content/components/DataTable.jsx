import React, { Fragment, useState } from 'react';
import { Container, Dropdown, Form, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';

export function DataTable({ item }) {
	return (
		<div className="border overflow-auto mb-4">
			<Table responsive className="mb-0 align-middle">
				<thead>
					<tr className={item.count > 0 ? 'table-primary' : 'table-secondary'}>
						<th
							scope="row"
							colSpan={3}
							className={item.count > 0 ? '' : 'text-secondary'}
						>
							{item.name}
							{` `}
							<span className="text-secondary">/ {item.brand}</span>
						</th>
					</tr>
					{item.count > 0 && (
						<tr className="table-light">
							<th scope="col" className="text-secondary text-nowrap">
								Склад
							</th>
							<th
								scope="col"
								width="200"
								className="text-secondary text-nowrap"
							>
								Стоимость, руб.
							</th>
							<th
								scope="col"
								width="220"
								className="text-secondary text-center text-nowrap"
							>
								Доступный остаток, шт.
							</th>
						</tr>
					)}
				</thead>
				<tbody>
					{item.warehouses?.length > 0 ? (
						item.warehouses.map((warehouse) => (
							<tr key={warehouse.id}>
								<td className="text-nowrap">{warehouse.code}</td>
								<td className="text-nowrap">{warehouse.price}</td>
								<td className="text-nowrap text-center">{warehouse.stock}</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={3} className="text-center table-light">
								Товар отсутствует на складе
							</td>
						</tr>
					)}
				</tbody>
				{item.count > 0 && (
					<tfoot>
						<tr className="table-light">
							<th scope="row" colSpan={2}>
								Остаток на всех складах, шт.
							</th>
							<th className="text-center">{item.count}</th>
						</tr>
					</tfoot>
				)}
			</Table>
		</div>
	);
}
