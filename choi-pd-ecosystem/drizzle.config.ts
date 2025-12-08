export default {
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  driver: 'libsql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'file:./data/database.db',
  },
};
