const mongoose = require('mongoose');
const AWS = require('aws-sdk');

let isConnected = false;

// Get DocumentDB credentials from AWS Secrets Manager
const getDocumentDBCredentials = async () => {
  const secretsManager = new AWS.SecretsManager({ region: process.env.AWS_REGION || 'us-east-1' });
  
  try {
    const secretId = process.env.DB_SECRET_ARN || 'network-staging-db-credentials';
    const secret = await secretsManager.getSecretValue({ SecretId: secretId }).promise();
    const credentials = JSON.parse(secret.SecretString);
    
    return {
      username: credentials.username,
      password: credentials.password,
      host: process.env.DOCDB_HOST || 'network-staging-cluster.cluster-cm90g0mwgqdr.us-east-1.docdb.amazonaws.com',
      port: process.env.DOCDB_PORT || 27017,
      dbname: credentials.dbname || 'networkdb'
    };
  } catch (error) {
    console.error('❌ Error getting DocumentDB credentials:', error);
    // Fallback for development/testing
    return {
      username: 'networkadminstaging',
      password: 'fallback-password',
      host: 'network-staging-cluster.cluster-cm90g0mwgqdr.us-east-1.docdb.amazonaws.com',
      port: 27017,
      dbname: 'network_staging'
    };
  }
};

const connectDB = async () => {
  if (isConnected) {
    console.log('📦 Using existing MongoDB connection');
    return mongoose.connection;
  }

  try {
    console.log('🔌 Connecting to DocumentDB...');
    
    // Get credentials
    const credentials = await getDocumentDBCredentials();
    
    // Build DocumentDB connection string
    const mongoUri = `mongodb://${credentials.username}:${credentials.password}@${credentials.host}:${credentials.port}/${credentials.dbname}?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;
    
    // Lambda-optimized connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Reduced for Lambda
      socketTimeoutMS: 30000,
      maxPoolSize: 5, // Reduced pool size for Lambda
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      bufferMaxEntries: 0,
      bufferCommands: false,
      // DocumentDB specific options
      ssl: true,
      sslValidate: false, // DocumentDB uses self-signed certificates
      sslCA: process.env.DOCDB_CA_PATH || undefined, // Path to DocumentDB CA certificate
    };

    const conn = await mongoose.connect(mongoUri, options);
    
    isConnected = true;
    console.log(`✅ DocumentDB Connected: ${conn.connection.host}`);
    
    // Connection event handlers (simplified for Lambda)
    mongoose.connection.on('error', (error) => {
      console.error('❌ DocumentDB connection error:', error);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ DocumentDB disconnected');
      isConnected = false;
    });

    return conn;
    
  } catch (error) {
    console.error('❌ DocumentDB connection failed:', error);
    isConnected = false;
    
    // For Lambda, we don't exit the process, just throw the error
    throw new Error(`DocumentDB connection failed: ${error.message}`);
  }
};

// Export both the connection function and a check for connection status
module.exports = {
  connectDB,
  isConnected: () => isConnected,
  getConnection: () => mongoose.connection
};
