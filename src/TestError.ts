import { ErrorDescriptor } from './TestError.types'
import { DiffResult } from './diff.types'

export class TestError extends Error {
  public override readonly message: string
  public readonly messageLocals: Record<string, string>
  public readonly expected: any
  public readonly actual: any
  public readonly difference?: DiffResult
  public readonly differences?: DiffResult[]
  public readonly allCalls?: any[]

  public constructor(descriptor: ErrorDescriptor) {
    super()
    this.message = descriptor.message
    this.messageLocals = descriptor.messageLocals
    this.expected = descriptor.expected
    this.actual = descriptor.actual
    this.difference = descriptor.difference
    this.differences = descriptor.differences
    this.allCalls = descriptor.allCalls
  }
}
