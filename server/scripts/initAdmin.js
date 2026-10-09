const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/Admin');

/**
 * CLI script to securely initialize or seed the first administrator.
 * Usage:
 *   node scripts/initAdmin.js --email admin@profitgym.com --password SecurePassword123 --name "Floor Director"
 * Or set environment variables: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME
 */
const initAdmin = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: MONGODB_URI is not defined in server/.env.');
    console.error('Please configure your MongoDB Atlas connection string before initializing admin.');
    process.exit(1);
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  const getArg = (flag) => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
  };

  const email = getArg('--email') || process.env.ADMIN_EMAIL || 'admin@profitgym.com';
  const password = getArg('--password') || process.env.ADMIN_PASSWORD;
  const name = getArg('--name') || process.env.ADMIN_NAME || 'Floor Director';
  const role = getArg('--role') || 'superadmin';
  const force = args.includes('--force');

  if (!password || password.length < 8) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: A secure password of at least 8 characters is required.');
    console.log('Example usage:');
    console.log('  node scripts/initAdmin.js --email owner@profitgym.com --password YourSecretPass123 --name "Club Owner"');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('\x1b[32m%s\x1b[0m', 'Connected to database.');

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

    if (existingAdmin && !force) {
      console.log('\x1b[33m%s\x1b[0m', `Admin with email "${email}" already exists. (Use --force to overwrite password)`);
      await mongoose.disconnect();
      process.exit(0);
    }

    if (existingAdmin && force) {
      existingAdmin.password = password;
      existingAdmin.name = name;
      existingAdmin.role = role;
      await existingAdmin.save();
      console.log('\x1b[32m%s\x1b[0m', `Admin credentials updated successfully for: ${email}`);
    } else {
      await Admin.create({
        email: email.toLowerCase(),
        password,
        name,
        role,
      });
      console.log('\x1b[32m%s\x1b[0m', `First administrator created successfully:`);
      console.log(`- Email: ${email}`);
      console.log(`- Name:  ${name}`);
      console.log(`- Role:  ${role}`);
    }

    await mongoose.disconnect();
    console.log('Database disconnected cleanly.');
    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Failed to initialize admin: ${error.message}`);
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

initAdmin();
