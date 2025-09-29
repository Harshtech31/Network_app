const serverlessExpress = require('@vendia/serverless-express');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import database connections (Lambda-compatible)
const { connectDB } = require('./src/config/mongodb-lambda');
const { connectRedis } = require('./src/config/redis');

// Set Lambda environment variable early
process.env.AWS_LAMBDA_FUNCTION_NAME = 'true';

let serverlessExpressInstance;
let isInitialized = false;

// Import all route modules
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const postRoutes = require('./src/routes/posts');
const projectRoutes = require('./src/routes/projects');
const clubRoutes = require('./src/routes/clubs');
const eventRoutes = require('./src/routes/events');
const messageRoutes = require('./src/routes/messages');
const notificationRoutes = require('./src/routes/notifications');
const collaborationRoutes = require('./src/routes/collaborations');
const feedRoutes = require('./src/routes/feed');
const searchRoutes = require('./src/routes/search');
const uploadRoutes = require('./src/routes/upload');
const keyRoutes = require('./src/routes/keys');
const reportRoutes = require('./src/routes/reports');
const bookmarkRoutes = require('./src/routes/bookmarks');
const emailRoutes = require('./src/routes/email');
const lambdaRoutes = require('./src/routes/lambda');
const realtimeRoutes = require('./src/routes/realtime');
const adminRoutes = require('./src/routes/admin');
const analyticsRoutes = require('./src/routes/analytics');
const healthRoutes = require('./src/routes/health');

async function createApp() {
  try {
    console.log('🚀 Creating Lambda-compatible Express app...');
    
    const app = express();

    // Security middleware
    app.use(helmet({
      contentSecurityPolicy: false, // Disable for Lambda
      crossOriginEmbedderPolicy: false
    }));
    
    app.use(cors({
      origin: '*', // Allow all origins for Lambda
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting (reduced for Lambda)
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Increased for Lambda bursts
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    app.use('/api/', limiter);

    // Body parsing middleware
    app.use(compression());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Simplified logging for Lambda
    if (process.env.NODE_ENV !== 'production') {
      app.use(morgan('combined'));
    }

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'staging',
        lambda: true,
        initialized: isInitialized
      });
    });

    // API info endpoint
    app.get('/api', (req, res) => {
      res.json({
        message: 'Final Network API - Lambda Version',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'staging',
        features: [
          'Authentication & Authorization',
          'User Profiles & Search',
          'Posts & Feed',
          'Projects & Collaborations',
          'Events & Clubs',
          'Real-time Messaging',
          'Notifications',
          'File Upload',
          'Analytics & Reports',
          'Admin Panel'
        ],
        endpoints: {
          auth: '/api/auth/*',
          users: '/api/users/*',
          posts: '/api/posts/*',
          projects: '/api/projects/*',
          clubs: '/api/clubs/*',
          events: '/api/events/*',
          messages: '/api/messages/*',
          search: '/api/search/*',
          feed: '/api/feed/*',
          upload: '/api/upload/*',
          notifications: '/api/notifications/*',
          collaborations: '/api/collaborations/*',
          bookmarks: '/api/bookmarks/*',
          reports: '/api/reports/*',
          analytics: '/api/analytics/*',
          admin: '/api/admin/*',
          health: '/health'
        }
      });
    });

    // API Routes - All the comprehensive routes from the GitHub repo
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/events', eventRoutes);
    app.use('/api/posts', postRoutes);
    app.use('/api/clubs', clubRoutes);
    app.use('/api/projects', projectRoutes);
    app.use('/api/collaborations', collaborationRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/search', searchRoutes);
    app.use('/api/feed', feedRoutes);
    app.use('/api/upload', uploadRoutes);
    app.use('/api/realtime', realtimeRoutes);
    app.use('/api/keys', keyRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/bookmarks', bookmarkRoutes);
    app.use('/api/email', emailRoutes);
    app.use('/api/push', require('./src/routes/push'));
    app.use('/api/lambda', lambdaRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/analytics', analyticsRoutes);
    app.use('/health', healthRoutes);

    // Add leaderboard endpoint (missing from the original)
    app.get('/api/leaderboard', async (req, res) => {
      try {
        console.log('🏆 Get leaderboard:', req.query.type);
        
        const User = require('./src/models/mongodb/User');
        const type = req.query.type || 'posts';
        const limit = parseInt(req.query.limit) || 50;
        
        let sortField;
        switch (type) {
          case 'connections':
            sortField = 'connectionsCount';
            break;
          case 'projects':
            sortField = 'projectsCount';
            break;
          case 'posts':
          default:
            sortField = 'postsCount';
            break;
        }
        
        // Get users sorted by the specified metric
        const users = await User.find({})
          .select('firstName lastName username profileImage department year postsCount connectionsCount projectsCount rating isVerified')
          .sort({ [sortField]: -1, rating: -1 })
          .limit(limit)
          .lean();
        
        // Add rank to users
        const leaderboard = users.map((user, index) => ({
          ...user,
          rank: index + 1,
          score: user[sortField] || 0
        }));
        
        res.json({
          success: true,
          data: {
            leaderboard,
            type
          }
        });
      } catch (error) {
        console.error('❌ Error getting leaderboard:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get leaderboard'
        });
      }
    });

    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableEndpoints: '/api'
      });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('❌ Global error:', err.stack);
      
      if (err.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: err.message,
          details: err.errors
        });
      }
      
      if (err.name === 'MongoError' || err.name === 'MongooseError') {
        return res.status(500).json({
          success: false,
          error: 'Database Error',
          message: process.env.NODE_ENV === 'production' ? 'Database operation failed' : err.message
        });
      }
      
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Authentication Error',
          message: 'Invalid token'
        });
      }
      
      res.status(err.status || 500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
      });
    });

    console.log('✅ Express app created successfully');
    return app;
    
  } catch (error) {
    console.error('❌ Error creating app:', error);
    throw error;
  }
}

// Initialize database connections
async function initializeConnections() {
  if (isInitialized) {
    console.log('📦 Using existing database connections');
    return;
  }

  try {
    console.log('🔌 Initializing database connections for Lambda...');
    
    // Connect to MongoDB (DocumentDB)
    await connectDB();
    console.log('✅ MongoDB/DocumentDB connected');
    
    // Connect to Redis (ElastiCache)
    try {
      await connectRedis();
      console.log('✅ Redis connected');
    } catch (redisError) {
      console.warn('⚠️ Redis connection failed, continuing without cache:', redisError.message);
    }
    
    isInitialized = true;
    console.log('🎉 All database connections initialized');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    // Don't throw error - allow Lambda to start with limited functionality
    console.warn('⚠️ Starting Lambda with limited database functionality');
  }
}

// Lambda handler
exports.handler = async (event, context) => {
  try {
    console.log('🚀 Lambda handler invoked');
    
    // Set context to not wait for empty event loop
    context.callbackWaitsForEmptyEventLoop = false;
    
    if (!serverlessExpressInstance) {
      console.log('🔧 Creating new serverless express instance...');
      
      // Initialize database connections
      await initializeConnections();
      
      // Create Express app
      const app = await createApp();
      
      // Create serverless express instance
      serverlessExpressInstance = serverlessExpress({ app });
      
      console.log('✅ Serverless express instance created');
    }
    
    return serverlessExpressInstance(event, context);
    
  } catch (error) {
    console.error('❌ Lambda handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};
