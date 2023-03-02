import React, { createContext, useContext, useState } from 'react';

const FetchContextState = createContext();
const FetchContextDispatch = createContext();

export const useFetchContext = () => {
    const state = useContext(FetchContextState);
    const dispatch = useContext(FetchContextDispatch);

    if (!(state || dispatch)) {
        throw new Error('useFetch hook should be wrapped with FetchContext provider');
    }

    return [state, dispatch];
};

export const FetchProvider = ({ options: { checkIsOnline = false } = {}, children }) => {
    const [isOnline, setIsOnline] = useState(true);

    return (
        <FetchContextState.Provider value={{ isOnline, checkIsOnline }}>
            <FetchContextDispatch.Provider value={{ setIsOnline }}>
                {children}
            </FetchContextDispatch.Provider>
        </FetchContextState.Provider>
    );
};
