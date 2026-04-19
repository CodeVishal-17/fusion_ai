const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aifusion';

console.log('--- AIFusion Diagnostics ---');
console.log('Target URI:', uri);

mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log('✅ SUCCESS: MongoDB is reachable and connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ FAILURE: Could not connect to MongoDB.');
        console.error('Error Details:', err.message);
        if (err.message.includes('ECONNREFUSED')) {
            console.log('\nTIP: It looks like the MongoDB service is not running on your machine.');
        }
        process.exit(1);
    });
