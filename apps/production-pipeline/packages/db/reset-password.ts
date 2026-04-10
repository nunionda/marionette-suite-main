import { prisma } from '@marionette/db'

async function main() {
  const email = process.env.RESET_EMAIL ?? 'daniel@marionette.studio'
  const password = process.env.RESET_PASSWORD
  if (!password) throw new Error('RESET_PASSWORD env var required')
  const passwordHash = await Bun.password.hash(password, 'argon2id')
  
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  })
  
  console.log(`Successfully reset password for ${email}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
