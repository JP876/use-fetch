import { createContext, useContext } from "react";

export const FetchContext = createContext();

export const useFetchContext = () => {
	const context = useContext(FetchContext);

	if (!context) {
		throw new Error(
			"useFetch hook should be wrapped with FetchContext provider"
		);
	}

	return context;
};
