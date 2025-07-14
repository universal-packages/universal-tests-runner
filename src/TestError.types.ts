import { DiffResult } from './diff.types'

export type ValueType = 'string' | 'number' | 'boolean' | 'null' | 'undefined' | 'object' | 'array' | 'function' | 'instanceOf' | 'asymmetric-assertion' | 'symbol'

export interface MessageLocal {
  representation: string
  type: ValueType
}
export interface ErrorDescriptor {
  message: string
  messageLocals: Record<string, MessageLocal>
  difference?: DiffResult
  differences?: DiffResult[]
  allCalls?: any[]
}
