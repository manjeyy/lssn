import { Provider } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DB = 'DB';
export type typeDB = NodePgDatabase<typeof schema>;

export const dbProvider: Provider = {
    provide: DB,
    useFactory: async () => {        
        
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.ENV === 'PROD' ? { rejectUnauthorized: false } : false,
        });

        process.on('SIGTERM', async () => {
            await pool.end();
        });

        return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    },
};