import { prisma } from '@marionette/db'

async function main() {
  const email = 'daniel@marionette.studio'
  const password = 'password123'
  const passwordHash = await Bun.password.hash(password, 'argon2id')
  
  await prisma.user.update({
    where: { email },
    data: { passwordHash }
  })
  
  console.log(`Successfully reset password for ${email}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
