import path from 'path'
import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import('@prisma/adapter-neon')
      const connectionString = process.env.DATABASE_URL!
      return new PrismaNeon({ connectionString })
    },
  },
})
