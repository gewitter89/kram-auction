const { execSync } = require('child_process');

if (process.env.VERCEL) {
  console.log('Detected Vercel environment. Running prisma db push...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to push database schema:', error);
    process.exit(1);
  }
} else {
  console.log('Skipping prisma db push (not on Vercel).');
}
