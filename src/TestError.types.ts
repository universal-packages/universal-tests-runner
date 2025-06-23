import { DiffResult } from './diff.types'

export interface ErrorDescriptor {
  message: string
  messageLocals: Record<string, string>
  expected: any
  actual: any
  difference?: DiffResult
  differences?: DiffResult[]
  allCalls?: any[]
}
