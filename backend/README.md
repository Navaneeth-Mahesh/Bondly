# Bondly — Backend

Express.js + MongoDB + Socket.IO REST/real-time API. See the root `README.md`
(one level up) for full setup and deployment instructions.

## Quick start

```
npm install
cp .env.example .env   # paste your MongoDB Atlas URI + a JWT secret
npm run seed            # optional: populate demo data
npm run dev              # http://localhost:5000
```

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Log in |
| GET | /api/auth/me | required | Current user |
| GET | /api/users | optional | Search/list users |
| GET | /api/users/:username | optional | Get profile |
| PUT | /api/users/me | required | Update profile (name, bio, avatar, cover, etc.) |
| PUT | /api/users/me/preferences | required | Update theme/privacy/notification settings |
| PUT | /api/users/me/password | required | Change password |
| DELETE | /api/users/me | required | Delete account (cascades posts/comments/notifications) |
| POST | /api/users/:id/follow | required | Toggle follow |
| GET | /api/users/:id/followers | optional | Followers list |
| GET | /api/users/:id/following | optional | Following list |
| GET | /api/posts | optional | Feed (paginated) |
| GET | /api/posts/trending | optional | Trending posts |
| GET | /api/posts/saved | required | Saved posts |
| GET | /api/posts/liked | required | Liked posts |
| GET | /api/posts/user/:userId | optional | Posts by user |
| POST | /api/posts | required | Create post (content + optional image) |
| DELETE | /api/posts/:id | required | Delete own post |
| POST | /api/posts/:id/like | required | Toggle like |
| POST | /api/posts/:id/save | required | Toggle save |
| POST | /api/posts/:id/share | required | Increment share count |
| GET | /api/posts/:postId/comments | optional | Get comments (+ nested replies) |
| POST | /api/posts/:postId/comments | required | Add comment / reply |
| DELETE | /api/comments/:id | required | Delete own comment |
| POST | /api/comments/:id/like | required | Toggle comment like |
| GET | /api/notifications | required | Get notifications |
| PUT | /api/notifications/read-all | required | Mark all read |
| PUT | /api/notifications/:id/read | required | Mark one read |
| GET | /api/messages/conversations | required | List your conversations |
| POST | /api/messages/conversations | required | Start/get a conversation with a user |
| GET | /api/messages/conversations/:id/messages | required | Get messages in a conversation |
| POST | /api/messages/conversations/:id/messages | required | Send a message (text and/or image) |

All responses are JSON: `{ success: boolean, ...data }` or `{ success: false, message }` on error.

Authenticated routes expect `Authorization: Bearer <token>`.

## Real-time (Socket.IO)

Connect with `auth: { token }` in the socket handshake. Events:

- `message:new` (server -> client): a new message arrived in one of your conversations
- `presence:update` (server -> client): `{ userId, online }` — fires when any user connects/disconnects
- `typing:start` / `typing:stop` (client <-> server): `{ conversationId, toUserId }` to send, `{ conversationId, fromUserId }` received

## Image uploads

Avatars, covers, post images, and message images are accepted as either an
`http(s)://` URL or a base64 `data:image/...` URL (what the frontend sends when a
user picks a file from their device). The backend validates the format and caps
base64 payloads at ~4MB decoded size.
