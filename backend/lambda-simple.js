// Native Lambda handler with DocumentDB integration
// Set Lambda environment variable early
process.env.AWS_LAMBDA_FUNCTION_NAME = 'true';

// Database integration using AWS DynamoDB (native to Lambda)
let AWS, dynamodb, docClient;
try {
  // AWS SDK is available in Lambda runtime by default
  AWS = require('aws-sdk');
  
  // Configure DynamoDB
  dynamodb = new AWS.DynamoDB({ region: process.env.AWS_REGION || 'us-east-1' });
  docClient = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION || 'us-east-1' });
  
  console.log('✅ AWS SDK and DynamoDB loaded successfully');
} catch (error) {
  console.log('⚠️ AWS SDK not available:', error.message);
  AWS = null;
  dynamodb = null;
  docClient = null;
}

// Security utilities (using built-in Node.js crypto for hashing)
const crypto = require('crypto');

// Simple JWT implementation (using built-in crypto)
const JWT_SECRET = process.env.JWT_SECRET || 'final_network_secret_key_2024';

const createJWT = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const verifyJWT = (token) => {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    if (signature !== expectedSignature) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString());
    
    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
};

// Password hashing utilities
const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password, hashedPassword) => {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// Extract user from JWT token
const extractUserFromToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  const payload = verifyJWT(token);
  
  if (!payload || !payload.userId) {
    return null;
  }
  
  return payload;
};

// DynamoDB table names
const USERS_TABLE = process.env.USERS_TABLE || 'final-network-users-staging';
const POSTS_TABLE = process.env.POSTS_TABLE || 'final-network-posts-staging';
const PROJECTS_TABLE = process.env.PROJECTS_TABLE || 'final-network-projects-staging';
const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'final-network-messages-staging';
const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE || 'final-network-conversations-staging';
const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE || 'final-network-notifications-staging';

// DynamoDB helper functions
const ensureTablesExist = async () => {
  if (!dynamodb) {
    console.log('⚠️ DynamoDB not available, using demo mode');
    return false;
  }

  try {
    const tables = [
      {
        name: USERS_TABLE,
        keySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        attributeDefinitions: [{ AttributeName: 'email', AttributeType: 'S' }]
      },
      {
        name: POSTS_TABLE,
        keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        attributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'createdAt', AttributeType: 'S' }
        ],
        globalSecondaryIndexes: [
          {
            IndexName: 'UserIndex',
            KeySchema: [
              { AttributeName: 'userId', KeyType: 'HASH' },
              { AttributeName: 'createdAt', KeyType: 'RANGE' }
            ],
            Projection: { ProjectionType: 'ALL' }
          }
        ]
      },
      {
        name: PROJECTS_TABLE,
        keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        attributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'userId', AttributeType: 'S' }
        ],
        globalSecondaryIndexes: [
          {
            IndexName: 'UserIndex',
            KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' }
          }
        ]
      },
      {
        name: MESSAGES_TABLE,
        keySchema: [
          { AttributeName: 'conversationId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        attributeDefinitions: [
          { AttributeName: 'conversationId', AttributeType: 'S' },
          { AttributeName: 'timestamp', AttributeType: 'S' }
        ]
      },
      {
        name: CONVERSATIONS_TABLE,
        keySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        attributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' },
          { AttributeName: 'participant1', AttributeType: 'S' }
        ],
        globalSecondaryIndexes: [
          {
            IndexName: 'ParticipantIndex',
            KeySchema: [{ AttributeName: 'participant1', KeyType: 'HASH' }],
            Projection: { ProjectionType: 'ALL' }
          }
        ]
      },
      {
        name: NOTIFICATIONS_TABLE,
        keySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        attributeDefinitions: [
          { AttributeName: 'userId', AttributeType: 'S' },
          { AttributeName: 'createdAt', AttributeType: 'S' }
        ]
      }
    ];

    // Create all tables
    for (const table of tables) {
      try {
        await dynamodb.describeTable({ TableName: table.name }).promise();
        console.log(`✅ ${table.name} table exists`);
      } catch (error) {
        if (error.code === 'ResourceNotFoundException') {
          console.log(`📝 Creating ${table.name} table...`);
          
          const createParams = {
            TableName: table.name,
            KeySchema: table.keySchema,
            AttributeDefinitions: table.attributeDefinitions,
            BillingMode: 'PAY_PER_REQUEST'
          };
          
          if (table.globalSecondaryIndexes) {
            createParams.GlobalSecondaryIndexes = table.globalSecondaryIndexes;
          }
          
          await dynamodb.createTable(createParams).promise();
          await dynamodb.waitFor('tableExists', { TableName: table.name }).promise();
          console.log(`✅ ${table.name} table created`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error ensuring tables exist:', error);
    return false;
  }
};

// Database operations using DynamoDB
const dbOperations = {
  async findUser(email) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      const result = await docClient.get({
        TableName: USERS_TABLE,
        Key: { email: email }
      }).promise();
      
      return result.Item || null;
    } catch (error) {
      console.error('❌ Error finding user:', error);
      return null;
    }
  },

  async createUser(userData) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      const userWithTimestamp = {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await docClient.put({
        TableName: USERS_TABLE,
        Item: userWithTimestamp,
        ConditionExpression: 'attribute_not_exists(email)' // Prevent duplicates
      }).promise();
      
      return userWithTimestamp;
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        console.log('⚠️ User already exists');
        return null;
      }
      console.error('❌ Error creating user:', error);
      return null;
    }
  },

  async updateUser(email, updateData) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      const updateDataWithTimestamp = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Build update expression
      const updateExpression = [];
      const expressionAttributeNames = {};
      const expressionAttributeValues = {};
      
      Object.keys(updateDataWithTimestamp).forEach((key, index) => {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;
        updateExpression.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = updateDataWithTimestamp[key];
      });
      
      const result = await docClient.update({
        TableName: USERS_TABLE,
        Key: { email: email },
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      }).promise();
      
      return result.Attributes;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      return null;
    }
  },

  async getAllUsers() {
    if (!docClient) return [];
    
    try {
      await ensureTablesExist();
      
      const result = await docClient.scan({
        TableName: USERS_TABLE
      }).promise();
      
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error getting all users:', error);
      return [];
    }
  },

  // Posts operations
  async createPost(postData) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      const postWithTimestamp = {
        ...postData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await docClient.put({
        TableName: POSTS_TABLE,
        Item: postWithTimestamp
      }).promise();
      
      return postWithTimestamp;
    } catch (error) {
      console.error('❌ Error creating post:', error);
      return null;
    }
  },

  async getAllPosts() {
    if (!docClient) return [];
    
    try {
      await ensureTablesExist();
      
      const result = await docClient.scan({
        TableName: POSTS_TABLE
      }).promise();
      
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error getting posts:', error);
      return [];
    }
  },

  async updatePost(postId, updateData) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      const result = await docClient.update({
        TableName: POSTS_TABLE,
        Key: { id: postId },
        UpdateExpression: 'SET #likes = :likes, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#likes': 'likes',
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':likes': updateData.likes,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      }).promise();
      
      return result.Attributes;
    } catch (error) {
      console.error('❌ Error updating post:', error);
      return null;
    }
  },

  // Projects operations
  async createProject(projectData) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      const projectWithTimestamp = {
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await docClient.put({
        TableName: PROJECTS_TABLE,
        Item: projectWithTimestamp
      }).promise();
      
      return projectWithTimestamp;
    } catch (error) {
      console.error('❌ Error creating project:', error);
      return null;
    }
  },

  async getUserProjects(userId) {
    if (!docClient) return [];
    
    try {
      await ensureTablesExist();
      
      const result = await docClient.query({
        TableName: PROJECTS_TABLE,
        IndexName: 'UserIndex',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise();
      
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error getting user projects:', error);
      return [];
    }
  },

  // Messages operations
  async createMessage(messageData) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      await docClient.put({
        TableName: MESSAGES_TABLE,
        Item: messageData
      }).promise();
      
      return messageData;
    } catch (error) {
      console.error('❌ Error creating message:', error);
      return null;
    }
  },

  async getConversationMessages(conversationId) {
    if (!docClient) return [];
    
    try {
      await ensureTablesExist();
      
      const result = await docClient.query({
        TableName: MESSAGES_TABLE,
        KeyConditionExpression: 'conversationId = :conversationId',
        ExpressionAttributeValues: {
          ':conversationId': conversationId
        },
        ScanIndexForward: true // Sort by timestamp ascending
      }).promise();
      
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error getting messages:', error);
      return [];
    }
  },

  // Conversations operations
  async createConversation(conversationData) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      await docClient.put({
        TableName: CONVERSATIONS_TABLE,
        Item: conversationData
      }).promise();
      
      return conversationData;
    } catch (error) {
      console.error('❌ Error creating conversation:', error);
      return null;
    }
  },

  async getUserConversations(userId) {
    if (!docClient) return [];
    
    try {
      await ensureTablesExist();
      
      const result = await docClient.query({
        TableName: CONVERSATIONS_TABLE,
        IndexName: 'ParticipantIndex',
        KeyConditionExpression: 'participant1 = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise();
      
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error getting conversations:', error);
      return [];
    }
  },

  // Notifications operations
  async createNotification(notificationData) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      const notificationWithTimestamp = {
        ...notificationData,
        createdAt: new Date().toISOString(),
        read: false
      };
      
      await docClient.put({
        TableName: NOTIFICATIONS_TABLE,
        Item: notificationWithTimestamp
      }).promise();
      
      return notificationWithTimestamp;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return null;
    }
  },

  async getUserNotifications(userId) {
    if (!docClient) return [];
    
    try {
      await ensureTablesExist();
      
      const result = await docClient.query({
        TableName: NOTIFICATIONS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false, // Sort by createdAt descending (newest first)
        Limit: 50 // Limit to recent notifications
      }).promise();
      
      return result.Items || [];
    } catch (error) {
      console.error('❌ Error getting notifications:', error);
      return [];
    }
  },

  async markNotificationAsRead(userId, createdAt) {
    if (!docClient) return null;
    
    try {
      await ensureTablesExist();
      
      const result = await docClient.update({
        TableName: NOTIFICATIONS_TABLE,
        Key: { userId: userId, createdAt: createdAt },
        UpdateExpression: 'SET #read = :read',
        ExpressionAttributeNames: {
          '#read': 'read'
        },
        ExpressionAttributeValues: {
          ':read': true
        },
        ReturnValues: 'ALL_NEW'
      }).promise();
      
      return result.Attributes;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      return null;
    }
  }
};

// Demo user data (with hashed password)
const currentUser = {
  id: 'user_demo',
  firstName: 'Demo',
  lastName: 'User',
  username: 'demo_user',
  email: 'demo@testapp.com',
  password: hashPassword('demo123456'), // Hashed password for security
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

// Demo posts data
const posts = [
  {
    id: 'post_1',
    userId: 'user_demo',
    content: 'Just finished working on a new React Native app! Excited to share it with everyone soon. 🚀',
    imageUrl: null,
    likes: ['user_alice', 'user_bob'],
    comments: [
      {
        id: 'comment_1',
        userId: 'user_alice',
        content: 'That sounds amazing! Can\'t wait to see it.',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post_2',
    userId: 'user_alice',
    content: 'Working on an IoT project for smart home automation. The possibilities are endless! 💡',
    imageUrl: null,
    likes: ['user_demo'],
    comments: [],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post_3',
    userId: 'user_bob',
    content: 'Just completed my mechanical design project using SolidWorks. 3D printing the prototype tomorrow!',
    imageUrl: null,
    likes: ['user_demo', 'user_alice'],
    comments: [
      {
        id: 'comment_2',
        userId: 'user_demo',
        content: 'Awesome work! Would love to see the final result.',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

// WebSocket connection management
const activeConnections = new Map(); // connectionId -> { userId, lastSeen }
const userConnections = new Map(); // userId -> Set of connectionIds

// WebSocket helper functions
const addConnection = (connectionId, userId) => {
  activeConnections.set(connectionId, {
    userId: userId,
    lastSeen: new Date().toISOString(),
    connectedAt: new Date().toISOString()
  });
  
  if (!userConnections.has(userId)) {
    userConnections.set(userId, new Set());
  }
  userConnections.get(userId).add(connectionId);
  
  console.log(`✅ User ${userId} connected via ${connectionId}`);
};

const removeConnection = (connectionId) => {
  const connection = activeConnections.get(connectionId);
  if (connection) {
    const userId = connection.userId;
    activeConnections.delete(connectionId);
    
    if (userConnections.has(userId)) {
      userConnections.get(userId).delete(connectionId);
      if (userConnections.get(userId).size === 0) {
        userConnections.delete(userId);
      }
    }
    
    console.log(`❌ User ${userId} disconnected from ${connectionId}`);
  }
};

const isUserOnline = (userId) => {
  return userConnections.has(userId) && userConnections.get(userId).size > 0;
};

const getUserConnections = (userId) => {
  return userConnections.get(userId) || new Set();
};

// Simulate message broadcasting (in real implementation, this would use API Gateway Management API)
const broadcastMessage = async (message, targetUserIds) => {
  console.log('📡 Broadcasting message to users:', targetUserIds);
  
  // In a real WebSocket implementation, this would send the message to all active connections
  // For now, we'll log the broadcast and update our demo data
  targetUserIds.forEach(userId => {
    const connections = getUserConnections(userId);
    connections.forEach(connectionId => {
      console.log(`📤 Sending message to ${userId} via connection ${connectionId}:`, message.content);
    });
  });
  
  return true;
};

// Demo conversations and messages
const conversations = [
  {
    id: 'conv_1',
    participants: ['user_demo', 'user_alice'],
    lastMessage: {
      id: 'msg_3',
      content: 'That sounds like a great project! Let me know if you need any help.',
      senderId: 'user_alice',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    unreadCount: {
      'user_demo': 1,
      'user_alice': 0
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  },
  {
    id: 'conv_2',
    participants: ['user_demo', 'user_bob'],
    lastMessage: {
      id: 'msg_6',
      content: 'Thanks for the SolidWorks tips!',
      senderId: 'user_demo',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    unreadCount: {
      'user_demo': 0,
      'user_bob': 1
    },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

const messages = [
  {
    id: 'msg_1',
    conversationId: 'conv_1',
    senderId: 'user_demo',
    content: 'Hey Alice! I saw your IoT project post. Really impressive work!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    type: 'text'
  },
  {
    id: 'msg_2',
    conversationId: 'conv_1',
    senderId: 'user_alice',
    content: 'Thank you! I\'m really excited about the possibilities with smart home automation.',
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    status: 'read',
    type: 'text'
  },
  {
    id: 'msg_3',
    conversationId: 'conv_1',
    senderId: 'user_alice',
    content: 'That sounds like a great project! Let me know if you need any help.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    status: 'delivered',
    type: 'text'
  },
  {
    id: 'msg_4',
    conversationId: 'conv_2',
    senderId: 'user_bob',
    content: 'Hey! I noticed you\'re working with React Native. I\'m doing some mechanical design work.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'read',
    type: 'text'
  },
  {
    id: 'msg_5',
    conversationId: 'conv_2',
    senderId: 'user_demo',
    content: 'That\'s awesome! I\'d love to learn more about SolidWorks and 3D printing.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    status: 'read',
    type: 'text'
  },
  {
    id: 'msg_6',
    conversationId: 'conv_2',
    senderId: 'user_demo',
    content: 'Thanks for the SolidWorks tips!',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'delivered',
    type: 'text'
  }
];

// Demo users for leaderboard
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

async function createApp() {
  try {
    console.log('🚀 Creating simple Express app for Lambda...');
    
    const express = require('express');
    const cors = require('cors');
    
    const app = express();
    
    // Basic middleware
    app.use(cors({
      origin: '*',
      credentials: true
    }));
    
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'staging',
        version: '2.0.2-working'
      });
    });
    
    // API info endpoint
    app.get('/api', (req, res) => {
      res.json({
        message: 'Final Network API - Working Version',
        version: '2.0.2',
        status: 'running',
        features: [
          'Authentication & Registration',
          'User Profiles & Management',
          'Posts & Social Feed',
          'Like & Comment System',
          'User Search & Discovery',
          'Leaderboard & Rankings',
          'Database Integration Ready'
        ],
        endpoints: {
          auth: '/api/auth/login, /api/auth/register, /api/auth/verify-otp',
          users: '/api/users/profile, /api/users/search',
          posts: '/api/posts (GET/POST), /api/posts/:id/like, /api/posts/:id/comments (GET/POST)',
          projects: '/api/projects (GET/POST), /api/projects/:id (GET/PUT/DELETE), /api/projects/:id/join',
          messages: '/api/messages/conversations (GET/POST), /api/messages/conversations/:id/messages (GET/POST)',
          leaderboard: '/api/leaderboard?type={posts|connections|projects}',
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
      
      const { q, department, year } = req.query;
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

    return app;
    
  } catch (error) {
    console.error('❌ Error creating app:', error);
    throw error;
  }
}

// Lambda handler - Native approach without serverless-express
exports.handler = async (event, context) => {
  try {
    console.log('🚀 Native Lambda handler invoked');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // Parse the request
    const httpMethod = event.httpMethod || event.requestContext?.http?.method || 'GET';
    const path = event.path || event.rawPath || '/';
    const queryStringParameters = event.queryStringParameters || {};
    const headers = event.headers || {};
    
    let body = {};
    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch (e) {
        body = event.body;
      }
    }
    
    console.log(`${httpMethod} ${path}`);
    
    // Route handling
    if (path === '/health' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'staging',
          version: '2.0.3-native'
        })
      };
    }
    
    if (path === '/api' && httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          message: 'Final Network API - Enhanced Native Lambda Version',
          version: '2.1.0',
          status: 'running',
          features: [
            'Authentication & Registration',
            'User Profiles & Management',
            'Posts & Social Feed',
            'Like & Comment System',
            'Real-time Messaging & Chat',
            'Push Notifications & Alerts',
            'User Search & Discovery',
            'Leaderboard & Rankings',
            'Database Integration Ready'
          ],
          endpoints: {
            auth: '/api/auth/login, /api/auth/register, /api/auth/verify-otp',
            users: '/api/users/profile, /api/users/search',
            posts: '/api/posts (GET/POST), /api/posts/:id/like',
            messages: '/api/messages/conversations (GET/POST), /api/messages/conversations/:id/messages (GET/POST)',
            websocket: '/api/websocket/connect, /api/websocket/disconnect, /api/websocket/online',
            notifications: '/api/notifications/register, /api/notifications/send, /api/notifications/settings (GET/PUT)',
            leaderboard: '/api/leaderboard?type={posts|connections|projects}',
            health: '/health'
          }
        })
      };
    }
    
    if (path === '/api/auth/login' && httpMethod === 'POST') {
      console.log('🔐 Login attempt:', body.email);
      
      try {
        // Try to find user in database first
        let user = await dbOperations.findUser(body.email);
        
        // If no database connection, use demo user
        if (!user && body.email === 'demo@testapp.com' && body.password === 'demo123456') {
          user = currentUser;
        }
        
        // Verify password
        let isValidPassword = false;
        if (user) {
          if (body.password === 'demo123456' && user.email === 'demo@testapp.com') {
            // Allow demo login with plain password
            isValidPassword = true;
          } else if (user.password && user.password.includes(':')) {
            // Verify hashed password
            isValidPassword = verifyPassword(body.password, user.password);
          } else {
            // Fallback for plain text passwords (demo mode)
            isValidPassword = user.password === body.password;
          }
        }
        
        if (user && isValidPassword) {
          // Create JWT token
          const tokenPayload = {
            userId: user.id,
            email: user.email,
            username: user.username,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          };
          
          const jwtToken = createJWT(tokenPayload);
          
          // Remove password from response
          const { password, ...userResponse } = user;
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: true,
              message: 'Login successful',
              data: {
                user: userResponse,
                token: jwtToken,
                expiresIn: '24h'
              }
            })
          };
        } else {
          return {
            statusCode: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Invalid credentials'
            })
          };
        }
      } catch (error) {
        console.error('❌ Login error:', error);
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
            error: 'Login failed'
          })
        };
      }
    }
    
    if (path === '/api/auth/register' && httpMethod === 'POST') {
      console.log('📝 Register user:', body.email);
      
      try {
        // Check if user already exists
        const existingUser = await dbOperations.findUser(body.email);
        if (existingUser) {
          return {
            statusCode: 409,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'User already exists'
            })
          };
        }
        
        // Create new user
        const newUser = {
          id: 'user_' + Date.now(),
          firstName: body.firstName || 'New',
          lastName: body.lastName || 'User',
          email: body.email,
          username: body.username || body.email.split('@')[0],
          password: hashPassword(body.password), // Hashed password for security
          profileImage: null,
          department: body.department || 'Computer Science',
          year: body.year || 1,
          bio: body.bio || 'New student on the platform',
          skills: body.skills || [],
          interests: body.interests || [],
          postCount: 0,
          connectionCount: 0,
          projectCount: 0,
          isVerified: false,
          academic: {
            year: body.year || '1',
            major: body.department || 'Computer Science',
            gpa: body.gpa || '0.0'
          },
          contact: {
            email: body.email,
            phone: body.phone || '',
            website: body.website || '',
            github: body.github || '',
            linkedin: body.linkedin || ''
          },
          projects: [],
          events: [],
          achievements: []
        };
        
        // Save to database
        const createdUser = await dbOperations.createUser(newUser);
        
        if (createdUser) {
          // Create JWT token for new user
          const tokenPayload = {
            userId: createdUser.id,
            email: createdUser.email,
            username: createdUser.username,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          };
          
          const jwtToken = createJWT(tokenPayload);
          
          // Remove password from response
          const { password, ...userResponse } = createdUser;
          
          return {
            statusCode: 201,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: true,
              message: 'User registered successfully',
              data: {
                user: userResponse,
                token: jwtToken,
                expiresIn: '24h'
              }
            })
          };
        } else {
          // Fallback for demo mode
          const tokenPayload = {
            userId: newUser.id,
            email: newUser.email,
            username: newUser.username,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
          };
          
          const jwtToken = createJWT(tokenPayload);
          const { password, ...userResponse } = newUser;
          
          return {
            statusCode: 201,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: true,
              message: 'User registered successfully (demo mode)',
              data: {
                user: userResponse,
                token: jwtToken,
                expiresIn: '24h'
              }
            })
          };
        }
      } catch (error) {
        console.error('❌ Registration error:', error);
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
            error: 'Registration failed'
          })
        };
      }
    }
    
    // OTP Verification endpoint
    if (path === '/api/auth/verify-otp' && httpMethod === 'POST') {
      console.log('🔢 Verify OTP:', body.otp);
      
      try {
        if (!body.email || !body.otp) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Email and OTP are required'
            })
          };
        }
        
        // For demo purposes, accept any 6-digit OTP
        if (body.otp && body.otp.length === 6) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: true,
              message: 'OTP verified successfully',
              data: {
                email: body.email,
                verified: true
              }
            })
          };
        } else {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Invalid OTP. Please enter a 6-digit code.'
            })
          };
        }
      } catch (error) {
        console.error('❌ OTP verification error:', error);
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
            error: 'OTP verification failed'
          })
        };
      }
    }
    
    if (path === '/api/users/profile' && httpMethod === 'GET') {
      console.log('👤 Get user profile');
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify({
          success: true,
          data: { user: currentUser }
        })
      };
    }
    
    if (path === '/api/users/profile' && httpMethod === 'PUT') {
      console.log('✏️ Update user profile:', body);
      
      try {
        // Extract email from token or use demo email
        const userEmail = body.email || 'demo@testapp.com';
        
        // Prepare update data
        const updateData = {
          firstName: body.firstName,
          lastName: body.lastName,
          username: body.username,
          bio: body.bio,
          skills: body.skills,
          interests: body.interests,
          academic: body.academic,
          contact: body.contact
        };
        
        // Remove undefined values
        Object.keys(updateData).forEach(key => {
          if (updateData[key] === undefined) {
            delete updateData[key];
          }
        });
        
        // Try to update in database
        let updatedUser = await dbOperations.updateUser(userEmail, updateData);
        
        // If no database connection, update demo user
        if (!updatedUser && userEmail === 'demo@testapp.com') {
          Object.assign(currentUser, updateData);
          updatedUser = currentUser;
        }
        
        if (updatedUser) {
          // Remove password from response
          const { password, ...userResponse } = updatedUser;
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: true,
              message: 'Profile updated successfully',
              data: { user: userResponse }
            })
          };
        } else {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'User not found'
            })
          };
        }
      } catch (error) {
        console.error('❌ Profile update error:', error);
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
            error: 'Profile update failed'
          })
        };
      }
    }
    
    if (path === '/api/leaderboard' && httpMethod === 'GET') {
      console.log('🏆 Get leaderboard:', queryStringParameters.type);
      
      try {
        const type = queryStringParameters.type || 'posts';
        
        // Try to get users from database
        let users = await dbOperations.getAllUsers();
        
        // If no database connection, use demo users
        if (!users || users.length === 0) {
          users = allUsers;
        }
        
        let sortedUsers;
        switch (type) {
          case 'connections':
            sortedUsers = users.sort((a, b) => (b.connectionCount || 0) - (a.connectionCount || 0));
            break;
          case 'projects':
            sortedUsers = users.sort((a, b) => (b.projectCount || 0) - (a.projectCount || 0));
            break;
          case 'posts':
          default:
            sortedUsers = users.sort((a, b) => (b.postCount || 0) - (a.postCount || 0));
            break;
        }
        
        const leaderboard = sortedUsers.map((user, index) => ({
          id: user.id || user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          profileImage: user.profileImage,
          department: user.department,
          year: user.year,
          rank: index + 1,
          postCount: user.postCount || 0,
          connectionCount: user.connectionCount || 0,
          projectCount: user.projectCount || 0,
          score: type === 'connections' ? (user.connectionCount || 0) : 
                 type === 'projects' ? (user.projectCount || 0) : (user.postCount || 0)
        }));
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              leaderboard,
              type,
              source: users === allUsers ? 'demo' : 'database'
            }
          })
        };
      } catch (error) {
        console.error('❌ Leaderboard error:', error);
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
            error: 'Failed to get leaderboard'
          })
        };
      }
    }
    
    // Posts endpoints
    if (path === '/api/posts' && httpMethod === 'GET') {
      console.log('📝 Get posts feed');
      
      try {
        // Try to get posts from database first
        let allPosts = await dbOperations.getAllPosts();
        
        // If no database posts, use demo posts
        if (!allPosts || allPosts.length === 0) {
          allPosts = posts;
        }
        
        // Get posts with user information
        const postsWithUsers = allPosts.map(post => {
          const user = allUsers.find(u => u.id === post.userId);
          return {
            ...post,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              profileImage: user.profileImage,
              department: user.department,
              isVerified: user.isVerified
            } : null,
            likesCount: post.likes.length,
            commentsCount: post.comments.length,
            isLiked: post.likes.includes('user_demo') // Current user
          };
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: { 
              posts: postsWithUsers,
              total: postsWithUsers.length
            }
          })
        };
      } catch (error) {
        console.error('❌ Get posts error:', error);
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
            error: 'Failed to get posts'
          })
        };
      }
    }
    
    if (path === '/api/posts' && httpMethod === 'POST') {
      console.log('📝 Create post:', body);
      
      try {
        const newPost = {
          id: 'post_' + Date.now(),
          userId: 'user_demo', // Current user
          content: body.content,
          imageUrl: body.imageUrl || null,
          likes: [],
          comments: []
        };
        
        // Try to save to database first
        const savedPost = await dbOperations.createPost(newPost);
        
        if (savedPost) {
          console.log('✅ Post saved to database');
        } else {
          // Fallback to demo mode
          posts.unshift({
            ...newPost,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
        // Update user's post count
        const user = allUsers.find(u => u.id === 'user_demo');
        if (user) {
          user.postCount = (user.postCount || 0) + 1;
        }
        
        // Return post with user info
        const postWithUser = {
          ...newPost,
          user: user ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profileImage: user.profileImage,
            department: user.department,
            isVerified: user.isVerified
          } : null,
          likesCount: 0,
          commentsCount: 0,
          isLiked: false
        };
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            message: 'Post created successfully',
            data: { post: postWithUser }
          })
        };
      } catch (error) {
        console.error('❌ Create post error:', error);
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
            error: 'Failed to create post'
          })
        };
      }
    }
    
    // Like/Unlike post
    if (path.startsWith('/api/posts/') && path.endsWith('/like') && httpMethod === 'POST') {
      const postId = path.split('/')[3];
      console.log('👍 Like/unlike post:', postId);
      
      try {
        // Try to get post from database first
        let allPosts = await dbOperations.getAllPosts();
        if (!allPosts || allPosts.length === 0) {
          allPosts = posts;
        }
        
        const post = allPosts.find(p => p.id === postId);
        if (!post) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Post not found'
            })
          };
        }
        
        const userId = 'user_demo'; // Current user
        const isLiked = post.likes.includes(userId);
        
        if (isLiked) {
          post.likes = post.likes.filter(id => id !== userId);
        } else {
          post.likes.push(userId);
        }
        
        // Try to update in database
        const updatedPost = await dbOperations.updatePost(postId, { likes: post.likes });
        
        if (updatedPost) {
          console.log('✅ Post like updated in database');
          
          // Create notification for post owner (if not liking own post)
          if (post.userId !== userId) {
            const notification = {
              userId: post.userId,
              type: 'like',
              title: 'New Like',
              message: `Someone liked your post: "${post.content.substring(0, 50)}..."`,
              data: {
                postId: postId,
                likerId: userId
              }
            };
            
            await dbOperations.createNotification(notification);
            console.log('📱 Like notification created');
          }
        } else {
          // Fallback to demo mode
          post.updatedAt = new Date().toISOString();
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              postId: postId,
              isLiked: !isLiked,
              likesCount: post.likes.length
            }
          })
        };
      } catch (error) {
        console.error('❌ Like post error:', error);
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
            error: 'Failed to like post'
          })
        };
      }
    }
    
    // Get comments for a post
    if (path.startsWith('/api/posts/') && path.endsWith('/comments') && httpMethod === 'GET') {
      const postId = path.split('/')[3];
      console.log('💬 Get comments for post:', postId);
      
      try {
        const post = posts.find(p => p.id === postId);
        if (!post) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Post not found'
            })
          };
        }
        
        // Format comments with user info
        const formattedComments = post.comments.map(comment => {
          const user = allUsers.find(u => u.id === comment.userId);
          return {
            id: comment.id,
            content: comment.content,
            userId: comment.userId,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              profileImage: user.profileImage
            } : null,
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt
          };
        }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              comments: formattedComments,
              total: formattedComments.length,
              postId: postId
            }
          })
        };
      } catch (error) {
        console.error('❌ Get comments error:', error);
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
            error: 'Failed to get comments'
          })
        };
      }
    }
    
    // Add comment to a post
    if (path.startsWith('/api/posts/') && path.endsWith('/comments') && httpMethod === 'POST') {
      const postId = path.split('/')[3];
      console.log('💬 Add comment to post:', postId, body);
      
      try {
        const post = posts.find(p => p.id === postId);
        if (!post) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Post not found'
            })
          };
        }
        
        if (!body.content || !body.content.trim()) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Comment content is required'
            })
          };
        }
        
        const newComment = {
          id: `comment_${Date.now()}`,
          userId: 'user_demo', // Current user
          content: body.content.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Add comment to post
        post.comments.push(newComment);
        
        // Get user info for response
        const user = allUsers.find(u => u.id === newComment.userId);
        const formattedComment = {
          id: newComment.id,
          content: newComment.content,
          userId: newComment.userId,
          user: user ? {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            profileImage: user.profileImage
          } : null,
          createdAt: newComment.createdAt,
          updatedAt: newComment.updatedAt
        };
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              comment: formattedComment,
              message: 'Comment added successfully'
            }
          })
        };
      } catch (error) {
        console.error('❌ Add comment error:', error);
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
            error: 'Failed to add comment'
          })
        };
      }
    }
    
    // Projects endpoints
    // Get all projects
    if (path === '/api/projects' && httpMethod === 'GET') {
      console.log('📋 Get projects');
      
      try {
        // Demo projects data
        const demoProjects = [
          {
            id: 'project_1',
            title: 'Campus Sustainability Tracker',
            description: 'AI-powered app to track and reduce campus carbon footprint through gamification and community engagement.',
            status: 'Active',
            teamSize: '4-6 members',
            duration: '3 months',
            requiredSkills: ['React Native', 'AI/ML', 'Node.js', 'Environmental Science'],
            creator: {
              id: 'user_demo',
              firstName: 'Demo',
              lastName: 'User',
              username: 'demo_user',
              profileImage: 'https://i.pravatar.cc/150?u=demo'
            },
            members: [
              {
                id: 'user_demo',
                firstName: 'Demo',
                lastName: 'User',
                role: 'Project Lead'
              }
            ],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            isRecruiting: true,
            category: 'Technology'
          },
          {
            id: 'project_2',
            title: 'Student Mental Health Platform',
            description: 'Anonymous peer support platform with AI-powered mood tracking and professional counselor connections.',
            status: 'Planning',
            teamSize: '3-5 members',
            duration: '4 months',
            requiredSkills: ['Psychology', 'Web Development', 'UI/UX Design', 'Data Analysis'],
            creator: {
              id: 'user_alice',
              firstName: 'Alice',
              lastName: 'Johnson',
              username: 'alice_j',
              profileImage: 'https://i.pravatar.cc/150?u=alice'
            },
            members: [
              {
                id: 'user_alice',
                firstName: 'Alice',
                lastName: 'Johnson',
                role: 'Project Lead'
              }
            ],
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            isRecruiting: true,
            category: 'Health & Wellness'
          }
        ];
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              projects: demoProjects,
              total: demoProjects.length
            }
          })
        };
      } catch (error) {
        console.error('❌ Get projects error:', error);
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
            error: 'Failed to get projects'
          })
        };
      }
    }
    
    // Create new project
    if (path === '/api/projects' && httpMethod === 'POST') {
      console.log('📋 Create project:', body);
      
      try {
        if (!body.title || !body.description) {
          return {
            statusCode: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Project title and description are required'
            })
          };
        }
        
        const newProject = {
          id: `project_${Date.now()}`,
          title: body.title,
          description: body.description,
          status: body.status || 'Planning',
          teamSize: body.teamSize || '2-4 members',
          duration: body.duration || '2 months',
          requiredSkills: body.requiredSkills || [],
          creator: {
            id: 'user_demo',
            firstName: 'Demo',
            lastName: 'User',
            username: 'demo_user',
            profileImage: 'https://i.pravatar.cc/150?u=demo'
          },
          members: [
            {
              id: 'user_demo',
              firstName: 'Demo',
              lastName: 'User',
              role: 'Project Lead'
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isRecruiting: true,
          category: body.category || 'Technology'
        };
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              project: newProject,
              message: 'Project created successfully'
            }
          })
        };
      } catch (error) {
        console.error('❌ Create project error:', error);
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
            error: 'Failed to create project'
          })
        };
      }
    }
    
    // Get specific project
    if (path.startsWith('/api/projects/') && !path.includes('/join') && httpMethod === 'GET') {
      const projectId = path.split('/')[3];
      console.log('📋 Get project:', projectId);
      
      try {
        // Demo project data
        const project = {
          id: projectId,
          title: 'Campus Sustainability Tracker',
          description: 'AI-powered app to track and reduce campus carbon footprint through gamification and community engagement.',
          status: 'Active',
          teamSize: '4-6 members',
          duration: '3 months',
          requiredSkills: ['React Native', 'AI/ML', 'Node.js', 'Environmental Science'],
          creator: {
            id: 'user_demo',
            firstName: 'Demo',
            lastName: 'User',
            username: 'demo_user',
            profileImage: 'https://i.pravatar.cc/150?u=demo'
          },
          members: [
            {
              id: 'user_demo',
              firstName: 'Demo',
              lastName: 'User',
              role: 'Project Lead'
            }
          ],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          isRecruiting: true,
          category: 'Technology'
        };
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              project: project
            }
          })
        };
      } catch (error) {
        console.error('❌ Get project error:', error);
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
            error: 'Failed to get project'
          })
        };
      }
    }
    
    // Join project
    if (path.startsWith('/api/projects/') && path.endsWith('/join') && httpMethod === 'POST') {
      const projectId = path.split('/')[3];
      console.log('🤝 Join project:', projectId);
      
      try {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            message: 'Successfully joined project',
            data: {
              projectId: projectId,
              userId: 'user_demo',
              role: 'Member'
            }
          })
        };
      } catch (error) {
        console.error('❌ Join project error:', error);
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
            error: 'Failed to join project'
          })
        };
      }
    }
    
    // User search endpoint
    if (path === '/api/users/search' && httpMethod === 'GET') {
      console.log('🔍 Search users:', queryStringParameters);
      
      try {
        const { q, department, year, skills } = queryStringParameters;
        let filteredUsers = [...allUsers];
        
        // Text search
        if (q) {
          const query = q.toLowerCase();
          filteredUsers = filteredUsers.filter(user => 
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query) ||
            user.bio.toLowerCase().includes(query) ||
            user.skills.some(skill => skill.toLowerCase().includes(query)) ||
            user.interests.some(interest => interest.toLowerCase().includes(query))
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
        
        // Skills filter
        if (skills) {
          const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
          filteredUsers = filteredUsers.filter(user => 
            skillsArray.some(skill => 
              user.skills.some(userSkill => userSkill.toLowerCase().includes(skill))
            )
          );
        }
        
        // Remove sensitive data and add connection status
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
          postCount: user.postCount || 0,
          connectionCount: user.connectionCount || 0,
          projectCount: user.projectCount || 0,
          isVerified: user.isVerified,
          isConnected: false, // Would be determined by checking connections
          connectionStatus: 'none' // none, pending, connected
        }));
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: { 
              users: publicUsers,
              total: publicUsers.length,
              query: { q, department, year, skills }
            }
          })
        };
      } catch (error) {
        console.error('❌ Search users error:', error);
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
            error: 'Failed to search users'
          })
        };
      }
    }
    
    // Messaging endpoints
    // Get all conversations for current user
    if (path === '/api/messages/conversations' && httpMethod === 'GET') {
      console.log('💬 Get conversations for user');
      
      try {
        const currentUserId = 'user_demo'; // Current user
        
        // Get conversations where current user is a participant
        const userConversations = conversations
          .filter(conv => conv.participants.includes(currentUserId))
          .map(conv => {
            // Get other participant info
            const otherUserId = conv.participants.find(id => id !== currentUserId);
            const otherUser = allUsers.find(u => u.id === otherUserId);
            
            return {
              id: conv.id,
              participant: otherUser ? {
                id: otherUser.id,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                username: otherUser.username,
                profileImage: otherUser.profileImage,
                isOnline: isUserOnline(otherUserId), // Real-time online status
                lastSeen: isUserOnline(otherUserId) ? 
                  new Date().toISOString() : 
                  new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString()
              } : null,
              lastMessage: conv.lastMessage,
              unreadCount: conv.unreadCount[currentUserId] || 0,
              updatedAt: conv.updatedAt
            };
          })
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              conversations: userConversations,
              total: userConversations.length
            }
          })
        };
      } catch (error) {
        console.error('❌ Get conversations error:', error);
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
            error: 'Failed to get conversations'
          })
        };
      }
    }
    
    // Get messages for a specific conversation
    if (path.startsWith('/api/messages/conversations/') && path.endsWith('/messages') && httpMethod === 'GET') {
      const conversationId = path.split('/')[4];
      console.log('💬 Get messages for conversation:', conversationId);
      
      try {
        const currentUserId = 'user_demo'; // Current user
        
        // Check if user is participant in this conversation
        const conversation = conversations.find(conv => 
          conv.id === conversationId && conv.participants.includes(currentUserId)
        );
        
        if (!conversation) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Conversation not found'
            })
          };
        }
        
        // Get messages for this conversation
        const conversationMessages = messages
          .filter(msg => msg.conversationId === conversationId)
          .map(msg => {
            const sender = allUsers.find(u => u.id === msg.senderId);
            return {
              ...msg,
              sender: sender ? {
                id: sender.id,
                firstName: sender.firstName,
                lastName: sender.lastName,
                username: sender.username,
                profileImage: sender.profileImage
              } : null,
              isMine: msg.senderId === currentUserId
            };
          })
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Mark messages as read
        conversation.unreadCount[currentUserId] = 0;
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              messages: conversationMessages,
              total: conversationMessages.length,
              conversationId: conversationId
            }
          })
        };
      } catch (error) {
        console.error('❌ Get messages error:', error);
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
            error: 'Failed to get messages'
          })
        };
      }
    }
    
    // Send a new message
    if (path.startsWith('/api/messages/conversations/') && path.endsWith('/messages') && httpMethod === 'POST') {
      const conversationId = path.split('/')[4];
      console.log('💬 Send message to conversation:', conversationId, body);
      
      try {
        const currentUserId = 'user_demo'; // Current user
        
        // Check if user is participant in this conversation
        const conversation = conversations.find(conv => 
          conv.id === conversationId && conv.participants.includes(currentUserId)
        );
        
        if (!conversation) {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Conversation not found'
            })
          };
        }
        
        // Create new message
        const newMessage = {
          id: 'msg_' + Date.now(),
          conversationId: conversationId,
          senderId: currentUserId,
          content: body.content,
          timestamp: new Date().toISOString(),
          status: 'sent',
          type: body.type || 'text'
        };
        
        messages.push(newMessage);
        
        // Update conversation
        conversation.lastMessage = {
          id: newMessage.id,
          content: newMessage.content,
          senderId: currentUserId,
          timestamp: newMessage.timestamp
        };
        conversation.updatedAt = newMessage.timestamp;
        
        // Increment unread count for other participants
        conversation.participants.forEach(participantId => {
          if (participantId !== currentUserId) {
            conversation.unreadCount[participantId] = (conversation.unreadCount[participantId] || 0) + 1;
          }
        });
        
        // Get sender info
        const sender = allUsers.find(u => u.id === currentUserId);
        const messageWithSender = {
          ...newMessage,
          sender: sender ? {
            id: sender.id,
            firstName: sender.firstName,
            lastName: sender.lastName,
            username: sender.username,
            profileImage: sender.profileImage
          } : null,
          isMine: true
        };
        
        // Broadcast message to other participants in real-time
        const otherParticipants = conversation.participants.filter(id => id !== currentUserId);
        if (otherParticipants.length > 0) {
          await broadcastMessage(messageWithSender, otherParticipants);
          
          // Send push notifications to offline users
          otherParticipants.forEach(async (participantId) => {
            if (!isUserOnline(participantId)) {
              const participant = allUsers.find(u => u.id === participantId);
              if (participant) {
                console.log(`📱 Sending push notification to ${participant.firstName} for new message`);
                
                // In a real implementation, this would send actual push notifications
                const notificationData = {
                  userId: participantId,
                  title: `New message from ${sender.firstName}`,
                  message: newMessage.content.length > 50 ? 
                    newMessage.content.substring(0, 50) + '...' : 
                    newMessage.content,
                  data: {
                    type: 'message',
                    conversationId: conversationId,
                    messageId: newMessage.id,
                    senderId: currentUserId
                  }
                };
                
                console.log('📤 Push notification queued:', notificationData);
              }
            }
          });
        }
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            message: 'Message sent successfully',
            data: { message: messageWithSender }
          })
        };
      } catch (error) {
        console.error('❌ Send message error:', error);
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
            error: 'Failed to send message'
          })
        };
      }
    }
    
    // Start a new conversation
    if (path === '/api/messages/conversations' && httpMethod === 'POST') {
      console.log('💬 Start new conversation:', body);
      
      try {
        const currentUserId = 'user_demo'; // Current user
        const { participantId, message } = body;
        
        // Check if conversation already exists
        let existingConversation = conversations.find(conv => 
          conv.participants.includes(currentUserId) && conv.participants.includes(participantId)
        );
        
        if (existingConversation) {
          // Return existing conversation
          const otherUser = allUsers.find(u => u.id === participantId);
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: true,
              message: 'Conversation already exists',
              data: {
                conversation: {
                  id: existingConversation.id,
                  participant: otherUser ? {
                    id: otherUser.id,
                    firstName: otherUser.firstName,
                    lastName: otherUser.lastName,
                    username: otherUser.username,
                    profileImage: otherUser.profileImage
                  } : null
                }
              }
            })
          };
        }
        
        // Create new conversation
        const newConversation = {
          id: 'conv_' + Date.now(),
          participants: [currentUserId, participantId],
          lastMessage: null,
          unreadCount: {
            [currentUserId]: 0,
            [participantId]: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        conversations.push(newConversation);
        
        // Send initial message if provided
        if (message) {
          const newMessage = {
            id: 'msg_' + Date.now(),
            conversationId: newConversation.id,
            senderId: currentUserId,
            content: message,
            timestamp: new Date().toISOString(),
            status: 'sent',
            type: 'text'
          };
          
          messages.push(newMessage);
          
          newConversation.lastMessage = {
            id: newMessage.id,
            content: newMessage.content,
            senderId: currentUserId,
            timestamp: newMessage.timestamp
          };
          newConversation.updatedAt = newMessage.timestamp;
          newConversation.unreadCount[participantId] = 1;
        }
        
        // Get participant info
        const otherUser = allUsers.find(u => u.id === participantId);
        
        return {
          statusCode: 201,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            message: 'Conversation created successfully',
            data: {
              conversation: {
                id: newConversation.id,
                participant: otherUser ? {
                  id: otherUser.id,
                  firstName: otherUser.firstName,
                  lastName: otherUser.lastName,
                  username: otherUser.username,
                  profileImage: otherUser.profileImage
                } : null
              }
            }
          })
        };
      } catch (error) {
        console.error('❌ Create conversation error:', error);
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
            error: 'Failed to create conversation'
          })
        };
      }
    }
    
    // WebSocket connection endpoints
    // Connect to WebSocket (simulate connection)
    if (path === '/api/websocket/connect' && httpMethod === 'POST') {
      console.log('🔌 WebSocket connect request:', body);
      
      try {
        const { userId, connectionId } = body;
        const actualConnectionId = connectionId || 'conn_' + Date.now();
        const actualUserId = userId || 'user_demo';
        
        // Add connection
        addConnection(actualConnectionId, actualUserId);
        
        // Update user online status in conversations
        conversations.forEach(conv => {
          if (conv.participants.includes(actualUserId)) {
            // Update online status for this user in all conversations
          }
        });
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            message: 'WebSocket connected successfully',
            data: {
              connectionId: actualConnectionId,
              userId: actualUserId,
              connectedAt: new Date().toISOString(),
              onlineUsers: Array.from(userConnections.keys())
            }
          })
        };
      } catch (error) {
        console.error('❌ WebSocket connect error:', error);
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
            error: 'Failed to connect WebSocket'
          })
        };
      }
    }
    
    // Disconnect from WebSocket
    if (path === '/api/websocket/disconnect' && httpMethod === 'POST') {
      console.log('🔌 WebSocket disconnect request:', body);
      
      try {
        const { connectionId } = body;
        
        if (connectionId) {
          removeConnection(connectionId);
        }
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            message: 'WebSocket disconnected successfully',
            data: {
              connectionId: connectionId,
              disconnectedAt: new Date().toISOString()
            }
          })
        };
      } catch (error) {
        console.error('❌ WebSocket disconnect error:', error);
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
            error: 'Failed to disconnect WebSocket'
          })
        };
      }
    }
    
    // Get online users
    if (path === '/api/websocket/online' && httpMethod === 'GET') {
      console.log('👥 Get online users request');
      
      try {
        const onlineUsers = Array.from(userConnections.keys()).map(userId => {
          const user = allUsers.find(u => u.id === userId);
          const connections = getUserConnections(userId);
          const connectionData = Array.from(connections).map(connId => activeConnections.get(connId));
          
          return {
            userId: userId,
            user: user ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              profileImage: user.profileImage
            } : null,
            isOnline: true,
            connectionCount: connections.size,
            lastSeen: connectionData.length > 0 ? 
              Math.max(...connectionData.map(c => new Date(c.lastSeen).getTime())) : null,
            connectedAt: connectionData.length > 0 ? 
              Math.min(...connectionData.map(c => new Date(c.connectedAt).getTime())) : null
          };
        });
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              onlineUsers: onlineUsers,
              totalOnline: onlineUsers.length,
              totalConnections: activeConnections.size
            }
          })
        };
      } catch (error) {
        console.error('❌ Get online users error:', error);
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
            error: 'Failed to get online users'
          })
        };
      }
    }
    
    // Notifications endpoints
    // Get user notifications
    if (path === '/api/notifications' && httpMethod === 'GET') {
      console.log('🔔 Get user notifications');
      
      try {
        const currentUserId = 'user_demo'; // Current user
        
        // Get notifications from database
        const notifications = await dbOperations.getUserNotifications(currentUserId);
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: {
              notifications: notifications,
              unreadCount: notifications.filter(n => !n.read).length,
              total: notifications.length
            }
          })
        };
      } catch (error) {
        console.error('❌ Get notifications error:', error);
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
            error: 'Failed to get notifications'
          })
        };
      }
    }
    
    // Mark notification as read
    if (path.startsWith('/api/notifications/') && path.endsWith('/read') && httpMethod === 'POST') {
      const notificationId = path.split('/')[3];
      console.log('📖 Mark notification as read:', notificationId);
      
      try {
        const currentUserId = 'user_demo'; // Current user
        
        // Mark notification as read
        const updatedNotification = await dbOperations.markNotificationAsRead(currentUserId, notificationId);
        
        if (updatedNotification) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: true,
              message: 'Notification marked as read',
              data: updatedNotification
            })
          };
        } else {
          return {
            statusCode: 404,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: false,
              error: 'Notification not found'
            })
          };
        }
      } catch (error) {
        console.error('❌ Mark notification as read error:', error);
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
            error: 'Failed to mark notification as read'
          })
        };
      }
    }
    
    // Create test notification (for testing purposes)
    if (path === '/api/notifications/test' && httpMethod === 'POST') {
      console.log('🧪 Create test notification');
      
      try {
        const testNotification = {
          userId: 'user_demo',
          type: 'like',
          title: 'Test Notification',
          message: 'This is a test notification to verify the system is working!',
          data: {
            postId: 'test_post_123',
            likerId: 'test_user'
          }
        };
        
        const createdNotification = await dbOperations.createNotification(testNotification);
        
        if (createdNotification) {
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: true,
              message: 'Test notification created successfully',
              data: createdNotification
            })
          };
        } else {
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
              error: 'Failed to create test notification'
            })
          };
        }
      } catch (error) {
        console.error('❌ Create test notification error:', error);
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
            error: 'Failed to create test notification'
          })
        };
      }
    }
    
    // Push notification endpoints
    // Register device for push notifications
    if (path === '/api/notifications/register' && httpMethod === 'POST') {
      console.log('🔔 Register device for notifications:', body);
      
      try {
        const { deviceToken, platform, userId } = body;
        const actualUserId = userId || 'user_demo';
        
        // In a real implementation, this would store device tokens in database
        // For now, we'll simulate registration
        const registrationData = {
          deviceToken: deviceToken,
          platform: platform, // 'ios' or 'android'
          userId: actualUserId,
          registeredAt: new Date().toISOString(),
          isActive: true
        };
        
        console.log('📱 Device registered for notifications:', registrationData);
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            message: 'Device registered for notifications',
            data: {
              deviceToken: deviceToken,
              platform: platform,
              userId: actualUserId,
              registeredAt: registrationData.registeredAt
            }
          })
        };
      } catch (error) {
        console.error('❌ Notification registration error:', error);
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
            error: 'Failed to register device for notifications'
          })
        };
      }
    }
    
    // Send push notification (simulate)
    if (path === '/api/notifications/send' && httpMethod === 'POST') {
      console.log('🔔 Send push notification:', body);
      
      try {
        const { userId, title, message, data } = body;
        
        // In a real implementation, this would:
        // 1. Get user's device tokens from database
        // 2. Send push notification via FCM/APNS
        // 3. Handle delivery status and retries
        
        const notification = {
          id: 'notif_' + Date.now(),
          userId: userId,
          title: title,
          message: message,
          data: data || {},
          sentAt: new Date().toISOString(),
          status: 'sent'
        };
        
        console.log('📤 Push notification sent:', notification);
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            message: 'Push notification sent',
            data: notification
          })
        };
      } catch (error) {
        console.error('❌ Send notification error:', error);
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
            error: 'Failed to send push notification'
          })
        };
      }
    }
    
    // Get notification settings
    if (path === '/api/notifications/settings' && httpMethod === 'GET') {
      console.log('🔔 Get notification settings');
      
      try {
        const currentUserId = 'user_demo'; // Current user
        
        // In a real implementation, this would get settings from database
        const settings = {
          userId: currentUserId,
          notifications: {
            messages: true,
            likes: true,
            comments: true,
            connections: true,
            posts: false
          },
          pushEnabled: true,
          emailEnabled: false,
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          },
          updatedAt: new Date().toISOString()
        };
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            data: settings
          })
        };
      } catch (error) {
        console.error('❌ Get notification settings error:', error);
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
            error: 'Failed to get notification settings'
          })
        };
      }
    }
    
    // Update notification settings
    if (path === '/api/notifications/settings' && httpMethod === 'PUT') {
      console.log('🔔 Update notification settings:', body);
      
      try {
        const currentUserId = 'user_demo'; // Current user
        
        // In a real implementation, this would update settings in database
        const updatedSettings = {
          userId: currentUserId,
          notifications: body.notifications || {},
          pushEnabled: body.pushEnabled !== undefined ? body.pushEnabled : true,
          emailEnabled: body.emailEnabled !== undefined ? body.emailEnabled : false,
          quietHours: body.quietHours || {
            enabled: true,
            start: '22:00',
            end: '08:00'
          },
          updatedAt: new Date().toISOString()
        };
        
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          },
          body: JSON.stringify({
            success: true,
            message: 'Notification settings updated',
            data: updatedSettings
          })
        };
      } catch (error) {
        console.error('❌ Update notification settings error:', error);
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
            error: 'Failed to update notification settings'
          })
        };
      }
    }
    
    // Database test endpoint
    if (path === '/api/test/database' && httpMethod === 'GET') {
      console.log('🔍 Testing database connection');
      
      try {
        // Test DynamoDB connection
        const tablesReady = await ensureTablesExist();
        
        if (tablesReady) {
          console.log('✅ Database connection successful');
          
          // Test basic database operations
          const testResult = await dbOperations.getAllUsers();
          
          return {
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: JSON.stringify({
              success: true,
              message: 'Database connection successful',
              data: {
                connected: true,
                usersCount: testResult ? testResult.length : 0,
                environment: {
                  NODE_ENV: process.env.NODE_ENV,
                  DB_SECRET_ARN: process.env.DB_SECRET_ARN ? 'configured' : 'missing',
                  DOCDB_HOST: process.env.DOCDB_HOST ? 'configured' : 'missing',
                  DOCDB_PORT: process.env.DOCDB_PORT || 'missing'
                },
                dependencies: {
                  dynamodb: dynamodb ? 'available' : 'missing',
                  docClient: docClient ? 'available' : 'missing',
                  aws: AWS ? 'available' : 'missing'
                }
              }
            })
          };
        } else {
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
              message: 'Database connection failed',
              data: {
                connected: false,
                environment: {
                  NODE_ENV: process.env.NODE_ENV,
                  DB_SECRET_ARN: process.env.DB_SECRET_ARN ? 'configured' : 'missing',
                  DOCDB_HOST: process.env.DOCDB_HOST ? 'configured' : 'missing',
                  DOCDB_PORT: process.env.DOCDB_PORT || 'missing'
                },
                dependencies: {
                  dynamodb: dynamodb ? 'available' : 'missing',
                  docClient: docClient ? 'available' : 'missing',
                  aws: AWS ? 'available' : 'missing'
                }
              }
            })
          };
        }
      } catch (error) {
        console.error('❌ Database test error:', error);
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
            message: 'Database test failed',
            error: error.message,
            data: {
              connected: false,
              environment: {
                NODE_ENV: process.env.NODE_ENV,
                DB_SECRET_ARN: process.env.DB_SECRET_ARN ? 'configured' : 'missing',
                DOCDB_HOST: process.env.DOCDB_HOST ? 'configured' : 'missing',
                DOCDB_PORT: process.env.DOCDB_PORT || 'missing'
              },
              dependencies: {
                mongodb: MongoClient ? 'available' : 'missing',
                aws: AWS ? 'available' : 'missing'
              }
            }
          })
        };
      }
    }
    
    // Handle OPTIONS requests for CORS
    if (httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: ''
      };
    }
    
    // 404 for unmatched routes
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      },
      body: JSON.stringify({
        error: 'Route not found',
        message: `Cannot ${httpMethod} ${path}`
      })
    };
    
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
        error: 'Internal server error',
        message: error.message
      })
    };
  }
};
