'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createEventSchema,
  updateEventSchema,
  updateMetricsSchema,
  joinEventSchema,
  type CreateEventInput,
  type UpdateEventInput,
  type UpdateMetricsInput,
  type JoinEventInput,
} from '@/lib/validations'

export async function createEvent(data: CreateEventInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in to create an event' }
    }

    const validated = createEventSchema.parse(data)

    const event = await prisma.actionEvent.create({
      data: {
        title: validated.title,
        description: validated.description,
        date: new Date(validated.date),
        location: validated.location,
        latitude: validated.latitude,
        longitude: validated.longitude,
        createdById: session.user.id,
        participants: {
          create: {
            userId: session.user.id,
            role: 'ORGANIZER',
          },
        },
      },
    })

    revalidatePath('/events')
    revalidatePath('/')
    return { success: true, eventId: event.id }
  } catch (error) {
    console.error('Create event error:', error)
    return { error: 'Failed to create event' }
  }
}

export async function updateEvent(data: UpdateEventInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in' }
    }

    const validated = updateEventSchema.parse(data)
    const { id, ...updateData } = validated

    // Check if user is organizer
    const userRole = await prisma.userEventRole.findFirst({
      where: {
        eventId: id,
        userId: session.user.id,
        role: 'ORGANIZER',
      },
    })

    if (!userRole) {
      return { error: 'Only organizers can update events' }
    }

    await prisma.actionEvent.update({
      where: { id },
      data: {
        ...updateData,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
    })

    revalidatePath('/events')
    revalidatePath(`/events/${id}`)
    return { success: true }
  } catch (error) {
    console.error('Update event error:', error)
    return { error: 'Failed to update event' }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in' }
    }

    // Check if user is organizer
    const userRole = await prisma.userEventRole.findFirst({
      where: {
        eventId,
        userId: session.user.id,
        role: 'ORGANIZER',
      },
    })

    if (!userRole) {
      return { error: 'Only organizers can delete events' }
    }

    await prisma.actionEvent.delete({
      where: { id: eventId },
    })

    revalidatePath('/events')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Delete event error:', error)
    return { error: 'Failed to delete event' }
  }
}

export async function joinEvent(data: JoinEventInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in to join an event' }
    }

    const validated = joinEventSchema.parse(data)

    // Check if already joined
    const existing = await prisma.userEventRole.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: validated.eventId,
        },
      },
    })

    if (existing) {
      return { error: 'You have already joined this event' }
    }

    await prisma.userEventRole.create({
      data: {
        userId: session.user.id,
        eventId: validated.eventId,
        role: validated.role,
      },
    })

    revalidatePath(`/events/${validated.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Join event error:', error)
    return { error: 'Failed to join event' }
  }
}

export async function leaveEvent(eventId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in' }
    }

    // Check if user is organizer
    const userRole = await prisma.userEventRole.findFirst({
      where: {
        eventId,
        userId: session.user.id,
      },
    })

    if (userRole?.role === 'ORGANIZER') {
      const organizerCount = await prisma.userEventRole.count({
        where: {
          eventId,
          role: 'ORGANIZER',
        },
      })

      if (organizerCount === 1) {
        return { error: 'Cannot leave: you are the only organizer' }
      }
    }

    await prisma.userEventRole.delete({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId,
        },
      },
    })

    revalidatePath(`/events/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Leave event error:', error)
    return { error: 'Failed to leave event' }
  }
}

export async function updateMetrics(data: UpdateMetricsInput) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return { error: 'You must be logged in' }
    }

    const validated = updateMetricsSchema.parse(data)

    // Check if user is organizer
    const userRole = await prisma.userEventRole.findFirst({
      where: {
        eventId: validated.eventId,
        userId: session.user.id,
        role: 'ORGANIZER',
      },
    })

    if (!userRole) {
      return { error: 'Only organizers can update metrics' }
    }

    await prisma.actionEvent.update({
      where: { id: validated.eventId },
      data: {
        collectedWasteKg: validated.collectedWasteKg,
        plantedTrees: validated.plantedTrees,
        areaRecoveredM2: validated.areaRecoveredM2,
      },
    })

    revalidatePath(`/events/${validated.eventId}`)
    return { success: true }
  } catch (error) {
    console.error('Update metrics error:', error)
    return { error: 'Failed to update metrics' }
  }
}
