import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Analogues } from './components/Analogues';
import { DataTable } from './components/DataTable';
import '../../App.css';

export default function Content({ data, isLoading, isError, error }) {
	const brand = useSelector((state) => state.hsprice.selectedBrand);
	const number = useSelector((state) => state.hsprice.selectedNumber);

	if (isLoading && data.length === 0) {
		return (
			<div className="text-center">
				<div className="spinner-border spinner-border-sm" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="alert alert-danger text-center" role="alert">
				{error || 'Ошибка получения данных'}
			</div>
		);
	}

	if (!brand && data.length === 0) {
		return (
			<div className="alert alert-light text-center" role="alert">
				{!brand && !number
					? 'Введите номер автозапчасти для поиска и выберите бренд'
					: 'Выберите бренд'}
			</div>
		);
	}

	return (
		<div>
			{brand && <h4 className="mb-3">Автозапчасти бренда {brand}</h4>}

			{data.map((item) => (
				<Fragment key={item.goodsID}>
					<DataTable item={item} />

					{!!item.analogues?.length && <Analogues items={item.analogues} />}
				</Fragment>
			))}
		</div>
	);
}
