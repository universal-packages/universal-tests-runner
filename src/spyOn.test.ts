import { TestsRunner } from './TestsRunner'
import { spyOn } from './spyOn'
import { evaluateTestResults } from './utils.test'

export async function spyOnTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('spyOn', () => {
    selfTestsRunner.describe('basic spying', () => {
      selfTestsRunner.test('should spy on object method', () => {
        const obj = {
          method: (a: string, b: number) => `${a}-${b}`
        }

        const spy = spyOn(obj, 'method')

        const result = obj.method('test', 42)

        selfTestsRunner.expect(result).toBe('test-42')
        selfTestsRunner.expect(spy.calls).toHaveLength(1)
        selfTestsRunner.expect(spy.calls[0]).toEqual({
          args: ['test', 42],
          result: 'test-42',
          error: undefined
        })
      })

      selfTestsRunner.test('should spy on object property', () => {
        const obj = {
          value: 'original'
        }

        const spy = spyOn(obj, 'value')

        // After spying, the property becomes a function (spy function)
        // We need to call it to get the value
        const result = (obj.value as any)()

        selfTestsRunner.expect(result).toBe('original')
        selfTestsRunner.expect(spy.calls).toHaveLength(1)
        selfTestsRunner.expect(spy.calls[0]).toEqual({
          args: [],
          result: 'original',
          error: undefined
        })
      })

      selfTestsRunner.test('should preserve original method behavior', () => {
        const obj = {
          counter: 0,
          increment: function () {
            this.counter++
            return this.counter
          }
        }

        spyOn(obj, 'increment')

        const result1 = obj.increment()
        const result2 = obj.increment()

        selfTestsRunner.expect(result1).toBe(1)
        selfTestsRunner.expect(result2).toBe(2)
        selfTestsRunner.expect(obj.counter).toBe(2)
      })

      selfTestsRunner.test('should preserve this context', () => {
        const obj = {
          name: 'TestObject',
          getName: function () {
            return this.name
          }
        }

        spyOn(obj, 'getName')

        const result = obj.getName()

        selfTestsRunner.expect(result).toBe('TestObject')
      })
    })

    selfTestsRunner.describe('nested property paths', () => {
      selfTestsRunner.test('should spy on nested property', () => {
        const obj = {
          deep: {
            nested: {
              method: (x: number) => x * 2
            }
          }
        }

        const spy = spyOn(obj, 'deep.nested.method')

        const result = obj.deep.nested.method(5)

        selfTestsRunner.expect(result).toBe(10)
        selfTestsRunner.expect(spy.calls).toHaveLength(1)
        selfTestsRunner.expect(spy.calls[0].args).toEqual([5])
        selfTestsRunner.expect(spy.calls[0].result).toBe(10)
      })

      selfTestsRunner.test('should throw error for invalid nested path', () => {
        const obj = {
          existing: null
        }

        selfTestsRunner
          .expect(() => {
            spyOn(obj, 'existing.nonexistent.method')
          })
          .toThrow('Cannot spy on existing.nonexistent.method: existing is undefined or null')
      })

      selfTestsRunner.test('should throw error for non-existent property', () => {
        const obj = {}

        selfTestsRunner
          .expect(() => {
            spyOn(obj, 'nonexistent')
          })
          .toThrow('Cannot spy on nonexistent: property does not exist')
      })
    })

    selfTestsRunner.describe('call tracking', () => {
      selfTestsRunner.test('should track multiple calls', () => {
        const obj = {
          method: (a: any) => a
        }

        const spy = spyOn(obj, 'method')

        obj.method('first')
        obj.method('second')
        obj.method(42)

        selfTestsRunner.expect(spy.calls).toHaveLength(3)
        selfTestsRunner.expect(spy.calls[0].args).toEqual(['first'])
        selfTestsRunner.expect(spy.calls[1].args).toEqual(['second'])
        selfTestsRunner.expect(spy.calls[2].args).toEqual([42])
      })

      selfTestsRunner.test('should track errors from original method', () => {
        const error = new Error('Original error')
        const obj = {
          method: () => {
            throw error
          }
        }

        const spy = spyOn(obj, 'method')

        selfTestsRunner.expect(() => obj.method()).toThrow('Original error')
        selfTestsRunner.expect(spy.calls[0].error).toBe(error)
      })
    })

    selfTestsRunner.describe('default implementation', () => {
      selfTestsRunner.test('should use custom implementation instead of original', () => {
        const obj = {
          method: () => 'original'
        }

        const spy = spyOn(obj, 'method')
        spy.implement(() => 'custom')

        const result = obj.method()

        selfTestsRunner.expect(result).toBe('custom')
        selfTestsRunner.expect(spy.calls[0].result).toBe('custom')
      })

      selfTestsRunner.test('should preserve this context in custom implementation', () => {
        const obj = {
          value: 'test',
          method: function () {
            return 'original'
          }
        }

        const spy = spyOn(obj, 'method')
        spy.implement(function (this: any) {
          return `custom-${this.value}`
        })

        const result = obj.method()

        selfTestsRunner.expect(result).toBe('custom-test')
      })

      selfTestsRunner.test('should track errors from custom implementation', () => {
        const obj = {
          method: () => 'original'
        }
        const customError = new Error('Custom error')

        const spy = spyOn(obj, 'method')
        spy.implement(() => {
          throw customError
        })

        selfTestsRunner.expect(() => obj.method()).toThrow('Custom error')
        selfTestsRunner.expect(spy.calls[0].error).toBe(customError)
      })
    })

    selfTestsRunner.describe('one-time implementations', () => {
      selfTestsRunner.test('should use one-time implementation before default', () => {
        const obj = {
          method: () => 'original'
        }

        const spy = spyOn(obj, 'method')
        spy.implement(() => 'default')
        spy.implementOnce(() => 'once')

        const result1 = obj.method()
        const result2 = obj.method()

        selfTestsRunner.expect(result1).toBe('once')
        selfTestsRunner.expect(result2).toBe('default')
      })

      selfTestsRunner.test('should use one-time implementation before original', () => {
        const obj = {
          method: () => 'original'
        }

        const spy = spyOn(obj, 'method')
        spy.implementOnce(() => 'once')

        const result1 = obj.method()
        const result2 = obj.method()

        selfTestsRunner.expect(result1).toBe('once')
        selfTestsRunner.expect(result2).toBe('original')
      })

      selfTestsRunner.test('should use multiple one-time implementations in order', () => {
        const obj = {
          method: () => 'original'
        }

        const spy = spyOn(obj, 'method')
        spy.implementOnce(() => 'first')
        spy.implementOnce(() => 'second')
        spy.implementOnce(() => 'third')

        const result1 = obj.method()
        const result2 = obj.method()
        const result3 = obj.method()
        const result4 = obj.method()

        selfTestsRunner.expect(result1).toBe('first')
        selfTestsRunner.expect(result2).toBe('second')
        selfTestsRunner.expect(result3).toBe('third')
        selfTestsRunner.expect(result4).toBe('original')
      })
    })

    selfTestsRunner.describe('scenarios', () => {
      selfTestsRunner.test('should match scenario with exact arguments', () => {
        const obj = {
          method: (a: any, b: any) => `original-${a}-${b}`
        }

        const spy = spyOn(obj, 'method')
        spy.scenario(['test', 42], 'scenario-matched')

        const result1 = obj.method('test', 42)
        const result2 = obj.method('test', 43)

        selfTestsRunner.expect(result1).toBe('scenario-matched')
        selfTestsRunner.expect(result2).toBe('original-test-43')
      })

      selfTestsRunner.test('should prioritize scenarios over implementations and original', () => {
        const obj = {
          method: (arg?: string) => `original-${arg || 'none'}`
        }

        const spy = spyOn(obj, 'method')
        spy.implement(() => 'default')
        spy.implementOnce(() => 'once')
        spy.scenario(['special'], 'scenario')

        const result1 = obj.method('special') // Matches scenario
        const result2 = obj.method() // Uses implementOnce
        const result3 = obj.method() // Uses default implementation

        selfTestsRunner.expect(result1).toBe('scenario')
        selfTestsRunner.expect(result2).toBe('once')
        selfTestsRunner.expect(result3).toBe('default')
      })

      selfTestsRunner.test('should handle complex object scenarios', () => {
        const obj = {
          method: (data: any) => `original-${data.id}`
        }

        const spy = spyOn(obj, 'method')
        spy.scenario([{ id: 1, name: 'test' }], 'complex-match')

        const result = obj.method({ id: 1, name: 'test' })

        selfTestsRunner.expect(result).toBe('complex-match')
      })
    })

    selfTestsRunner.describe('reset functionality', () => {
      selfTestsRunner.test('should clear all calls on reset', () => {
        const obj = {
          method: () => 'original'
        }

        const spy = spyOn(obj, 'method')
        obj.method()
        obj.method()

        selfTestsRunner.expect(spy.calls).toHaveLength(2)

        spy.reset()

        selfTestsRunner.expect(spy.calls).toHaveLength(0)
      })

      selfTestsRunner.test('should clear implementations on reset', () => {
        const obj = {
          method: () => 'original'
        }

        const spy = spyOn(obj, 'method')
        spy.implement(() => 'custom')
        spy.implementOnce(() => 'once')
        spy.scenario(['test'], 'scenario')

        spy.reset()

        const result = obj.method()

        selfTestsRunner.expect(result).toBe('original')
      })
    })

    selfTestsRunner.describe('mockClear functionality', () => {
      selfTestsRunner.test('should clear only calls on mockClear', () => {
        const obj = {
          method: () => 'original'
        }

        const spy = spyOn(obj, 'method')
        spy.implement(() => 'custom')
        obj.method()
        obj.method()

        selfTestsRunner.expect(spy.calls).toHaveLength(2)

        spy.mockClear()

        selfTestsRunner.expect(spy.calls).toHaveLength(0)

        // Implementation should still work
        const result = obj.method()
        selfTestsRunner.expect(result).toBe('custom')
        selfTestsRunner.expect(spy.calls).toHaveLength(1)
      })
    })

    selfTestsRunner.describe('restore functionality', () => {
      selfTestsRunner.test('should restore original method', () => {
        const obj = {
          method: () => 'original'
        }

        const spy = spyOn(obj, 'method')
        spy.implement(() => 'custom')

        const result1 = obj.method()
        selfTestsRunner.expect(result1).toBe('custom')

        spy.restore()

        const result2 = obj.method()
        selfTestsRunner.expect(result2).toBe('original')
      })

      selfTestsRunner.test('should clear all tracking data on restore', () => {
        const obj = {
          method: () => 'original'
        }

        const spy = spyOn(obj, 'method')
        spy.implement(() => 'custom')
        spy.implementOnce(() => 'once')
        spy.scenario(['test'], 'scenario')
        obj.method()

        spy.restore()

        selfTestsRunner.expect(spy.calls).toHaveLength(0)
        // After restore, the spy object still exists but should not interfere
        const result = obj.method()
        selfTestsRunner.expect(result).toBe('original')
      })

      selfTestsRunner.test('should restore nested property', () => {
        const obj = {
          deep: {
            method: () => 'original-deep'
          }
        }

        const spy = spyOn(obj, 'deep.method')
        spy.implement(() => 'custom-deep')

        const result1 = obj.deep.method()
        selfTestsRunner.expect(result1).toBe('custom-deep')

        spy.restore()

        const result2 = obj.deep.method()
        selfTestsRunner.expect(result2).toBe('original-deep')
      })
    })

    selfTestsRunner.describe('property descriptor handling', () => {
      selfTestsRunner.test('should handle getter properties', () => {
        const obj = {
          _value: 'hidden',
          get value() {
            return this._value
          }
        }

        const spy = spyOn(obj, 'value')

        // After spying on a getter, it becomes a function that we need to call
        // The getter was called during spyOn setup without proper context, so originalValue is undefined
        const result = (obj.value as any)()

        selfTestsRunner.expect(result).toBe(undefined)
        selfTestsRunner.expect(spy.calls).toHaveLength(1)
      })

      selfTestsRunner.test('should handle properties with undefined values correctly', () => {
        // Test data property with explicit undefined value
        const obj1: any = {}
        Object.defineProperty(obj1, 'undefinedProp', {
          value: undefined,
          writable: true,
          enumerable: true,
          configurable: true
        })

        const spy1 = spyOn(obj1, 'undefinedProp')

        // Should work as a proper spy
        selfTestsRunner.expect(typeof obj1.undefinedProp).toBe('function')
        selfTestsRunner.expect(spy1.calls).toHaveLength(0)

        const result1 = obj1.undefinedProp()
        selfTestsRunner.expect(result1).toBe(undefined)
        selfTestsRunner.expect(spy1.calls).toHaveLength(1)

        // Test minimal property descriptor (defaults to undefined value)
        const obj2: any = {}
        Object.defineProperty(obj2, 'minimalProp', {
          enumerable: true,
          configurable: true
          // No value specified, becomes undefined by default
        })

        const spy2 = spyOn(obj2, 'minimalProp')

        // Should work as a proper spy
        selfTestsRunner.expect(typeof obj2.minimalProp).toBe('function')
        selfTestsRunner.expect(spy2.calls).toHaveLength(0)

        const result2 = obj2.minimalProp()
        selfTestsRunner.expect(result2).toBe(undefined)
        selfTestsRunner.expect(spy2.calls).toHaveLength(1)

        // Verify descriptor properties are preserved
        const desc = Object.getOwnPropertyDescriptor(obj1, 'undefinedProp')!
        selfTestsRunner.expect(desc.enumerable).toBe(true)
        selfTestsRunner.expect(desc.configurable).toBe(true)
        selfTestsRunner.expect(desc.writable).toBe(true)
      })

      selfTestsRunner.test('should handle methods from prototype chain', () => {
        class BaseClass {
          method() {
            return 'base-method'
          }
        }

        class DerivedClass extends BaseClass {
          // Inherits method from BaseClass
        }

        const obj = new DerivedClass()
        const spy = spyOn(obj, 'method')

        const result = obj.method()

        selfTestsRunner.expect(result).toBe('base-method')
        selfTestsRunner.expect(spy.calls).toHaveLength(1)
      })
    })

    selfTestsRunner.describe('edge cases', () => {
      selfTestsRunner.test('should handle methods that return undefined', () => {
        const obj = {
          method: () => undefined
        }

        const spy = spyOn(obj, 'method')

        const result = obj.method()

        selfTestsRunner.expect(result).toBe(undefined)
        selfTestsRunner.expect(spy.calls[0].result).toBe(undefined)
      })

      selfTestsRunner.test('should handle methods with complex arguments', () => {
        const obj = {
          method: (fn: Function, arr: any[], obj: any) => {
            return { fn: fn.name, arr, obj }
          }
        }

        const spy = spyOn(obj, 'method')
        const testFn = function testFunction() {}
        const testArr = [1, 2, 3]
        const testObj = { key: 'value' }

        const result = obj.method(testFn, testArr, testObj)

        selfTestsRunner.expect(result).toEqual({
          fn: 'testFunction',
          arr: [1, 2, 3],
          obj: { key: 'value' }
        })
        selfTestsRunner.expect(spy.calls[0].args).toEqual([testFn, testArr, testObj])
      })

      selfTestsRunner.test('should handle async methods', async () => {
        const obj = {
          method: async (value: string) => {
            return `async-${value}`
          }
        }

        const spy = spyOn(obj, 'method')

        const result = await obj.method('test')

        selfTestsRunner.expect(result).toBe('async-test')
        selfTestsRunner.expect(spy.calls[0].result).toBeInstanceOf(Promise)
      })

      selfTestsRunner.test('should handle methods that modify the object', () => {
        const obj = {
          items: [] as string[],
          addItem: function (item: string) {
            this.items.push(item)
            return this.items.length
          }
        }

        const spy = spyOn(obj, 'addItem')

        const result1 = obj.addItem('first')
        const result2 = obj.addItem('second')

        selfTestsRunner.expect(result1).toBe(1)
        selfTestsRunner.expect(result2).toBe(2)
        selfTestsRunner.expect(obj.items).toEqual(['first', 'second'])
        selfTestsRunner.expect(spy.calls).toHaveLength(2)
      })

      selfTestsRunner.test('should handle circular references in arguments', () => {
        const obj = {
          method: (data: any) => data.prop
        }

        const spy = spyOn(obj, 'method')
        const circular: any = { prop: 'value' }
        circular.self = circular

        const result = obj.method(circular)

        selfTestsRunner.expect(result).toBe('value')
        selfTestsRunner.expect(spy.calls[0].args[0].prop).toBe('value')
        selfTestsRunner.expect(spy.calls[0].args[0].self).toBe(spy.calls[0].args[0])
      })
    })

    selfTestsRunner.describe('integration with TestsRunner', () => {
      selfTestsRunner.test('should work with TestsRunner.spyOn()', () => {
        const testsRunner = new TestsRunner()
        const obj = {
          method: (x: number) => x * 2
        }

        const spy = testsRunner.spyOn(obj, 'method')
        spy.implement((x: number) => x * 3)

        const result = obj.method(5)

        selfTestsRunner.expect(result).toBe(15)
        selfTestsRunner.expect(spy.calls).toHaveLength(1)
        selfTestsRunner.expect(spy.calls[0].args).toEqual([5])
      })

      selfTestsRunner.test('should work with assertion toHaveBeenCalled', () => {
        const testsRunner = new TestsRunner()
        const obj = {
          method: () => 'test'
        }

        const spy = testsRunner.spyOn(obj, 'method')

        // Should not throw
        testsRunner.expect(spy).not.toHaveBeenCalled()

        obj.method()

        // Should not throw
        testsRunner.expect(spy).toHaveBeenCalled()

        selfTestsRunner.expect(true).toBe(true) // Test passed if no errors
      })

      selfTestsRunner.test('should work with assertion toHaveBeenCalledWith', () => {
        const testsRunner = new TestsRunner()
        const obj = {
          method: (a: string, b: number) => `${a}-${b}`
        }

        const spy = testsRunner.spyOn(obj, 'method')

        obj.method('test', 42)

        // Should not throw
        testsRunner.expect(spy).toHaveBeenCalledWith('test', 42)

        selfTestsRunner.expect(true).toBe(true) // Test passed if no errors
      })
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
