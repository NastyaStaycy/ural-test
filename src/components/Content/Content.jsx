import { Fragment } from 'react';
import { useSelector } from 'react-redux';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Analogues } from './components/Analogues/Analogues';
import { DataTable } from './components/DataTable/DataTable';

export default function Content({
	data,
	isLoading,
	isError,
	error,
	isFetching,
}) {
	const brand = useSelector((state) => state.hsprice.selectedBrand);
	const number = useSelector((state) => state.hsprice.selectedNumber);

	if ((isLoading || isFetching) && !brand && data.length === 0) {
		return (
			<div className="text-center">
				<div className="spinner-border spinner-border-sm" role="status">
					<span className="visually-hidden">Loading...</span>
				</div>
			</div>
		);
	}

	if (isError) {
		const errorMessage =
			typeof error === 'string'
				? error
				: error?.data || error?.error || 'Ошибка получения данных';

		return (
			<div className="alert alert-danger text-center" role="alert">
				{errorMessage}
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

	if (brand && data.length === 0) {
		return (
			<div className="alert alert-secondary text-center" role="alert">
				По артикулу <strong>{number}</strong> и бренду <strong>{brand}</strong>{' '}
				предложений не найдено
			</div>
		);
	}

	return (
		<div className={isFetching ? 'opacity-50' : ''}>
			{brand && <h4 className="mb-3">Автозапчасти бренда {brand}</h4>}

			{data.map((item) => (
				<Fragment key={`${item.goodsID}-${item.brand}-${item.number}`}>
					<DataTable item={item} />

					{!!item.analogues?.length && <Analogues items={item.analogues} />}
				</Fragment>
			))}
		</div>
	);
}
