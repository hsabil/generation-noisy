import { PrismaClient } from '../generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const sql = neon(connectionString)
const adapter = new PrismaNeon({ connectionString } as any)

export const prisma = new PrismaClient({ adapter } as any)
