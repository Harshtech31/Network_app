const serverlessExpress = require('@vendia/serverless-express');
const express = require('express');
const cors = require('cors');

// Set Lambda environment variable early
process.env.AWS_LAMBDA_FUNCTION_NAME = 'true';

let serverlessExpressInstance;

// Simple demo data
const currentUser = {
  id: 'user_demo',
  firstName: 'Demo',
  lastName: 'User',
  username: 'demo_user',
  email: 'demo@testapp.com',
  profileImage: null,
  department: 'Computer Science',
  year: 3,
  bio: 'Computer Science student passionate about technology and innovation.',
  skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  interests: ['AI/ML', 'Web Development', 'Mobile Apps'],
  postCount: 5,
  connectionCount: 12,
  projectCount: 3,
  isVerified: true,
  academic: {
    year: '3',
    major: 'Computer Science',
    gpa: '8.5'
  },
  contact: {
    email: 'demo@testapp.com',
    phone: '+91 9876543210',
    website: 'https://demo-portfolio.com',
    github: 'https://github.com/demo',
    linkedin: 'https://linkedin.com/in/demo'
  },
  projects: [],
  events: [],
  achievements: []
};

// Demo users for leaderboard and search
const allUsers = [
  currentUser,
  {
    id: 'user_alice',
    firstName: 'Alice',
    lastName: 'Johnson',
    username: 'alice_j',
    email: 'alice@testapp.com',
    department: 'Electronics',
    year: 2,
    bio: 'Electronics enthusiast with a passion for IoT and embedded systems.',
    skills: ['C++', 'Arduino', 'IoT', 'Circuit Design'],
    interests: ['Robotics', 'IoT', 'Hardware Design'],
    postCount: 8,
    connectionCount: 15,
    projectCount: 4,
    isVerified: true
  },
  {
    id: 'user_bob',
    firstName: 'Bob',
    lastName: 'Smith',
    username: 'bob_smith',
    email: 'bob@testapp.com',
    department: 'Mechanical',
    year: 4,
    bio: 'Mechanical engineering student interested in automotive and aerospace.',
    skills: ['CAD', 'SolidWorks', 'MATLAB', 'Python'],
    interests: ['Automotive', 'Aerospace', '3D Printing'],
    postCount: 6,
    connectionCount: 10,
    projectCount: 2,
    isVerified: false
  }
];

// Demo posts
const posts = [
  {
    id: 'post_1',
    userId: 'user_demo',
    content: 'Just finished working on a new React Native app! Excited to share it with everyone soon. 🚀',
    imageUrl: null,
    likes: ['user_alice', 'user_bob'],
    comments: [],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post_2',
    userId: 'user_alice',
    content: 'Working on an IoT project for smart home automation. The possibilities are endless! 💡',
    imageUrl: null,
    likes: ['user_demo'],
    comments: [],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

async function createApp() {
  try {
    console.log('🚀 Creating enhanced Express app for Lambda...');
    
    const app = express();
    
    // Basic middleware
    app.use(cors({
      origin: '*',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'staging',
        lambda: true,
        version: '2.0.0-enhanced'
      });
    });
    
    // API info endpoint
    app.get('/api', (req, res) => {
      res.json({
        message: 'Final Network API - Enhanced Version',
        version: '2.0.1',
        status: 'running',
        environment: process.env.NODE_ENV || 'staging',
        deployedAt: '2025-09-28T20:19:00Z',
        features: [
          'Authentication',
          'User Profiles',
          'Posts & Feed',
          'User Search',
          'Leaderboard',
          'Data Persistence Ready'
        ],
        endpoints: {
          auth: '/api/auth/*',
          users: '/api/users/*',
          posts: '/api/posts/*',
          search: '/api/users/search',
          leaderboard: '/api/leaderboard',
          health: '/health'
        }
      });
    });

    // Authentication endpoints
    app.post('/api/auth/login', (req, res) => {
      console.log('🔐 Login attempt:', req.body.email);
      
      if (req.body.email === 'demo@testapp.com' && req.body.password === 'demo123456') {
        res.json({
          success: true,
          message: 'Login successful',
          data: {
            user: currentUser,
            token: 'jwt_token_' + Date.now()
          }
        });
      } else {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    });

    app.post('/api/auth/register', (req, res) => {
      console.log('📝 Register user:', req.body.email);
      
      res.json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: 'user_' + Date.now(),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            username: req.body.username || req.body.email.split('@')[0]
          },
          token: 'jwt_token_' + Date.now()
        }
      });
    });

    app.post('/api/auth/verify-otp', (req, res) => {
      console.log('🔢 Verify OTP:', req.body.otp);
      
      if (req.body.otp && req.body.otp.length === 6) {
        res.json({
          success: true,
          message: 'OTP verified successfully',
          data: {
            verified: true,
            token: 'jwt_token_verified_' + Date.now()
          }
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid OTP'
        });
      }
    });

    // User profile endpoints
    app.get('/api/users/profile', (req, res) => {
      console.log('👤 Get user profile');
      res.json({
        success: true,
        data: { user: currentUser }
      });
    });

    app.put('/api/users/profile', (req, res) => {
      console.log('✏️ Update user profile:', req.body);
      
      // Update the user data
      Object.assign(currentUser, {
        firstName: req.body.firstName || currentUser.firstName,
        lastName: req.body.lastName || currentUser.lastName,
        username: req.body.username || currentUser.username,
        bio: req.body.bio || currentUser.bio,
        skills: req.body.skills || currentUser.skills,
        interests: req.body.interests || currentUser.interests,
        academic: {
          ...currentUser.academic,
          ...req.body.academic
        },
        contact: {
          ...currentUser.contact,
          ...req.body.contact
        }
      });
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: currentUser }
      });
    });

    // User search endpoint
    app.get('/api/users/search', (req, res) => {
      console.log('🔍 Search users:', req.query);
      
      const { q, department, year, skills } = req.query;
      let filteredUsers = [...allUsers];
      
      // Text search
      if (q) {
        const query = q.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.firstName.toLowerCase().includes(query) ||
          user.lastName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.bio.toLowerCase().includes(query) ||
          user.skills.some(skill => skill.toLowerCase().includes(query))
        );
      }
      
      // Department filter
      if (department) {
        filteredUsers = filteredUsers.filter(user => 
          user.department.toLowerCase() === department.toLowerCase()
        );
      }
      
      // Year filter
      if (year) {
        filteredUsers = filteredUsers.filter(user => 
          user.year.toString() === year.toString()
        );
      }
      
      // Remove sensitive data
      const publicUsers = filteredUsers.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImage: user.profileImage,
        department: user.department,
        year: user.year,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        postCount: user.postCount,
        connectionCount: user.connectionCount,
        isVerified: user.isVerified
      }));
      
      res.json({
        success: true,
        data: { users: publicUsers }
      });
    });

    // Posts endpoints
    app.get('/api/posts', (req, res) => {
      console.log('📝 Get posts feed');
      
      const postsWithUsers = posts.map(post => {
        const user = allUsers.find(u => u.id === post.userId);
        return {
          ...post,
          user: user ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profileImage: user.profileImage,
            department: user.department
          } : null
        };
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      res.json({
        success: true,
        data: { posts: postsWithUsers }
      });
    });

    app.post('/api/posts', (req, res) => {
      console.log('📝 Create post:', req.body);
      
      const newPost = {
        id: 'post_' + Date.now(),
        userId: currentUser.id,
        content: req.body.content,
        imageUrl: req.body.imageUrl || null,
        likes: [],
        comments: [],
        createdAt: new Date().toISOString()
      };
      
      posts.unshift(newPost);
      currentUser.postCount++;
      
      res.json({
        success: true,
        message: 'Post created successfully',
        data: { post: newPost }
      });
    });

    app.post('/api/posts/:postId/like', (req, res) => {
      console.log('👍 Like post:', req.params.postId);
      
      const post = posts.find(p => p.id === req.params.postId);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      const userId = currentUser.id;
      const isLiked = post.likes.includes(userId);
      
      if (isLiked) {
        post.likes = post.likes.filter(id => id !== userId);
      } else {
        post.likes.push(userId);
      }
      
      res.json({
        success: true,
        data: {
          likes: post.likes.length,
          isLiked: !isLiked
        }
      });
    });

    // Leaderboard endpoint
    app.get('/api/leaderboard', (req, res) => {
      console.log('🏆 Get leaderboard:', req.query.type);
      
      const type = req.query.type || 'posts';
      
      let sortedUsers;
      switch (type) {
        case 'connections':
          sortedUsers = allUsers.sort((a, b) => b.connectionCount - a.connectionCount);
          break;
        case 'projects':
          sortedUsers = allUsers.sort((a, b) => b.projectCount - a.projectCount);
          break;
        case 'posts':
        default:
          sortedUsers = allUsers.sort((a, b) => b.postCount - a.postCount);
          break;
      }
      
      const leaderboard = sortedUsers.map((user, index) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        profileImage: user.profileImage,
        department: user.department,
        year: user.year,
        rank: index + 1,
        postCount: user.postCount,
        connectionCount: user.connectionCount,
        projectCount: user.projectCount,
        score: type === 'connections' ? user.connectionCount : 
               type === 'projects' ? user.projectCount : user.postCount
      }));
      
      res.json({
        success: true,
        data: {
          leaderboard,
          type
        }
      });
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
      
      res.status(err.status || 500).json({
        success: false,
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
      });
    });

    console.log('✅ Enhanced Express app created successfully');
    return app;
    
  } catch (error) {
    console.error('❌ Error creating app:', error);
    throw error;
  }
}

// Lambda handler
exports.handler = async (event, context) => {
  try {
    console.log('🚀 Enhanced Lambda handler invoked');
    
    // Set context to not wait for empty event loop
    context.callbackWaitsForEmptyEventLoop = false;
    
    if (!serverlessExpressInstance) {
      console.log('🔧 Creating new serverless express instance...');
      const app = await createApp();
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
