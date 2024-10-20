import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import consts from '../useFetch/consts';

const FetchContextState = createContext();
const FetchContextDispatch = createContext();
const FetchOptions = createContext();

export const useFetchStatusState = () => useContext(FetchContextState);
export const useFetchDispatch = () => useContext(FetchContextDispatch);
export const useFetchOptions = () => useContext(FetchOptions);

const { defaultFetchProviderOptions } = consts;

export const FetchProvider = ({ options = defaultFetchProviderOptions, children }) => {
    const [isOnline, setIsOnline] = useState(true);

    const handleConfirmIsOnline = useCallback((err) => {
        setIsOnline(false);
    }, []);

    const stateValue = useMemo(() => ({ isOnline }), [isOnline]);
    const dispatchValue = useMemo(() => ({ setIsOnline }), []);

    const optionsValue = useMemo(() => {
        return { handleConfirmIsOnline, providerOptions: options };
    }, [handleConfirmIsOnline, options]);

    return (
        <FetchOptions.Provider value={optionsValue}>
            <FetchContextState.Provider value={stateValue}>
                <FetchContextDispatch.Provider value={dispatchValue}>
                    {children}
                </FetchContextDispatch.Provider>
            </FetchContextState.Provider>
        </FetchOptions.Provider>
    );
};
