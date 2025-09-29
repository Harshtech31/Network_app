// Simple MongoDB test
console.log('Testing MongoDB require...');

try {
  const mongodb = require('mongodb');
  console.log('MongoDB loaded:', !!mongodb);
  console.log('MongoClient available:', !!mongodb.MongoClient);
} catch (error) {
  console.log('MongoDB error:', error.message);
}

exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'MongoDB test complete' })
  };
};
