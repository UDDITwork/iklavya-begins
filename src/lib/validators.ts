import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
  college: z.string().min(2, 'College name is required').max(200),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerStep1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  phone: z.string().optional(),
  college: z.string().min(2, 'Institution name is required').max(200),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

export const registerStep2Schema = z.object({
  education_level: z.string().min(1, 'Please select your education level'),
  class_or_year: z.string().optional(),
  institution: z.string().optional(),
  board: z.string().optional(),
  stream: z.string().optional(),
  cgpa: z.string().optional(),
})

export const registerStep3Schema = z.object({
  parent_occupation: z.string().optional(),
  siblings: z.string().optional(),
  income_range: z.string().optional(),
  hobbies: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  strengths: z.array(z.string()).max(5, 'Maximum 5 strengths').optional(),
  weaknesses: z.array(z.string()).max(5, 'Maximum 5 weaknesses').optional(),
  languages: z.array(z.string()).optional(),
  career_aspiration_raw: z.string().optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterStep1Input = z.infer<typeof registerStep1Schema>
export type RegisterStep2Input = z.infer<typeof registerStep2Schema>
export type RegisterStep3Input = z.infer<typeof registerStep3Schema>
