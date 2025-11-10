/*
 * Shared PrismaClient singleton for scripts
 */
const { PrismaClient } = require('@prisma/client')
const path = require('path')
const dotenv = require('dotenv')

// Ensure .env is loaded when running scripts directly
dotenv.config({ path: path.resolve(__dirname, '../.env') })

let prismaInstance = null

function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient()
  }
  return prismaInstance
}

async function disconnect() {
  if (prismaInstance) {
    await prismaInstance.$disconnect()
    prismaInstance = null
  }
}

module.exports = { getPrisma, disconnect }