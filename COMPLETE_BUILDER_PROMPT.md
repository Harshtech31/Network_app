# 🚀 NetworkX - Complete Builder Prompt

## 📋 Project Overview

Create a comprehensive social networking platform called **NetworkX** for students, alumni, and faculty with real-time features, end-to-end encryption, and a modern mobile-first design. This is a full-stack application with React Native frontend and Node.js backend.

## 🎯 Core Application Features

### 1. **Authentication System**
- **User Registration**: Multi-step signup with email verification
- **Login System**: JWT-based authentication with secure token management
- **OTP Verification**: Email-based OTP for account verification
- **Password Management**: Forgot password and reset functionality
- **Role-based Access**: Student, Alumni, Teacher roles with different permissions
- **Campus Integration**: Support for multiple BITS Pilani campuses (Pilani, Goa, Hyderabad, Dubai)

### 2. **Social Networking Features**
- **Posts**: Create, edit, delete posts with media support
- **Feed**: Personalized content feed with real-time updates
- **Interactions**: Like, comment, share functionality
- **Stories**: Temporary story posts (24-hour expiry)
- **Connections**: Follow/unfollow users, friend requests
- **Profile Management**: Comprehensive user profiles with academic info

### 3. **Collaboration Platform**
- **Projects**: Create and manage collaborative projects
- **Clubs**: University club management with membership system
- **Events**: Event creation, RSVP, and attendance tracking
- **Groups**: Private and public group discussions
- **Collaborations**: Team formation for academic/professional projects

### 4. **Communication System**
- **Real-time Messaging**: End-to-end encrypted chat system
- **Notifications**: Push notifications for all activities
- **Presence System**: Online/offline status tracking
- **Typing Indicators**: Real-time typing status in chats

### 5. **Advanced Features**
- **Search**: Advanced search across users, posts, projects, clubs, events
- **Leaderboard**: Gamification with points and rankings
- **Bookmarks**: Save posts and content for later
- **Analytics**: User engagement and activity analytics
- **Admin Dashboard**: Comprehensive admin panel for platform management

## 🏗️ Technical Architecture

### **Frontend Stack (React Native/Expo)**
```json
{
  "framework": "React Native with Expo SDK 53",
  "navigation": "Expo Router with file-based routing",
  "state_management": "React Context API + useReducer",
  "styling": "StyleSheet with custom components",
  "ui_components": "Custom UI library with Ionicons",
  "animations": "React Native Animated API + Expo Haptics",
  "storage": "AsyncStorage for local data persistence",
  "networking": "Fetch API with custom service layer"
}
```

### **Backend Stack (Node.js)**
```json
{
  "runtime": "Node.js 16+",
  "framework": "Express.js",
  "realtime": "Socket.IO with JWT authentication",
  "databases": {
    "primary": "MongoDB with Mongoose ODM",
    "scalable": "AWS DynamoDB for posts/messages",
    "cache": "Redis for sessions and real-time data"
  },
  "authentication": "JWT with bcrypt password hashing",
  "encryption": "AES-256-GCM with RSA-2048 key exchange",
  "file_storage": "AWS S3 with multer middleware",
  "validation": "express-validator",
  "security": "Helmet, CORS, rate limiting"
}
```

## 📱 Frontend Implementation Details

### **Project Structure**
```
frontend/
├── app/                          # Expo Router pages
│   ├── (tabs)/                   # Tab navigation screens
│   │   ├── index.tsx            # Main feed screen
│   │   ├── explore.tsx          # Explore/search screen
│   │   ├── create.tsx           # Create content screen
│   │   ├── notifications.tsx    # Notifications screen
│   │   └── profile.tsx          # User profile screen
│   ├── chat/                    # Chat-related screens
│   ├── LoginScreen.tsx          # Authentication screens
│   ├── SignUpScreen.tsx
│   ├── OTPVerificationScreen.tsx
│   ├── ForgotPasswordScreen.tsx
│   ├── CreatePostScreen.tsx     # Content creation screens
│   ├── CreateProjectScreen.tsx
│   ├── CreateClubScreen.tsx
│   ├── CreateEventScreen.tsx
│   ├── ProjectDetailScreen.tsx  # Detail view screens
│   ├── ClubDetailScreen.tsx
│   ├── EventDetailScreen.tsx
│   ├── UserProfileScreen.tsx
│   ├── NotificationsScreen.tsx
│   ├── ConnectionsScreen.tsx
│   ├── SavedScreen.tsx
│   ├── LeaderboardScreen.tsx
│   └── _layout.tsx              # Root layout with AuthProvider
├── components/                   # Reusable components
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   ├── PostDetailModal.tsx
│   ├── ProfileCard.tsx
│   ├── ShareModal.tsx
│   └── ui/                      # UI components
├── contexts/                     # React contexts
│   ├── AuthContext.tsx          # Authentication state management
│   └── ThemeContext.tsx
├── utils/                        # Utility services
│   ├── apiConfig.ts             # Environment-based API configuration
│   ├── apiService.ts            # HTTP client with interceptors
│   ├── authService.ts           # Authentication service
│   ├── linkService.ts           # Deep linking service
│   └── ShareService.ts          # Social sharing utilities
├── constants/                    # App constants
├── hooks/                        # Custom React hooks
├── types/                        # TypeScript type definitions
└── assets/                       # Static assets
```

### **Key Frontend Features Implementation**

#### **Authentication Flow**
```typescript
// AuthContext with comprehensive state management
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{success: boolean; error?: string}>;
  register: (userData: RegisterData) => Promise<{success: boolean; error?: string}>;
  logout: () => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<{success: boolean; error?: string}>;
  forgotPassword: (email: string) => Promise<{success: boolean; error?: string}>;
  resetPassword: (token: string, password: string) => Promise<{success: boolean; error?: string}>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}
```

#### **API Service Layer**
```typescript
// Centralized API service with automatic token management
class ApiService {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  
  async request<T>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>>;
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  async delete<T>(endpoint: string): Promise<ApiResponse<T>>;
  async uploadFile<T>(endpoint: string, file: any, additionalData?: Record<string, any>): Promise<ApiResponse<T>>;
}
```

#### **Complex UI Components**
- **Feed Screen**: Infinite scroll with pull-to-refresh, real-time updates
- **SignUp Screen**: Multi-step form with campus selection, role-based fields
- **Post Creation**: Rich text editor with media upload, location tagging
- **Chat Interface**: Real-time messaging with typing indicators
- **Profile Screen**: Comprehensive user profiles with academic information

### **Navigation Structure**
```typescript
// Tab-based navigation with nested stacks
(tabs)/
├── index (Feed)
├── explore (Search & Discovery)
├── create (Content Creation Hub)
├── notifications (Activity Feed)
└── profile (User Profile)

// Modal screens for detailed views
- PostDetail
- UserProfile
- ProjectDetail
- ClubDetail
- EventDetail
- Chat screens
```

## 🔧 Backend Implementation Details

### **Project Structure**
```
backend/
├── src/
│   ├── config/                   # Configuration files
│   │   ├── mongodb.js           # MongoDB connection
│   │   ├── redis.js             # Redis configuration
│   │   ├── aws.js               # AWS services setup
│   │   └── socket.js            # Socket.IO configuration
│   ├── models/                   # Data models
│   │   ├── mongodb/             # MongoDB models
│   │   │   ├── User.js
│   │   │   ├── Post.js
│   │   │   ├── Project.js
│   │   │   ├── Club.js
│   │   │   ├── Event.js
│   │   │   └── Message.js
│   │   └── index.js             # Model exports
│   ├── routes/                   # API endpoints
│   │   ├── auth.js              # Authentication routes
│   │   ├── posts.js             # Post management
│   │   ├── projects.js          # Project management
│   │   ├── clubs.js             # Club management
│   │   ├── events.js            # Event management
│   │   ├── messages.js          # Messaging system
│   │   ├── notifications.js     # Notification system
│   │   ├── users.js             # User management
│   │   ├── search.js            # Search functionality
│   │   ├── feed.js              # Content feed
│   │   ├── analytics.js         # Analytics endpoints
│   │   ├── admin.js             # Admin dashboard
│   │   └── upload.js            # File upload handling
│   ├── middleware/               # Custom middleware
│   ├── services/                 # Business logic services
│   ├── utils/                    # Utility functions
│   └── scripts/                  # Database setup scripts
├── server.js                     # Main server file
├── package.json                  # Dependencies
└── .env.example                  # Environment variables template
```

### **API Endpoints Specification**

#### **Authentication Routes (`/api/auth`)**
```javascript
POST /register          // User registration with validation
POST /login             // User authentication
POST /forgot-password   // Password reset request
POST /reset-password    // Password reset with token
POST /verify-otp        // Email OTP verification
POST /upload-profile-image // Profile image upload
GET  /                  // Auth status check
```

#### **Posts Routes (`/api/posts`)**
```javascript
GET    /                // Get all posts with pagination
POST   /                // Create new post
GET    /:id             // Get specific post
PUT    /:id             // Update post
DELETE /:id             // Delete post
POST   /:id/like        // Like/unlike post
POST   /:id/comment     // Add comment to post
GET    /:id/comments    // Get post comments
```

#### **Projects Routes (`/api/projects`)**
```javascript
GET    /                // Get all projects
POST   /                // Create new project
GET    /:id             // Get specific project
PUT    /:id             // Update project
DELETE /:id             // Delete project
POST   /:id/join        // Join project
POST   /:id/leave       // Leave project
GET    /:id/members     // Get project members
```

#### **Clubs Routes (`/api/clubs`)**
```javascript
GET    /                // Get all clubs
POST   /                // Create new club
GET    /:id             // Get specific club
PUT    /:id             // Update club
DELETE /:id             // Delete club
POST   /:id/join        // Join club
POST   /:id/leave       // Leave club
GET    /:id/members     // Get club members
GET    /:id/events      // Get club events
```

#### **Events Routes (`/api/events`)**
```javascript
GET    /                // Get all events
POST   /                // Create new event
GET    /:id             // Get specific event
PUT    /:id             // Update event
DELETE /:id             // Delete event
POST   /:id/register    // Register for event
POST   /:id/unregister  // Unregister from event
GET    /:id/attendees   // Get event attendees
```

#### **Messages Routes (`/api/messages`)**
```javascript
GET    /conversations   // Get user conversations
POST   /send            // Send message
GET    /:conversationId // Get conversation messages
PUT    /:messageId/read // Mark message as read
DELETE /:messageId      // Delete message
```

#### **Additional Routes**
- **Notifications** (`/api/notifications`): Real-time notification management
- **Search** (`/api/search`): Advanced search across all content
- **Feed** (`/api/feed`): Personalized content feed
- **Users** (`/api/users`): User profile management
- **Analytics** (`/api/analytics`): User engagement analytics
- **Admin** (`/api/admin`): Administrative functions

### **Real-time Features (Socket.IO)**
```javascript
// Socket events
'user:online'           // User comes online
'user:offline'          // User goes offline
'message:new'           // New message received
'message:typing'        // User typing indicator
'notification:new'      // New notification
'post:liked'            // Post liked in real-time
'post:commented'        // New comment on post
'project:updated'       // Project status update
'event:reminder'        // Event reminder
```

### **Database Schema**

#### **MongoDB Collections**
```javascript
// Users Collection
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  profileImage: String,
  department: String,
  year: Number,
  role: String, // 'student', 'alumni', 'teacher'
  campus: String,
  isVerified: Boolean,
  lastActive: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### **DynamoDB Tables**
```javascript
// Posts Table
{
  id: String (Primary Key),
  userId: String,
  content: String,
  media: [String],
  likes: Number,
  comments: Number,
  shares: Number,
  createdAt: String,
  updatedAt: String
}

// Messages Table (Encrypted)
{
  id: String (Primary Key),
  conversationId: String,
  senderId: String,
  receiverId: String,
  encryptedContent: String,
  messageType: String,
  isRead: Boolean,
  createdAt: String
}
```

## 🎨 UI/UX Design Specifications

### **Design System**
```typescript
// Color Palette
const Colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8'
};

// Typography
const Typography = {
  largeTitle: { fontSize: 34, fontWeight: 'bold' },
  title1: { fontSize: 28, fontWeight: 'bold' },
  title2: { fontSize: 22, fontWeight: 'bold' },
  title3: { fontSize: 20, fontWeight: '600' },
  headline: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 17, fontWeight: '400' },
  callout: { fontSize: 16, fontWeight: '400' },
  subhead: { fontSize: 15, fontWeight: '400' },
  footnote: { fontSize: 13, fontWeight: '400' },
  caption1: { fontSize: 12, fontWeight: '400' },
  caption2: { fontSize: 11, fontWeight: '400' }
};
```

### **Screen Designs**

#### **Login/SignUp Screens**
- Modern gradient backgrounds
- Floating input fields with validation
- Campus-specific branding
- Role-based form fields
- OTP verification with timer
- Biometric authentication support

#### **Main Feed Screen**
- Instagram-like post cards
- Pull-to-refresh functionality
- Infinite scroll with loading states
- Story carousel at top
- Floating action button for quick actions
- Real-time like/comment animations

#### **Profile Screens**
- Cover photo with profile picture overlay
- Academic information display
- Achievement badges and statistics
- Tabbed content (Posts, Projects, Clubs)
- Connection/follower counts
- Edit profile modal

#### **Chat Interface**
- WhatsApp-inspired message bubbles
- Typing indicators with user avatars
- Message status indicators (sent/delivered/read)
- Media sharing capabilities
- Voice message support
- End-to-end encryption indicators

## 🔐 Security Implementation

### **Authentication Security**
```javascript
// JWT Configuration
{
  secret: process.env.JWT_SECRET,
  expiresIn: '7d',
  algorithm: 'HS256',
  issuer: 'networkx-api',
  audience: 'networkx-app'
}

// Password Security
{
  saltRounds: 12,
  minLength: 6,
  requireSpecialChars: false,
  requireNumbers: true
}
```

### **End-to-End Encryption**
```javascript
// Message Encryption
{
  algorithm: 'aes-256-gcm',
  keyExchange: 'rsa-2048',
  keyRotation: '30d',
  authTagLength: 16
}
```

### **API Security**
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention
- XSS protection

## 📦 Dependencies & Packages

### **Frontend Dependencies**
```json
{
  "expo": "~53.0.22",
  "react": "19.0.0",
  "react-native": "0.79.6",
  "expo-router": "5.1.6",
  "@react-native-async-storage/async-storage": "2.1.2",
  "@react-navigation/native": "^7.1.17",
  "@react-navigation/bottom-tabs": "^7.4.7",
  "expo-linear-gradient": "^14.1.5",
  "expo-image-picker": "^16.1.4",
  "expo-haptics": "~14.1.4",
  "expo-linking": "~7.1.7",
  "expo-web-browser": "~14.2.0",
  "react-native-vector-icons": "^10.3.0",
  "react-native-calendars": "^1.1313.0",
  "react-native-webview": "13.13.5"
}
```

### **Backend Dependencies**
```json
{
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "socket.io": "^4.7.5",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "aws-sdk": "^2.1691.0",
  "redis": "^4.6.10",
  "cors": "^2.8.5",
  "helmet": "^7.1.0",
  "express-rate-limit": "^6.10.0",
  "express-validator": "^7.0.1",
  "multer": "^1.4.5-lts.1",
  "multer-s3": "^3.0.1",
  "nodemailer": "^6.9.7",
  "winston": "^3.10.0",
  "compression": "^1.7.4",
  "morgan": "^1.10.0"
}
```

## 🚀 Deployment Configuration

### **Frontend Deployment (Expo/EAS)**
```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}

// app.json production config
{
  "expo": {
    "name": "NetworkX",
    "slug": "networkx",
    "version": "1.0.0",
    "android": {
      "package": "com.networkcl.app",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### **Backend Deployment**
```bash
# Environment Variables
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/networkx
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=networkx-media-storage

# DynamoDB Tables
DYNAMODB_POSTS_TABLE=networkx-posts
DYNAMODB_PROJECTS_TABLE=networkx-projects
DYNAMODB_CLUBS_TABLE=networkx-clubs
DYNAMODB_EVENTS_TABLE=networkx-events
DYNAMODB_MESSAGES_TABLE=networkx-messages
DYNAMODB_NOTIFICATIONS_TABLE=networkx-notifications

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## 🧪 Testing Strategy

### **Frontend Testing**
```typescript
// Unit Tests
- Component rendering tests
- Hook functionality tests
- Utility function tests
- API service tests

// Integration Tests
- Authentication flow tests
- Navigation tests
- API integration tests
- State management tests

// E2E Tests
- User registration flow
- Login/logout flow
- Post creation and interaction
- Chat functionality
- Profile management
```

### **Backend Testing**
```javascript
// Unit Tests
- Model validation tests
- Utility function tests
- Middleware tests
- Service layer tests

// Integration Tests
- API endpoint tests
- Database operation tests
- Authentication tests
- Socket.IO tests

// Load Tests
- Concurrent user tests
- Database performance tests
- API response time tests
- Memory usage tests
```

## 📚 Additional Features & Integrations

### **External Integrations**
- **ERP Portal Integration**: Direct link to BITS Pilani ERP system
- **Email Services**: Nodemailer for OTP and notifications
- **Push Notifications**: Expo push notification service
- **Deep Linking**: Custom URL scheme for app navigation
- **Social Sharing**: Native sharing capabilities

### **Advanced Features**
- **Offline Support**: Local data caching and sync
- **Dark Mode**: Complete dark theme support
- **Internationalization**: Multi-language support
- **Accessibility**: Screen reader and accessibility features
- **Performance Monitoring**: Real-time performance tracking
- **Analytics**: User behavior and engagement tracking

## 🎯 Development Workflow

### **Setup Instructions**
1. **Clone and Setup**
   ```bash
   # Frontend
   cd frontend
   npm install
   expo install
   
   # Backend
   cd backend
   npm install
   npm run setup
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment files
   cp .env.example .env
   # Update with your credentials
   ```

3. **Database Setup**
   ```bash
   # MongoDB setup
   npm run init-db
   
   # AWS DynamoDB setup
   node setup-aws-resources.js
   ```

4. **Development Server**
   ```bash
   # Backend
   npm run dev
   
   # Frontend
   expo start
   ```

### **Build Process**
```bash
# Frontend APK Build
eas build --platform android --profile preview

# Backend Production Build
npm run build
npm start
```

## 🏆 Success Criteria

### **Functional Requirements**
- ✅ Complete user authentication system
- ✅ Real-time messaging with encryption
- ✅ Social networking features (posts, likes, comments)
- ✅ Project and club management
- ✅ Event creation and management
- ✅ Advanced search functionality
- ✅ Push notifications
- ✅ File upload and media sharing
- ✅ Admin dashboard
- ✅ Analytics and reporting

### **Technical Requirements**
- ✅ Scalable architecture (MongoDB + DynamoDB)
- ✅ Real-time capabilities (Socket.IO)
- ✅ Security implementation (JWT + encryption)
- ✅ Mobile-responsive design
- ✅ API documentation
- ✅ Error handling and logging
- ✅ Performance optimization
- ✅ Testing coverage

### **User Experience Requirements**
- ✅ Intuitive navigation
- ✅ Fast loading times
- ✅ Offline capabilities
- ✅ Accessibility compliance
- ✅ Cross-platform compatibility
- ✅ Modern UI/UX design

## 📝 Final Notes

This NetworkX application is a comprehensive social networking platform specifically designed for educational institutions. It combines modern mobile development practices with robust backend architecture to deliver a scalable, secure, and feature-rich experience.

The application successfully integrates:
- **Frontend**: React Native/Expo with TypeScript
- **Backend**: Node.js/Express with MongoDB and DynamoDB
- **Real-time**: Socket.IO for live features
- **Security**: End-to-end encryption and JWT authentication
- **Cloud**: AWS services for storage and scalability

**Key Differentiators:**
- Campus-specific features and branding
- End-to-end encrypted messaging
- Real-time collaboration tools
- Comprehensive admin dashboard
- Advanced analytics and reporting
- Mobile-first responsive design

This prompt provides all necessary information to recreate the exact same application with identical features, architecture, and functionality.
