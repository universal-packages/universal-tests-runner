import { MockFn } from './createMockFunction.types'

export interface SpyFn extends MockFn {
  restore(): void
}
