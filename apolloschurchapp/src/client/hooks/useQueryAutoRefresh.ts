import { useEffect, useRef } from 'react';
import { ApolloQueryResult, useQuery } from '@apollo/client';
import { AppState, AppStateStatus } from 'react-native';
import { resyncContentful } from '../contentful';

const useQueryAutoRefresh: typeof useQuery = (query, options) => {
  const data = useQuery(query, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 3000,
    ...options,
  });

  const appState = useRef(AppState.currentState);
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      const p = resyncContentful();
      if (!p) {
        data.refetch();
      } else {
        p.finally(() => data.refetch());
      }
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
      const p = resyncContentful();
      if (!p) {
        return data.refetch(variables);
      }
      return p.then(
        () => data.refetch(variables),
        (_ex) => {
          console.error(ex);
          return data.refetch(variables)
        }
      );
    },
  };
};

export { useQueryAutoRefresh };
