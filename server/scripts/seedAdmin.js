import 'dotenv/config';
import User from '../src/models/user.js';
import { connectDB, closeDB } from '../config/db.js';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@ormayundo.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Ormayundo2026!';

async function seedAdmin() {
  console.log('====================================================');
  console.log('      Ormayundo Administrator Seed Script           ');
  console.log('====================================================');
  console.log(`Target Email: ${ADMIN_EMAIL}`);

  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI environment variable is missing in .env');
    process.exit(1);
  }

  try {
    await connectDB(3, 2000);

    let admin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

    if (admin) {
      console.log(`[SEED] Existing account found for ${ADMIN_EMAIL}. Updating role to 'admin' and setting password...`);
      admin.role = 'admin';
      admin.isBlocked = false;
      admin.blockedReason = '';
      admin.password = ADMIN_PASSWORD; // Hashed automatically by userSchema pre('save')
      admin.tokenVersion = (admin.tokenVersion || 0) + 1;
      await admin.save();
      console.log('✅ Administrator account updated successfully.');
    } else {
      console.log(`[SEED] Creating brand-new administrator account for ${ADMIN_EMAIL}...`);
      admin = await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD, // Hashed automatically by pre('save')
        role: 'admin',
        isBlocked: false,
        tokenVersion: 0
      });
      console.log('✅ Administrator account created successfully.');
    }

    console.log('====================================================');
    console.log(' Administrator Credentials Configured:');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Failed to seed administrator:', error.message || error);
    process.exitCode = 1;
  } finally {
    await closeDB();
    console.log('[SEED] Database connection closed.');
  }
}

seedAdmin();
