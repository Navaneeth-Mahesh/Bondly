# Bondly

A modern full-stack social media platform built with React, Express, MongoDB, and Socket.IO. Bondly allows users to connect with friends, share posts, chat in real time, and discover content through a clean, responsive interface.

---

## Overview

Bondly is designed as a complete social networking application with authentication, real-time messaging, notifications, profile customization, image uploads, and a responsive user experience.

The project is separated into two applications:

```
bondly/
├── backend/          # Express.js API + MongoDB + Socket.IO
├── frontend/         # React + Vite Client
├── render.yaml       # Optional Render deployment blueprint
└── README.md
```

---

# Features

## Authentication

- User registration
- Secure login with JWT
- Password hashing using bcrypt
- Persistent authentication
- Protected API routes

---

## User Profiles

- Edit profile information
- Upload profile picture
- Upload cover banner
- Bio
- Location
- Personal website
- Follow / Unfollow users
- Followers & Following lists

---

## Posts

- Create posts
- Upload images
- Delete your own posts
- Like posts
- Save posts
- Share posts
- Infinite scrolling feed

---

## Comments

- Add comments
- Delete your own comments
- Nested replies
- Like comments

---

## Real-Time Messaging

Powered by Socket.IO.

Features include:

- One-to-one chat
- Live messaging
- Typing indicators
- Online / Offline presence
- Image sharing
- Instant delivery

---

## Notifications

Receive notifications for:

- Likes
- Comments
- New followers

Additional features:

- Unread notification badge
- Mark individual notifications as read
- Mark all notifications as read

---

## Explore

- User search
- Suggested profiles
- Trending posts

---

## Settings

- Light / Dark mode
- Theme preference sync
- Privacy controls
- Notification preferences
- Password change
- Delete account

---

## UI / UX

- Responsive layout
- Desktop support
- Tablet support
- Mobile support
- Glassmorphism navigation
- Smooth animations
- Modern design system

---

# Tech Stack

## Frontend

- React 19
- Vite
- React Router
- Tailwind CSS v4
- Framer Motion
- Lucide React
- Socket.IO Client

---

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs

---

# Project Structure

```
bondly
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── socket
│   ├── utils
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   ├── services
│   │   ├── utils
│   │   └── App.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── render.yaml
└── README.md
```

---

# Getting Started

## Prerequisites

Install:

- Node.js 18+
- npm
- MongoDB Atlas account

---

# Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file.

```
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173
PORT=5000
```

(Optional)

Populate demo data.

```bash
npm run seed
```

Start development server.

```bash
npm run dev
```

Backend runs at

```
http://localhost:5000
```

---

# Frontend Setup

```bash
cd frontend

npm install
```

Create `.env`

```
VITE_API_URL=http://localhost:5000/api
```

Run development server.

```bash
npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

# MongoDB Atlas Setup

1. Create a free MongoDB Atlas cluster.
2. Create a database user.
3. Add IP Address

```
0.0.0.0/0
```

4. Obtain the connection string.

Example:

```
mongodb+srv://username:password@cluster.mongodb.net/bondly
```

5. Add it to

```
backend/.env
```

```
MONGODB_URI=your_connection_string
```

---

# Database Collections

Collections are automatically created by Mongoose.

| Collection | Description |
|------------|-------------|
| users | User accounts |
| posts | Social posts |
| comments | Post comments |
| notifications | User notifications |
| conversations | Chat conversations |
| messages | Chat messages |

---

# Running the Application

Backend

```bash
cd backend
npm run dev
```

Frontend

```bash
cd frontend
npm run dev
```

Open

```
http://localhost:5173
```

Register a new account or login with demo credentials after seeding.

---

# Deployment

## Backend (Render)

### Build Command

```bash
npm install
```

### Start Command

```bash
npm start
```

Environment Variables

```
MONGODB_URI
JWT_SECRET
JWT_EXPIRES_IN
CLIENT_URL
NODE_ENV=production
```

Health Check

```
https://your-backend.onrender.com/api/health
```

---

## Frontend (Vercel)

Root Directory

```
frontend
```

Environment Variable

```
VITE_API_URL=https://your-backend.onrender.com/api
```

Deploy and update the backend:

```
CLIENT_URL=https://your-frontend.vercel.app
```

---

# REST API

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/auth/register |
| POST | /api/auth/login |
| GET | /api/auth/me |

---

## Users

| Method | Endpoint |
|---------|----------|
| GET | /api/users |
| GET | /api/users/:username |
| PUT | /api/users/me |
| PUT | /api/users/me/preferences |
| PUT | /api/users/me/password |
| DELETE | /api/users/me |
| POST | /api/users/:id/follow |
| GET | /api/users/:id/followers |
| GET | /api/users/:id/following |

---

## Posts

| Method | Endpoint |
|---------|----------|
| GET | /api/posts |
| GET | /api/posts/trending |
| GET | /api/posts/saved |
| GET | /api/posts/liked |
| GET | /api/posts/user/:userId |
| POST | /api/posts |
| DELETE | /api/posts/:id |
| POST | /api/posts/:id/like |
| POST | /api/posts/:id/save |
| POST | /api/posts/:id/share |

---

## Comments

| Method | Endpoint |
|---------|----------|
| GET | /api/posts/:postId/comments |
| POST | /api/posts/:postId/comments |
| DELETE | /api/comments/:id |
| POST | /api/comments/:id/like |

---

## Notifications

| Method | Endpoint |
|---------|----------|
| GET | /api/notifications |
| PUT | /api/notifications/read-all |
| PUT | /api/notifications/:id/read |

---

## Messaging

| Method | Endpoint |
|---------|----------|
| GET | /api/messages/conversations |
| POST | /api/messages/conversations |
| GET | /api/messages/conversations/:id/messages |
| POST | /api/messages/conversations/:id/messages |

---

# Socket.IO Events

## Client → Server

```
typing:start
typing:stop
```

---

## Server → Client

```
message:new
presence:update
typing:start
typing:stop
```

---

# Image Uploads

Bondly supports image uploads for:

- Profile pictures
- Cover banners
- Posts
- Chat messages

Images are uploaded directly from the user's device and stored as Base64 in MongoDB.

Maximum recommended image size:

```
4 MB
```

---

# Security

- JWT Authentication
- bcrypt password hashing
- Protected routes
- Request validation
- Image validation
- Secure environment variables

---

# Future Improvements

- Group chats
- Video calling
- Stories
- Post sharing with captions
- Email verification
- Password reset via email
- Push notifications
- Admin dashboard
- Progressive Web App (PWA)
- AI-powered content recommendations

---

# License

This project is intended for educational and personal development purposes.

---

# Author

**Navaneeth**

Bondly is a modern social media platform focused on connecting people through conversations, communities, and shared experiences.