# Job Application Tracker — MERN

A full-stack job application tracker built with React, Vite, plain CSS, Node.js, Express, MongoDB/Mongoose, and JWT authentication.

## Features
- Register, login, logout
- JWT-protected API and user-owned application records
- Add, view, edit, delete applications
- Search by company, role, or notes
- Filter by status and sort by recently updated / company / deadline
- Dashboard stats calculated from real application data
- Track applied date, deadline, job URL, location, employment type, and notes
- Responsive UI
- Form validation, loading/error states, and empty states

## Requirements
- Node.js 20+ recommended
- MongoDB local instance or MongoDB Atlas connection string

## 1. Configure the backend
```bash
cd server
cp .env.example .env
```
Edit `server/.env`:
- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` — use a long random secret (at least 32 characters)
- `CLIENT_URL` — usually `http://localhost:5173`

Install and run:
```bash
npm install
npm run dev
```
The API runs at `http://localhost:5000`.

## 2. Configure the frontend
Open another terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

## 3. Try it
Register an account, log in, and add applications. Each account can access only its own records.

## Production notes
- Set strong, unique `JWT_SECRET` and secure environment variables in your deployment provider.
- Use MongoDB Atlas or another managed MongoDB service.
- Set `CLIENT_URL` to the deployed frontend URL.
- Set `VITE_API_URL` to the deployed backend URL, without a trailing slash.
- Deploy frontend and backend separately if desired.
- Use HTTPS in production.
- This starter stores the JWT in localStorage for simplicity. For higher-security production deployments, consider httpOnly secure cookies, refresh-token rotation, rate limiting, and a security review before handling sensitive data.
- The demo has no password-reset email flow or email verification.
