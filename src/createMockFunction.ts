import { MockFn, MockFunctionCall } from './createMockFunction.types'
import { diff } from './diff'

export function createMockFunction(): MockFn {
  const calls: MockFunctionCall[] = []
  const implementations: Array<(...args: any[]) => any> = []
  const scenarios: Array<{ args: any[]; result: any }> = []
  let defaultImplementation: ((...args: any[]) => any) | null = null

  const findMatchingScenario = (args: any[]): { args: any[]; result: any } | undefined => {
    return scenarios.find((scenario) => {
      if (scenario.args.length !== args.length) {
        return false
      }

      return scenario.args.every((expectedArg, index) => {
        return diff(expectedArg, args[index]).same
      })
    })
  }

  const mockFn = (...args: any[]): any => {
    let result: any
    let error: Error | undefined

    try {
      // Check if there's a scenario match
      const matchingScenario = findMatchingScenario(args)
      if (matchingScenario) {
        result = matchingScenario.result
      }
      // Otherwise use one-time implementation if available
      else if (implementations.length > 0) {
        const implementation = implementations.shift()!
        result = implementation(...args)
      }
      // Otherwise use default implementation if available
      else if (defaultImplementation) {
        result = defaultImplementation(...args)
      }
      // Otherwise return undefined
      else {
        result = undefined
      }
    } catch (e) {
      error = e as Error
      throw e
    } finally {
      // Record the call
      calls.push({ args, result, error })
    }

    return result
  }

  // Add properties to the mock function
  Object.defineProperties(mockFn, {
    calls: {
      get: () => calls
    },
    implement: {
      value: (implementation: (...args: any[]) => any): void => {
        defaultImplementation = implementation
      }
    },
    implementOnce: {
      value: (implementation: (...args: any[]) => any): void => {
        implementations.push(implementation)
      }
    },
    scenario: {
      value: (args: any[], result: any): void => {
        scenarios.push({ args, result })
      }
    },
    reset: {
      value: (): void => {
        calls.length = 0
        implementations.length = 0
        scenarios.length = 0
        defaultImplementation = null
      }
    },
    mockClear: {
      value: (): void => {
        calls.length = 0
      }
    }
  })

  return mockFn as MockFn
}
