import React, { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client'
import { AppState } from 'react-native';

export function useQueryAutoRefresh(query, options) {
  const data = useQuery(query, {
    fetchPolicy: 'cache-and-network',
    ...options
  })

  const appState = useRef(AppState.currentState);
  const handleAppStateChange = (nextAppState) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active"
    ) {
      console.log("App has come to the foreground!");
      data.refetch();
    }

    appState.current = nextAppState;
  };
  
  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);

    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  return data
}