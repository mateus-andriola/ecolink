'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createSurveyResponseSchema,
  type CreateSurveyResponseInput,
} from '@/lib/validations'

export async function submitSurvey(data: CreateSurveyResponseInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in' }
    }

    const validated = createSurveyResponseSchema.parse(data)

    // Check if user is participant
    const participation = await prisma.userEventRole.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: validated.eventId,
        },
      },
    })

    if (!participation) {
      return { error: 'You must be a participant to submit a survey' }
    }

    // Check if already submitted for this phase
    const existing = await prisma.surveyResponse.findFirst({
      where: {
        userId: session.user.id,
        eventId: validated.eventId,
        phase: validated.phase,
      },
    })

    if (existing) {
      return { error: `You have already submitted the ${validated.phase.toLowerCase().replace('_', ' ')} survey` }
    }

    await prisma.surveyResponse.create({
      data: {
        userId: session.user.id,
        eventId: validated.eventId,
        phase: validated.phase,
        answers: validated.answers,
      },
    })

    revalidatePath(`/events/${validated.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Submit survey error:', error)
    return { error: 'Failed to submit survey' }
  }
}
