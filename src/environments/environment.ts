// Development environment — Angular dev server proxies /api to localhost:8080
// Set up a proxy.conf.json if you want ng serve to work without Docker
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'   // direct call in dev (no Nginx)
};