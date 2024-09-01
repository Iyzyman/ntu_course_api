import * as dotenv from 'dotenv'
import type {Config} from 'drizzle-kit'
dotenv.config()

export default {
  schema: './src/modules/drizzle/schema.ts',
  out: './migration',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? '',
  },
} satisfies Config
