import { useEffect, useRef } from 'react';
import { ApolloQueryResult, useQuery } from '@apollo/client';
import { AppState } from 'react-native';
import { resyncContentful } from '../contentful';

// eslint-disable-next-line import/prefer-default-export
export function useQueryAutoRefresh(query, options) {
  const data = useQuery(query, {
    fetchPolicy: 'cache-and-network',
    ...options,
  });

  const appState = useRef(AppState.currentState);
  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      refetch();
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
    refetch,
  };

  /**
   * Wraps the refetch() function to resync from Contentful first.
   * This forces a Contentful update whenever the user performs a pull-down.
   */
  async function refetch(): Promise<ApolloQueryResult<any>> {
    await resyncContentful();
    return data.refetch();
  }
}
