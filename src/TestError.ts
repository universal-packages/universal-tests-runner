import { ErrorDescriptor, MessageLocal } from './TestError.types'
import { DiffResult } from './diff.types'

export class TestError extends Error {
  public override readonly message: string
  public readonly messageLocals: Record<string, MessageLocal>
  public readonly difference?: DiffResult
  public readonly differences?: DiffResult[]
  public readonly allCalls?: any[]

  public constructor(descriptor: ErrorDescriptor) {
    super()
    this.message = descriptor.message
    this.messageLocals = descriptor.messageLocals
    this.difference = descriptor.difference
    this.differences = descriptor.differences
    this.allCalls = descriptor.allCalls
  }
}
