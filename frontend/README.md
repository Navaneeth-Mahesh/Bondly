# Bondly — Frontend

React + Vite frontend for Bondly. See the root `README.md` (one level up) for
full setup and deployment instructions for both frontend and backend.

## Quick start

npm install
cp .env.example .env   # set VITE_API_URL to your backend
npm run dev

Requires the backend (`../backend`) to be running for the app to function —
this frontend has no mock data fallback, it talks to the real API and a real
Socket.IO connection for messaging.
