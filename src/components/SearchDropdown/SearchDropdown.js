import { useEffect, useRef, useState } from 'react';
import { Button, Dropdown, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { SearchIcon } from '../../consts';
import { useDebounce } from '../../hooks/useDebounce';
import {
	setSelectedBrand,
	setSelectedNumber,
} from '../../store/slices/hspriceSlice';

export default function SearchDropdown({
	brandsList,
	isLoading,
	isFetching,
	isError,
	error,
}) {
	const dispatch = useDispatch();

	const brand = useSelector((state) => state.hsprice.selectedBrand);
	const number = useSelector((state) => state.hsprice.selectedNumber);

	const [query, setQuery] = useState(number);
	const [isOpen, setIsOpen] = useState(false);

	const inputRef = useRef(null);

	const handleSelect = (item) => {
		dispatch(setSelectedBrand(item));
		setIsOpen(false);
	};

	const handleClear = () => {
		setQuery('');
		dispatch(setSelectedNumber(''));
		dispatch(setSelectedBrand(''));
		inputRef.current?.focus();
	};

	const debouncedVal = useDebounce(query, 500);

	useEffect(() => {
		dispatch(setSelectedNumber(debouncedVal.trim()));
	}, [debouncedVal]);

	const errorMessage =
		typeof error === 'string'
			? error
			: error?.data || error?.error || 'Ошибка получения данных';

	return (
		<div className="border rounded-3 p-4 bg-body-tertiary">
			<div className="position-relative">
				<InputGroup className="search-group">
					<InputGroup.Text className="bg-body border-end-0 text-muted">
						<SearchIcon />
					</InputGroup.Text>
					<Form.Control
						ref={inputRef}
						className="border-start-0 border-end-0 ps-0 shadow-none"
						type="text"
						placeholder="Введите артикул автозапчасти..."
						value={query}
						onFocus={() => setIsOpen(true)}
						onBlur={() => setTimeout(() => setIsOpen(false), 150)}
						onChange={(e) => {
							if (brand) {
								dispatch(setSelectedBrand(''));
							}
							setQuery(e.target.value);
							setIsOpen(true);
						}}
					/>
					{query && (
						<Button
							variant="link"
							onMouseDown={(e) => e.preventDefault()}
							onClick={handleClear}
							aria-label="Очистить"
							className="text-secondary text-decoration-none shadow-none px-3 bg-body border border-start-0"
						>
							&times;
						</Button>
					)}
				</InputGroup>

				{isOpen && query.trim() && (
					<Dropdown.Menu show className="w-100 mt-1 shadow-sm">
						{isError ? (
							<Dropdown.Item disabled className="text-danger text-center">
								{errorMessage}
							</Dropdown.Item>
						) : isLoading || isFetching ? (
							<Dropdown.Item disabled className="text-center">
								<Spinner animation="border" size="sm" role="status">
									<span className="visually-hidden">Загрузка...</span>
								</Spinner>
							</Dropdown.Item>
						) : brandsList.length > 0 ? (
							brandsList.map((item) => (
								<Dropdown.Item
									key={item}
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => handleSelect(item)}
								>
									{item}
								</Dropdown.Item>
							))
						) : (
							<Dropdown.Item disabled>Ничего не найдено</Dropdown.Item>
						)}
					</Dropdown.Menu>
				)}
			</div>

			{brand && (
				<div className="d-inline-flex align-items-center gap-2 mt-3">
					<span className="text-body">
						<span className="text-secondary">Выбранный бренд:</span> {brand}
					</span>

					<Button
						variant="light"
						size="sm"
						onClick={() => dispatch(setSelectedBrand(''))}
						aria-label="Очистить бренд"
						className="d-inline-flex align-items-center justify-content-center border rounded-circle p-0 text-secondary btn-close-badge"
					>
						&times;
					</Button>
				</div>
			)}
		</div>
	);
}
