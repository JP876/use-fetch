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
    const {
        doFetch: fetchTest,
        isLoading: testLoading,
        error: { msg: testMsg },
    } = useFetch();

    const [state, { setIsOnline }] = useFetchContext();

    const fetchCheck = useCallback(() => {
        doFetch([{ url: `${baseUrl}/posts` }, { func: () => setIsOnline(true) }]);
    }, [doFetch, setIsOnline]);

    const handleTestFetch = useCallback(
        (type) => {
            const url = type === 'error' ? 'posts1' : 'posts';

            doFetch([
                { url: `${baseUrl}/posts` },
                //{ func: (data) => console.log(data) },
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
                { url: `${baseUrl}/users` },
                { func: () => fetchCheck() },
            ]);
        },
        [doFetch, fetchCheck]
    );

    return (
        <>
            <button disabled={isLoading} onClick={handleTestFetch}>
                Test Correct
            </button>

            <button disabled={isLoading} onClick={() => handleTestFetch('error')}>
                Test Wrong
            </button>

            <button disabled={testLoading} onClick={fetchCheck}>
                Test Connection
            </button>

            <div className="status-container">
                <ul>
                    <li>Loading: {isLoading ? 'True' : 'False'}</li>
                    <li>Error: {error ? 'True' : 'False'}</li>
                    <li>Error message: {msg ? JSON.stringify(msg) : 'False'}</li>
                    <li>IsOnline: {state?.isOnline ? 'True' : 'False'}</li>
                    <li>IsOnline message: {testMsg ? JSON.stringify(msg) : 'False'}</li>
                    {response?.[1] && (
                        <li>
                            <h4>Response 1:</h4>
                            <p style={{ marginTop: '.4rem' }}>
                                Title: <span>{response[1]?.title}</span>
                            </p>
                            <p style={{ marginTop: '.4rem' }}>
                                Body: <span>{response[1]?.body}</span>
                            </p>
                            <p style={{ marginTop: '.4rem' }}>
                                UserId: <span>{response[1]?.userId}</span>
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
