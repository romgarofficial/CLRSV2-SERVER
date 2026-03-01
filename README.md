# CLRS Backend Server

A robust MERN stack backend server built with Express.js, MongoDB, and modern Node.js practices.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
SERVER/
├── config/
│   └── db.js              # Database configuration
├── controllers/
│   └── authController.js  # Authentication controllers
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling middleware
│   └── upload.js         # File upload middleware
├── models/
│   └── User.js           # User model schema
├── routes/
│   ├── authRoutes.js     # Authentication routes
│   └── userRoutes.js     # User routes
├── uploads/              # File upload directory (gitignored)
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore file
├── package.json         # Dependencies and scripts
├── README.md           # Project documentation
└── server.js           # Main server file
```

## 🛠️ Dependencies

- **express** - Web framework for Node.js
- **mongoose** - MongoDB object modeling
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable loader
- **multer** - File upload handling
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation/verification
- **morgan** - HTTP request logger

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user (Admin only)
- `PUT /api/users/:id` - Update user (Protected)
- `DELETE /api/users/:id` - Delete user (Admin only)

### General
- `GET /` - Welcome message
- `GET /health` - Health check

## 🔒 Authentication

This server uses JWT (JSON Web Tokens) for authentication. Include the token in your requests:

```
Authorization: Bearer <your-token-here>
```

## 📝 Environment Variables

Copy `.env.example` to `.env` and configure:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration time

## 🗄️ Database

This project uses MongoDB. Make sure to:
1. Have MongoDB installed locally, or
2. Use MongoDB Atlas cloud database
3. Update `MONGODB_URI` in your `.env` file

## 📁 File Uploads

File uploads are handled by Multer and stored in the `uploads/` directory:
- Maximum file size: 10MB
- Allowed types: images, PDFs, documents
- Files are automatically renamed with timestamps

## 🚨 Error Handling

The server includes comprehensive error handling:
- Mongoose validation errors
- JWT authentication errors
- File upload errors
- Custom API errors
- Development vs production error responses

## 🔧 Development

For development, the server includes:
- Request logging with Morgan
- Detailed error messages
- Auto-restart with Nodemon (install globally: `npm i -g nodemon`)

## 📦 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with Nodemon
- `npm test` - Run tests (not implemented yet)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.
