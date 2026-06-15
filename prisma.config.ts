import 'dotenv/config'
import { defineConfig, env } from '@prisma/config'

export default defineConfig({
  datasource: {
    url: env('POSTGRES_PRISMA_URL'),
  },
  migrations: {
    path: './prisma/migrations',
  },
})
