const mongoose = require('mongoose');
const UserAnswer = require('./models/UserAnswer');

// Test data
const testUserAnswer = {
  userId: "test-user-123",
  mockIdRef: "test-interview-123",
  question: "What is React?",
  correct_ans: "React is a JavaScript library for building user interfaces.",
  user_ans: "React is a frontend framework for building web applications.",
  feedback: "Good understanding of React's purpose, but it's technically a library, not a framework.",
  rating: 8,
  confidence: 85,
  areas: ["Technical Accuracy", "Concept Understanding"],
  answerLength: 67,
  relevanceScore: 85,
  timestamp: new Date()
};

async function testUserAnswerCreation() {
  try {
    console.log('Testing UserAnswer model...');
    
    // Test creating a user answer
    const userAnswer = new UserAnswer(testUserAnswer);
    const savedAnswer = await userAnswer.save();
    
    console.log('✅ UserAnswer created successfully:', savedAnswer._id);
    
    // Test finding the user answer
    const foundAnswer = await UserAnswer.findById(savedAnswer._id);
    console.log('✅ UserAnswer found:', foundAnswer.question);
    
    // Test validation
    const invalidAnswer = new UserAnswer({
      userId: "test-user-123",
      // Missing required fields
    });
    
    try {
      await invalidAnswer.save();
      console.log('❌ Validation failed - should have thrown error');
    } catch (error) {
      console.log('✅ Validation working correctly:', error.message);
    }
    
    // Clean up
    await UserAnswer.findByIdAndDelete(savedAnswer._id);
    console.log('✅ Test cleanup completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mohammedsahal1243:sahal124867@cluster0.1eaz3.mongodb.net/future_find', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Connected to MongoDB');
    return testUserAnswerCreation();
  })
  .then(() => {
    console.log('All tests completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Test setup failed:', err);
    process.exit(1);
  });
}

module.exports = { testUserAnswerCreation };
