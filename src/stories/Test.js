import React, { useCallback } from 'react';
import { FetchProvider, useFetchContext } from '../fetchContetxt/useFetchContext';
import useFetch from '../useFetch';

const baseUrl = 'https://jsonplaceholder.typicode.com';
const textBody =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod massa sit amet ante fermentum, sed viverra justo mollis. Nunc faucibus ac elit vel interdum.';

const TestContainer = () => {
    const {
        doFetch,
        isLoading,
        response,
        error: { error, msg },
    } = useFetch();

    const [state, { setIsOnline }] = useFetchContext();

    const fetchCheck = useCallback(() => {
        doFetch([{ url: `${baseUrl}/posts/1` }, { func: () => setIsOnline(true) }]);
    }, [doFetch, setIsOnline]);

    const handleTypeError = () => {
        doFetch([{ url: `${baseUrl}/posts/1` }, { func: (data) => data.map((d) => d) }]);
    };

    const handleTestFetch = useCallback(
        (type) => {
            const url = type === 'error' ? 'posts1' : 'posts';

            doFetch([
                { url: `${baseUrl}/posts` },
                {
                    url: `${baseUrl}/${url}`,
                    options: {
                        method: 'POST',
                        body: JSON.stringify({
                            title: 'test',
                            body: textBody,
                            userId: 2,
                        }),
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8',
                        },
                    },
                },
                { func: () => fetchCheck() },
            ]);
        },
        [doFetch, fetchCheck]
    );

    return (
        <>
            <div className="btn-container">
                <button disabled={isLoading} onClick={handleTestFetch}>
                    Test Correct
                </button>

                <button disabled={isLoading} onClick={() => handleTestFetch('error')}>
                    Test Wrong
                </button>

                <button disabled={isLoading} onClick={handleTypeError}>
                    Test TypeError
                </button>

                <button disabled={isLoading} onClick={fetchCheck}>
                    Test Connection
                </button>
            </div>

            <div className="status-container">
                <ul>
                    <li>Loading: {isLoading ? 'True' : 'False'}</li>
                    <li>Error: {error ? 'True' : 'False'}</li>
                    <li>Error message: {msg ? JSON.stringify(msg) : 'False'}</li>
                    <li>IsOnline: {state?.isOnline ? 'True' : 'False'}</li>

                    {response?.[0] && (
                        <li>
                            <h4>Response 0:</h4>
                            <p style={{ marginTop: '.4rem' }}>
                                Title: <span>{response[0]?.title}</span>
                            </p>
                            <p style={{ marginTop: '.4rem' }}>
                                Body: <span>{response[0]?.body}</span>
                            </p>
                            <p style={{ marginTop: '.4rem' }}>
                                UserId: <span>{response[0]?.userId}</span>
                            </p>
                        </li>
                    )}
                </ul>
            </div>
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
