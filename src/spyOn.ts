import { MockFunctionCall } from './createMockFunction.types'
import { diff } from './diff'
import { SpyFn } from './spyOn.types'

export function spyOn(object: any, propertyPath: string): SpyFn {
  // Parse the property path to support nested properties like 'property.deep'
  const pathParts = propertyPath.split('.')

  // Navigate to the parent object and get the property name
  let target = object
  for (let i = 0; i < pathParts.length - 1; i++) {
    if (target[pathParts[i]] === undefined || target[pathParts[i]] === null) {
      throw new Error(`Cannot spy on ${propertyPath}: ${pathParts.slice(0, i + 1).join('.')} is undefined or null`)
    }
    target = target[pathParts[i]]
  }

  const propertyName = pathParts[pathParts.length - 1]

  // Get the property descriptor to handle both data properties and accessor properties
  let originalDescriptor = Object.getOwnPropertyDescriptor(target, propertyName)

  // If not found on the object itself, check the prototype chain
  if (!originalDescriptor) {
    let prototype = Object.getPrototypeOf(target)
    while (prototype && !originalDescriptor) {
      originalDescriptor = Object.getOwnPropertyDescriptor(prototype, propertyName)
      prototype = Object.getPrototypeOf(prototype)
    }
  }

  if (!originalDescriptor) {
    throw new Error(`Cannot spy on ${propertyPath}: property does not exist`)
  }

  // Get the original value/function
  const originalValue = originalDescriptor.value !== undefined ? originalDescriptor.value : originalDescriptor.get ? originalDescriptor.get() : undefined

  // Track calls and implementations (same as createMockFunction)
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

  // Create the spy function that preserves original behavior
  const spyFn = (...args: any[]): any => {
    let result: any
    let error: Error | undefined

    try {
      // Check if there's a scenario match first
      const matchingScenario = findMatchingScenario(args)
      if (matchingScenario) {
        result = matchingScenario.result
      }
      // Otherwise use one-time implementation if available
      else if (implementations.length > 0) {
        const implementation = implementations.shift()!
        result = implementation.apply(target, args)
      }
      // Otherwise use default implementation if available
      else if (defaultImplementation) {
        result = defaultImplementation.apply(target, args)
      }
      // Otherwise call the original function/method (preserving 'this' context)
      else if (typeof originalValue === 'function') {
        result = originalValue.apply(target, args)
      } else {
        // For non-function properties, just return the value
        result = originalValue
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

  // Replace the original property with our spy
  if ('value' in originalDescriptor || 'writable' in originalDescriptor) {
    // It's a data property - preserve all descriptor attributes
    Object.defineProperty(target, propertyName, {
      value: spyFn,
      writable: originalDescriptor.writable,
      enumerable: originalDescriptor.enumerable,
      configurable: originalDescriptor.configurable
    })
  } else if ('get' in originalDescriptor || 'set' in originalDescriptor) {
    // It's an accessor property - replace with a data property for simplicity
    // This covers most use cases where we want to spy on methods
    Object.defineProperty(target, propertyName, {
      value: spyFn,
      writable: true,
      enumerable: originalDescriptor.enumerable,
      configurable: originalDescriptor.configurable
    })
  }

  // Add all the mock function properties
  Object.defineProperties(spyFn, {
    calls: {
      get: () => calls,
      configurable: true
    },
    implement: {
      value: (implementation: (...args: any[]) => any): void => {
        defaultImplementation = implementation
      },
      configurable: true
    },
    implementOnce: {
      value: (implementation: (...args: any[]) => any): void => {
        implementations.push(implementation)
      },
      configurable: true
    },
    scenario: {
      value: (args: any[], result: any): void => {
        scenarios.push({ args, result })
      },
      configurable: true
    },
    reset: {
      value: (): void => {
        calls.length = 0
        implementations.length = 0
        scenarios.length = 0
        defaultImplementation = null
      },
      configurable: true
    },
    mockClear: {
      value: (): void => {
        calls.length = 0
      },
      configurable: true
    },
    restore: {
      value: (): void => {
        // Restore the original property descriptor
        Object.defineProperty(target, propertyName, originalDescriptor)

        // Clear all tracking data
        calls.length = 0
        implementations.length = 0
        scenarios.length = 0
        defaultImplementation = null
      },
      configurable: true
    }
  })

  return spyFn as SpyFn
}
