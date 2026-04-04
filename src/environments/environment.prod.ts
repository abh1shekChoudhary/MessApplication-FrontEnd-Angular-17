// Production environment — served behind Nginx which proxies /api/* to server:8080
// The empty string means all API calls are relative (e.g. /api/auth/login)
// Nginx strips the /api prefix before forwarding to the Spring Boot backend
export const environment = {
  production: true,
  apiUrl: '/api'
};