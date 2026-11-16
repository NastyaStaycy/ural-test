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

	const params = useMemo(
		() => ({
			// key взят из документации для примера, т.к. в задаче не описано, откуда его брать
			key: USER_KEY,
			analogues: 'on',
			brand,
			number,
		}),
		[number, brand],
	);

	const { data, isLoading, isError, error } = useGetHspriceQuery(params, {
		skip: !number,
	});

	const brandsList = useMemo(() => {
		if (!data?.goods?.length) return [];

		return Array.from(new Set(data.goods.map((el) => el.brand)));
	}, [data]);

	const resultData = useMemo(() => {
		if (!brand || !number || !data?.goods?.length) return [];

		return data.goods;
	}, [number, brand, data]);

	return (
		<div className="container">
			<div className="d-flex flex-column gap-4 pt-4 pb-8">
				<h4 className="mb-0">Сервис поиска автозапчастей и аналогов</h4>

				<SearchDropdown
					brandsList={brandsList}
					isLoading={isLoading}
					isError={isError}
					error={error}
				/>

				<Content
					data={resultData}
					isLoading={isLoading}
					isError={isError}
					error={error}
				/>
			</div>
		</div>
	);
}

export default App;
