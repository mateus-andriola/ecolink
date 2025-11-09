'use server'

import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function registerUser(data: RegisterInput) {
  try {
    const validated = registerSchema.parse(data)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { error: 'User with this email already exists' }
    }

    // Hash password
    const hashedPassword = await hash(validated.password, 10)

    // Create user
    await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
      },
    })

    revalidatePath('/auth/login')
    return { success: true }
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Failed to register user' }
  }
}
