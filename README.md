# Chat App Backend

VITE_API_BASE_URL=https://nexora-chat-backend.onrender.com

Backend for a real-time chat application built with **Node.js, Express.js, MongoDB, Socket.IO, and JWT authentication**.

The project is designed to support real-time messaging, user authentication, user profiles, media/file sharing, and email-based services.

---

## 🚀 Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — Backend framework
- **MongoDB** — Database
- **Mongoose** — MongoDB ODM
- **Socket.IO** — Real-time communication
- **JWT** — Authentication and authorization
- **bcrypt** — Password hashing and verification
- **Cloudinary** — Cloud storage for avatars, images, and files
- **Multer** — Handling multipart/form-data and file uploads
- **Nodemailer** — Email services
- **dotenv** — Environment variable management

---

## 📁 Project Structure

```text
chat-app-backend/
│
├── src/
│   ├── config/
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   └── ...
│   │
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── uploadMiddleware.js
│   │   └── ...
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Message.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   └── ...
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── emailService.js
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── password.js
│   │   └── ...
│   │
│   ├── socket/
│   │   └── socket.js
│   │
│   └── app.js
│
├── .env
├── .gitignore
├── package.json
├── server.js
└── README.md
```

> The exact folder structure may change as the application grows.

---

# 🔐 Authentication

The application uses **JWT-based authentication**.

### Authentication Flow

1. User registers an account.
2. Password is hashed using `bcrypt`.
3. User logs in with email/username and password.
4. Server verifies the credentials.
5. Server generates a JWT token.
6. Client sends the token with protected API requests.
7. Authentication middleware verifies the token.
8. Authenticated user information is attached to `req.user`.

Protected routes can then access the authenticated user using:

```js
req.user;
```

---

# 👤 User Management

The application supports user-related functionality such as:

- User registration
- User login
- Get current authenticated user
- Update profile
- Update avatar
- Forgot password
- Reset password
- Email verification
- User status
- Last seen
- Friend management
- Blocked users

Only the fields required by the frontend should be returned from user APIs.

Sensitive fields such as password hashes and password reset tokens should never be exposed in API responses.

---

# 💬 Real-Time Chat

Real-time communication is handled using **Socket.IO**.

The Socket.IO layer is responsible for features such as:

- Connecting users to the real-time server
- Sending messages in real time
- Receiving messages in real time
- Online/offline status
- Last seen status
- Typing indicators
- Read/delivered message status

The exact socket events should be documented here as the project grows.

Example:

```text
Client
   │
   │  Socket.IO Connection
   ▼
Socket Server
   │
   ├── User Online
   ├── Send Message
   ├── Receive Message
   ├── Typing
   ├── Message Delivered
   └── Message Read
```

---

# ☁️ Cloudinary Storage

**Cloudinary** is used for storing user-uploaded media.

Currently, it is used for:

- User avatars
- Chat images
- Chat files

### Upload Flow

```text
Client
   │
   │ Upload File
   ▼
Multer
   │
   │ Process Multipart Data
   ▼
Backend
   │
   │ Upload
   ▼
Cloudinary
   │
   │ Return URL + Public ID
   ▼
MongoDB
```

The database stores the Cloudinary information required to access or manage the uploaded file.

Example avatar structure:

```js
avatar: {
  url: String,
  publicId: String
}
```

The `publicId` is important when a file needs to be deleted or replaced from Cloudinary.

---

# 📧 Email Services

**Nodemailer** is used for sending emails.

It can be used for:

- Email verification
- Forgot password emails
- Password reset emails
- Other application-related notifications

### Password Reset Flow

```text
User requests forget password
          │
          ▼
Generate reset token
          │
          ▼
Store token + expiry
          │
          ▼
Send reset link using Nodemailer
          │
          ▼
User opens reset link
          │
          ▼
Submit new password
          │
          ▼
Verify token and expiry
          │
          ▼
Hash new password
          │
          ▼
Update user password
          │
          ▼
Clear reset token
```

---

# 🗄️ Database

The application uses **MongoDB** with **Mongoose**.

Main database entities may include:

- `User`
- `Conversation`
- `Message`
- `Friend`
- `Notification`

The database structure should be updated in this README whenever a new major model is added.

---

# 🔑 Environment Variables

Create a `.env` file in the root directory.

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_token_expiry

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASSWORD=your_email_password
```

> Never commit `.env` files or secret keys to Git.

---

# ⚙️ Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate to the project:

```bash
cd chat-app-backend
```

Install dependencies:

```bash
npm install
```

Create the `.env` file and add the required environment variables.

Start the development server:

```bash
npm run dev
```

Start the production server:

```bash
npm start
```

---

# 🔄 Application Architecture

The backend generally follows this flow:

```text
Client
  │
  ▼
Routes
  │
  ▼
Middleware
  │
  ▼
Controller
  │
  ▼
Service
  │
  ▼
Model
  │
  ▼
MongoDB
```

For real-time functionality:

```text
Client
  │
  │ Socket.IO
  ▼
Socket Server
  │
  ├── Authentication
  ├── Real-Time Events
  └── Message Events
```

### Responsibilities

**Routes**

- Define API endpoints.
- Connect requests to controllers.

**Middleware**

- Authentication
- Authorization
- File uploads
- Validation
- Error handling

**Controllers**

- Handle HTTP requests and responses.
- Validate request-level data.
- Call services.

**Services**

- Contain business logic.
- Interact with models and external services.

**Models**

- Define MongoDB schemas.
- Handle database-level operations.

**Socket**

- Handle real-time communication and events.

---

# 🛡️ Security Considerations

The application should follow these security practices:

- Hash passwords using `bcrypt`.
- Never return password hashes in API responses.
- Never expose JWT secrets.
- Keep environment variables in `.env`.
- Validate user input.
- Protect private routes with authentication middleware.
- Validate uploaded files.
- Restrict allowed file types and file sizes.
- Never expose password reset tokens in API responses.

---

# 📌 Important Development Notes

Keep this section updated whenever an important architectural decision is made.

### Current Decisions

- JWT is used for user authentication.
- MongoDB is used as the primary database.
- Socket.IO is used for real-time communication.
- Cloudinary is used for media and file storage.
- Nodemailer is used for email services.
- Multer is used to process file uploads.
- Passwords are hashed before storing them in the database.

---

# 🧪 Future Improvements

Possible features to add:

- [ ] One-to-one chat
- [ ] Group chat
- [ ] Message reactions
- [ ] Message replies
- [ ] Message editing
- [ ] Message deletion
- [ ] Typing indicators
- [ ] Online/offline presence
- [ ] Delivered/read status
- [ ] Push notifications
- [ ] Redis for caching
- [ ] Redis adapter for Socket.IO scaling
- [ ] Background jobs
- [ ] Message queues
- [ ] API rate limiting
- [ ] Request validation
- [ ] Automated testing
- [ ] Logging and monitoring

---

# 📝 API Documentation

API endpoints should be documented here as the project grows.

Example:

| Method | Endpoint                          | Authentication | Description            |
| ------ | --------------------------------- | -------------- | ---------------------- |
| POST   | `/api/auth/register`              | No             | Register a new user    |
| POST   | `/api/auth/login`                 | No             | Login user             |
| GET    | `/api/auth/me`                    | Yes            | Get current(Own) user  |
| POST   | `/api/auth/forgot-password`       | No             | Request password reset |
| POST   | `/api/auth/reset-password/:token` | No             | Reset password         |

Update this table whenever a new API is added.

---

# 📂 File Storage

| File Type   | Storage    |
| ----------- | ---------- |
| User Avatar | Cloudinary |
| Chat Images | Cloudinary |
| Chat Files  | Cloudinary |
| Other Media | Cloudinary |

---

# 📈 Project Status

The project is currently under active development.

The architecture and features may change as new chat functionality is implemented.

---

## 👨‍💻 Developer Notes

This README is intended to provide a quick overview of the backend architecture, technologies, data flow, and important implementation decisions.

When adding a major feature, update the following sections:

1. Tech Stack
2. Project Structure
3. API Documentation
4. Database Models
5. Socket Events
6. Environment Variables
7. Important Development Notes
8. Future Improvements

This will make it easier to understand and maintain the project in the future.
