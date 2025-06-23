export type MockFunctionCall = {
  args: any[]
  result: any
  error?: Error
}

export interface MockFn {
  (...args: any[]): any
  calls: MockFunctionCall[]
  implement: (implementation: (...args: any[]) => any) => void
  implementOnce: (implementation: (...args: any[]) => any) => void
  scenario: (args: any[], result: any) => void
  reset: () => void
  mockClear: () => void
}
