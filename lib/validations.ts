import { z } from 'zod'

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

// Event schemas
export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  location: z.string().min(3, 'Location is required'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.string(),
})

export const updateMetricsSchema = z.object({
  eventId: z.string(),
  collectedWasteKg: z.number().min(0).optional(),
  plantedTrees: z.number().int().min(0).optional(),
  areaRecoveredM2: z.number().min(0).optional(),
})

// Resource schemas
export const createResourceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  eventId: z.string(),
})

export const updateResourceSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
})

// Survey schemas
export const createSurveyResponseSchema = z.object({
  eventId: z.string(),
  phase: z.enum(['PRE_INTERVENTION', 'POST_INTERVENTION']),
  answers: z.record(z.string(), z.any()),
})

// Event role schemas
export const joinEventSchema = z.object({
  eventId: z.string(),
  role: z.enum(['ORGANIZER', 'PARTNER', 'VOLUNTEER']),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type UpdateMetricsInput = z.infer<typeof updateMetricsSchema>
export type CreateResourceInput = z.infer<typeof createResourceSchema>
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>
export type CreateSurveyResponseInput = z.infer<typeof createSurveyResponseSchema>
export type JoinEventInput = z.infer<typeof joinEventSchema>
