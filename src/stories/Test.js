import React, { useCallback, useEffect } from 'react';
import { FetchProvider, useFetchContext } from '../fetchContetxt/useFetchContext';
import useFetch from '../useFetch';

const baseUrl = 'https://jsonplaceholder.typicode.com';

const TestContainer = () => {
    const {
        doFetch,
        isLoading,
        response,
        error: { error, msg },
    } = useFetch();

    const [state] = useFetchContext();

    const handleTestFetch = useCallback((type) => {
        const url = type === 'error' ? 'posts1' : 'posts';

        doFetch([
            { url: `${baseUrl}/posts`, id: 'posts' },
            //{ func: (data) => console.log(data) },
            {
                url: `${baseUrl}/${url}`,
                options: {
                    method: 'POST',
                    body: JSON.stringify({ title: 'test', body: 'test', userId: 2 }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                },
                case: 'add post',
            },
            { func: (data) => console.log(data) },
            { url: `${baseUrl}/posts`, id: 'posts' },
        ]);
    }, []);

    //useEffect(() => handleTestFetch(), [handleTestFetch]);

    /* if (error) {
        console.log(msg);
        return <h1>Something went wrong.</h1>;
    } */

    return (
        <>
            <button
                disabled={isLoading}
                style={{ padding: '.4rem .8rem', fontSize: '1.2rem' }}
                onClick={handleTestFetch}
            >
                Test
            </button>
            <button
                disabled={isLoading}
                style={{ padding: '.4rem .8rem', fontSize: '1.2rem' }}
                onClick={() => handleTestFetch('error')}
            >
                Test Wrong
            </button>
        </>
    );
};

const Test = () => {
    return (
        <FetchProvider>
            <TestContainer />
        </FetchProvider>
    );
};

export default Test;
