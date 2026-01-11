const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'djforever2'; // Production database

async function checkAddressFields() {
  try {
    await mongoose.connect(uri, { dbName });
    console.log('✅ Connected to production database:', dbName);
    
    const db = mongoose.connection.db;
    
    // Get a sample user to check schema
    const sampleUser = await db.collection('users').findOne({});
    
    if (!sampleUser) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('\n=== Address Field Verification ===');
    console.log('Has streetAddress field:', 'streetAddress' in sampleUser);
    console.log('Has addressLine2 field:', 'addressLine2' in sampleUser);
    console.log('Has city field:', 'city' in sampleUser);
    console.log('Has state field:', 'state' in sampleUser);
    console.log('Has zipCode field:', 'zipCode' in sampleUser);
    console.log('Has country field:', 'country' in sampleUser);
    
    // Count statistics
    const totalUsers = await db.collection('users').countDocuments({});
    const usersWithAddress = await db.collection('users').countDocuments({
      $or: [
        { streetAddress: { $exists: true, $ne: '' } },
        { city: { $exists: true, $ne: '' } },
        { state: { $exists: true, $ne: '' } }
      ]
    });
    
    console.log('\n=== Statistics ===');
    console.log('Total users:', totalUsers);
    console.log('Users with address data:', usersWithAddress);
    
    // Show sample address if exists
    if (sampleUser.streetAddress || sampleUser.city || sampleUser.state) {
      console.log('\n=== Sample Address Data ===');
      console.log('Street:', sampleUser.streetAddress || '(empty)');
      console.log('Address Line 2:', sampleUser.addressLine2 || '(empty)');
      console.log('City:', sampleUser.city || '(empty)');
      console.log('State:', sampleUser.state || '(empty)');
      console.log('Zip:', sampleUser.zipCode || '(empty)');
      console.log('Country:', sampleUser.country || '(empty)');
    } else {
      console.log('\n✓ Address fields exist in schema but no data populated yet');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from database');
  }
}

checkAddressFields();
