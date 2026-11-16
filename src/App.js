import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import Content from './components/Content/Content';
import SearchDropdown from './components/SearchDropdown/SearchDropdown';
import { USER_KEY } from './consts';
import { useGetHspriceQuery } from './store/api/hspriceApi';
import './App.css';

function App() {
	const number = useSelector((state) => state.hsprice.selectedNumber);
	const brand = useSelector((state) => state.hsprice.selectedBrand);

	const params = useMemo(() => {
		const queryParams = {
			key: USER_KEY,
			number,
		};

		if (brand) {
			queryParams.brand = brand;
			queryParams.analogues = 'on';
		}

		return queryParams;
	}, [number, brand]);

	const { data, isLoading, isError, error, isFetching } = useGetHspriceQuery(
		params,
		{
			skip: !number,
		},
	);

	const brandsList = useMemo(() => {
		if (!data?.goods?.length) return [];

		return Array.from(
			// Фильтрация на случай если вернется массив с одним элементом в виде пустой структуры ответа
			new Set(data.goods.map((el) => el.brand).filter(Boolean)),
		);
	}, [data]);

	const resultData = useMemo(() => {
		if (!brand || !number || !data?.goods?.length) return [];

		return data.goods;
	}, [number, brand, data]);

	return (
		<div className="container">
			<div className="d-flex flex-column gap-4 pt-4 pb-5">
				<h4 className="mb-0">Сервис поиска автозапчастей и аналогов</h4>

				<SearchDropdown
					brandsList={brandsList}
					isLoading={isLoading}
					isFetching={isFetching}
					isError={isError}
					error={error}
				/>

				<Content
					data={resultData}
					isLoading={isLoading}
					isError={isError}
					error={error}
					isFetching={isFetching}
				/>
			</div>
		</div>
	);
}

export default App;
