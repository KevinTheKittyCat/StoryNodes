import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from "@shared/prisma";
import * as dotenv from 'dotenv';

dotenv.config({ path: ['.env.development.local', '.env'] });

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables');
}
const connectionString = `${process.env.DATABASE_URL}`;

const prisma = new PrismaClient({ accelerateUrl: connectionString, }).$extends(withAccelerate());
export { prisma };


