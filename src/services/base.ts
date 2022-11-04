import type { Dayjs } from 'dayjs'
import { customAlphabet } from 'nanoid'

//==========================================================================
//
//  Interfaces
//
//==========================================================================

interface Entity {
  id: string
}

interface APITimestampEntity extends Entity {
  created_at: string
  updated_at: string
}

interface TimestampEntity extends Entity {
  createdAt: Dayjs
  updatedAt: Dayjs
}

type ItemsChangeType = 'Add' | 'Update' | 'Remove'

//==========================================================================
//
//  Implementation
//
//==========================================================================

function generateId(): string {
  const nanoid = customAlphabet(
    '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    20
  )
  return nanoid()
}

//==========================================================================
//
//  Export
//
//==========================================================================

export { generateId }

export type { Entity, ItemsChangeType, APITimestampEntity, TimestampEntity }
