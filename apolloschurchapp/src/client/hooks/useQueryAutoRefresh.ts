import { useEffect, useRef } from 'react';
import { ApolloQueryResult, useQuery } from '@apollo/client';
import { AppState, AppStateStatus } from 'react-native';
import { resyncContentful } from '../contentful';

const useQueryAutoRefresh: typeof useQuery = (query, options) => {
  const data = useQuery(query, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  const appState = useRef(AppState.currentState);
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      resyncContentful()
        .then(() => data.refetch())
        .catch((ex) => {
          console.error(ex);
          return data.refetch();
        });
    }

    appState.current = nextAppState;
  };

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  return {
    ...data,

    /**
     * Wraps the refetch() function to resync from Contentful first.
     * This forces a Contentful update whenever the user performs a pull-down.
     */
    refetch: async function refetch(
      variables
    ): Promise<ApolloQueryResult<any>> {
      return resyncContentful()
        .then(() => data.refetch(variables))
        .catch((ex) => {
          console.error(ex);
          return data.refetch(variables);
        });
    },
  };
};

export { useQueryAutoRefresh };
