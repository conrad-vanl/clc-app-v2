import URL from 'url';
import querystring from 'querystring';

type Navigator = {
  navigate(route: string, args?: any): void
}

export function navigateInApp(rawUrl: string, navigator: Navigator) {
  // copied from packages/apollos-ui-notifications/src/Provider.js
  const url = URL.parse(rawUrl);
  const route = url.pathname!.substring(1);
  const cleanedRoute = route.includes('/app-link/')
    ? route
    : route.split('app-link/')[1];
  const args = querystring.parse(url.query || '');
  console.log('Navigate to', cleanedRoute)
  navigator.navigate(cleanedRoute, args);
}
