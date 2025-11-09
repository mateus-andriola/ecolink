'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createResourceSchema,
  updateResourceSchema,
  type CreateResourceInput,
  type UpdateResourceInput,
} from '@/lib/validations'

async function checkIsOrganizer(eventId: string, userId: string) {
  const userRole = await prisma.userEventRole.findFirst({
    where: {
      eventId,
      userId,
      role: 'ORGANIZER',
    },
  })
  return !!userRole
}

export async function createResource(data: CreateResourceInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in' }
    }

    const validated = createResourceSchema.parse(data)

    const isOrganizer = await checkIsOrganizer(validated.eventId, session.user.id)
    if (!isOrganizer) {
      return { error: 'Only organizers can add resources' }
    }

    await prisma.resource.create({
      data: validated,
    })

    revalidatePath(`/events/${validated.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Create resource error:', error)
    return { error: 'Failed to create resource' }
  }
}

export async function updateResource(data: UpdateResourceInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in' }
    }

    const validated = updateResourceSchema.parse(data)
    const { id, ...updateData } = validated

    const resource = await prisma.resource.findUnique({
      where: { id },
    })

    if (!resource) {
      return { error: 'Resource not found' }
    }

    const isOrganizer = await checkIsOrganizer(resource.eventId, session.user.id)
    if (!isOrganizer) {
      return { error: 'Only organizers can update resources' }
    }

    await prisma.resource.update({
      where: { id },
      data: updateData,
    })

    revalidatePath(`/events/${resource.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Update resource error:', error)
    return { error: 'Failed to update resource' }
  }
}

export async function deleteResource(resourceId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in' }
    }

    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })

    if (!resource) {
      return { error: 'Resource not found' }
    }

    const isOrganizer = await checkIsOrganizer(resource.eventId, session.user.id)
    if (!isOrganizer) {
      return { error: 'Only organizers can delete resources' }
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    })

    revalidatePath(`/events/${resource.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Delete resource error:', error)
    return { error: 'Failed to delete resource' }
  }
}
