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
    const { doFetch: fetchTest, isLoading: testLoading } = useFetch({
        checkConnnection: true,
    });

    const [state, { setIsOnline }] = useFetchContext();

    const fetchCheck = useCallback(() => {
        fetchTest([{ url: `${baseUrl}/posts` }, { func: () => setIsOnline(true) }]);
    }, [fetchTest, setIsOnline]);

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
            ]);
        },
        [doFetch]
    );

    //useEffect(() => handleTestFetch(), [handleTestFetch]);

    /* if (error) {
        console.log(msg);
        return <h1>Something went wrong.</h1>;
    } */
    console.log(response[1]);
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
        <FetchProvider options={{ checkIsOnline: true }}>
            <TestContainer />
        </FetchProvider>
    );
};

export default Test;
