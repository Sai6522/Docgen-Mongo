require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function resetUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/docgen');
    console.log('Connected to MongoDB');

    // Find and update HR user
    let hrUser = await User.findOne({ email: 'hr@docgen.com' });
    if (hrUser) {
      hrUser.password = 'hr123456';
      hrUser.isActive = true;
      await hrUser.save();
      console.log('✅ HR user password reset');
    } else {
      // Create HR user if doesn't exist
      hrUser = new User({
        name: 'HR Manager',
        email: 'hr@docgen.com',
        password: 'hr123456',
        role: 'hr',
        isActive: true
      });
      await hrUser.save();
      console.log('✅ HR user created');
    }

    // Find and update Staff user
    let staffUser = await User.findOne({ email: 'staff@docgen.com' });
    if (staffUser) {
      staffUser.password = 'staff123456';
      staffUser.isActive = true;
      await staffUser.save();
      console.log('✅ Staff user password reset');
    } else {
      // Create Staff user if doesn't exist
      staffUser = new User({
        name: 'Staff User',
        email: 'staff@docgen.com',
        password: 'staff123456',
        role: 'staff',
        isActive: true
      });
      await staffUser.save();
      console.log('✅ Staff user created');
    }

    console.log('\n🎉 User reset completed successfully!');
    
    // Test login for both users
    console.log('\n🧪 Testing password verification:');
    
    const hrCheck = await hrUser.comparePassword('hr123456');
    console.log('HR password check:', hrCheck ? '✅ Valid' : '❌ Invalid');
    
    const staffCheck = await staffUser.comparePassword('staff123456');
    console.log('Staff password check:', staffCheck ? '✅ Valid' : '❌ Invalid');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

resetUsers();
