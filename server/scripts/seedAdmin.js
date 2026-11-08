import 'dotenv/config';
import User from '../src/models/user.js';
import { connectDB, closeDB } from '../config/db.js';
import { USER_ROLES, DEFAULT_ADMIN_CREDENTIALS, MESSAGES } from '../src/utils/constants.js';

// Credentials loaded primarily from environment variables (.env) with centralized constants fallback
const hasEnvEmail = Boolean(process.env.ADMIN_EMAIL);
const hasEnvPassword = Boolean(process.env.ADMIN_PASSWORD);
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_CREDENTIALS.EMAIL).trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_CREDENTIALS.PASSWORD;

async function seedAdmin() {
  console.log('====================================================');
  console.log('      Ormayundo Administrator Seed Script           ');
  console.log('====================================================');
  console.log(`Source Email:    ${hasEnvEmail ? 'Environment (.env)' : 'Default Constant'}`);
  console.log(`Source Password: ${hasEnvPassword ? 'Environment (.env)' : 'Default Constant'}`);
  console.log(`Target Email:    ${ADMIN_EMAIL}`);

  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: MONGODB_URI environment variable is missing in .env');
    process.exit(1);
  }

  try {
    await connectDB(3, 2000);

    let admin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

    if (admin) {
      console.log(`[SEED] Existing account found for ${ADMIN_EMAIL}. Updating role to '${USER_ROLES.ADMIN}' and updating password...`);
      admin.role = USER_ROLES.ADMIN;
      admin.isBlocked = false;
      admin.blockedReason = '';
      admin.password = ADMIN_PASSWORD; // Automatically hashed by userSchema pre('save') hook
      admin.tokenVersion = (admin.tokenVersion || 0) + 1; // Invalidate previous sessions
      await admin.save();
      console.log(`✅ ${MESSAGES.SUCCESS.ADMIN_SEEDED}`);
    } else {
      console.log(`[SEED] Creating brand-new administrator account for ${ADMIN_EMAIL}...`);
      admin = await User.create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: USER_ROLES.ADMIN,
        isBlocked: false,
        tokenVersion: 0
      });
      console.log(`✅ ${MESSAGES.SUCCESS.ADMIN_SEEDED}`);
    }

    console.log('====================================================');
    console.log(' Administrator Credentials Configured:');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   Role:     ${USER_ROLES.ADMIN}`);
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
