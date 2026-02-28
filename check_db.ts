import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import dotenv from 'dotenv'

dotenv.config()

const url = process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const adapter = new PrismaMariaDb(url)
const prisma = new PrismaClient({ adapter })

async function main() {
  const questions = await prisma.question.findMany()
  console.log('Questions in DB:', JSON.stringify(questions, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })