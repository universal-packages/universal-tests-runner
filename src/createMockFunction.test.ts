import { TestsRunner } from './TestsRunner'
import { createMockFunction } from './createMockFunction'
import { evaluateTestResults } from './utils.test'

export async function createMockFunctionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('createMockFunction', () => {
    selfTestsRunner.describe('call tracking', () => {
      selfTestsRunner.test('should track calls without arguments', () => {
        const mockFn = createMockFunction()

        selfTestsRunner.expect(mockFn.calls).toEqual([])

        mockFn()
        selfTestsRunner.expect(mockFn.calls).toHaveLength(1)
        selfTestsRunner.expect(mockFn.calls[0]).toEqual({
          args: [],
          result: undefined,
          error: undefined
        })
      })

      selfTestsRunner.test('should track calls with arguments', () => {
        const mockFn = createMockFunction()

        mockFn('arg1', 42, true, { key: 'value' })

        selfTestsRunner.expect(mockFn.calls).toHaveLength(1)
        selfTestsRunner.expect(mockFn.calls[0]).toEqual({
          args: ['arg1', 42, true, { key: 'value' }],
          result: undefined,
          error: undefined
        })
      })

      selfTestsRunner.test('should track multiple calls', () => {
        const mockFn = createMockFunction()

        mockFn('first')
        mockFn('second', 42)
        mockFn()

        selfTestsRunner.expect(mockFn.calls).toHaveLength(3)
        selfTestsRunner.expect(mockFn.calls[0].args).toEqual(['first'])
        selfTestsRunner.expect(mockFn.calls[1].args).toEqual(['second', 42])
        selfTestsRunner.expect(mockFn.calls[2].args).toEqual([])
      })

      selfTestsRunner.test('should return undefined by default', () => {
        const mockFn = createMockFunction()

        const result = mockFn('test')

        selfTestsRunner.expect(result).toBe(undefined)
        selfTestsRunner.expect(mockFn.calls[0].result).toBe(undefined)
      })
    })

    selfTestsRunner.describe('default implementation', () => {
      selfTestsRunner.test('should use default implementation when provided', () => {
        const mockFn = createMockFunction()
        mockFn.implement((a: string, b: number) => `${a}-${b}`)

        const result = mockFn('test', 42)

        selfTestsRunner.expect(result).toBe('test-42')
        selfTestsRunner.expect(mockFn.calls[0].result).toBe('test-42')
      })

      selfTestsRunner.test('should use default implementation for multiple calls', () => {
        const mockFn = createMockFunction()
        mockFn.implement((x: number) => x * 2)

        const result1 = mockFn(5)
        const result2 = mockFn(10)

        selfTestsRunner.expect(result1).toBe(10)
        selfTestsRunner.expect(result2).toBe(20)
        selfTestsRunner.expect(mockFn.calls).toHaveLength(2)
      })

      selfTestsRunner.test('should override default implementation', () => {
        const mockFn = createMockFunction()
        mockFn.implement(() => 'first')

        const result1 = mockFn()
        selfTestsRunner.expect(result1).toBe('first')

        mockFn.implement(() => 'second')
        const result2 = mockFn()
        selfTestsRunner.expect(result2).toBe('second')
      })

      selfTestsRunner.test('should track errors from default implementation', () => {
        const mockFn = createMockFunction()
        const error = new Error('Test error')
        mockFn.implement(() => {
          throw error
        })

        selfTestsRunner.expect(() => mockFn()).toThrow('Test error')
        selfTestsRunner.expect(mockFn.calls[0].error).toBe(error)
        selfTestsRunner.expect(mockFn.calls[0].result).toBe(undefined)
      })
    })

    selfTestsRunner.describe('one-time implementations', () => {
      selfTestsRunner.test('should use one-time implementation before default', () => {
        const mockFn = createMockFunction()
        mockFn.implement(() => 'default')
        mockFn.implementOnce(() => 'once')

        const result1 = mockFn()
        const result2 = mockFn()

        selfTestsRunner.expect(result1).toBe('once')
        selfTestsRunner.expect(result2).toBe('default')
      })

      selfTestsRunner.test('should use multiple one-time implementations in order', () => {
        const mockFn = createMockFunction()
        mockFn.implementOnce(() => 'first')
        mockFn.implementOnce(() => 'second')
        mockFn.implementOnce(() => 'third')

        const result1 = mockFn()
        const result2 = mockFn()
        const result3 = mockFn()
        const result4 = mockFn()

        selfTestsRunner.expect(result1).toBe('first')
        selfTestsRunner.expect(result2).toBe('second')
        selfTestsRunner.expect(result3).toBe('third')
        selfTestsRunner.expect(result4).toBe(undefined)
      })

      selfTestsRunner.test('should track errors from one-time implementations', () => {
        const mockFn = createMockFunction()
        const error = new Error('One-time error')
        mockFn.implementOnce(() => {
          throw error
        })

        selfTestsRunner.expect(() => mockFn()).toThrow('One-time error')
        selfTestsRunner.expect(mockFn.calls[0].error).toBe(error)
      })
    })

    selfTestsRunner.describe('scenarios', () => {
      selfTestsRunner.test('should match scenario with exact arguments', () => {
        const mockFn = createMockFunction()
        mockFn.scenario(['test', 42], 'matched')

        const result1 = mockFn('test', 42)
        const result2 = mockFn('test', 43)

        selfTestsRunner.expect(result1).toBe('matched')
        selfTestsRunner.expect(result2).toBe(undefined)
      })

      selfTestsRunner.test('should match scenarios with complex objects', () => {
        const mockFn = createMockFunction()
        const argObj = { key: 'value', nested: { prop: 42 } }
        mockFn.scenario([argObj], 'object matched')

        const result = mockFn({ key: 'value', nested: { prop: 42 } })

        selfTestsRunner.expect(result).toBe('object matched')
      })

      selfTestsRunner.test('should prioritize scenarios over implementations', () => {
        const mockFn = createMockFunction()
        mockFn.implement(() => 'default')
        mockFn.implementOnce(() => 'once')
        mockFn.scenario(['special'], 'scenario')

        const result1 = mockFn('special')
        const result2 = mockFn('normal')
        const result3 = mockFn('normal')

        selfTestsRunner.expect(result1).toBe('scenario')
        selfTestsRunner.expect(result2).toBe('once')
        selfTestsRunner.expect(result3).toBe('default')
      })

      selfTestsRunner.test('should handle multiple scenarios', () => {
        const mockFn = createMockFunction()
        mockFn.scenario(['a'], 'result-a')
        mockFn.scenario(['b'], 'result-b')
        mockFn.scenario(['c', 1], 'result-c')

        selfTestsRunner.expect(mockFn('a')).toBe('result-a')
        selfTestsRunner.expect(mockFn('b')).toBe('result-b')
        selfTestsRunner.expect(mockFn('c', 1)).toBe('result-c')
        selfTestsRunner.expect(mockFn('d')).toBe(undefined)
      })

      selfTestsRunner.test('should match scenario with no arguments', () => {
        const mockFn = createMockFunction()
        mockFn.scenario([], 'no args')

        const result = mockFn()

        selfTestsRunner.expect(result).toBe('no args')
      })

      selfTestsRunner.test('should not match scenario with wrong argument count', () => {
        const mockFn = createMockFunction()
        mockFn.scenario(['test'], 'matched')

        const result1 = mockFn('test', 'extra')
        const result2 = mockFn()

        selfTestsRunner.expect(result1).toBe(undefined)
        selfTestsRunner.expect(result2).toBe(undefined)
      })
    })

    selfTestsRunner.describe('reset functionality', () => {
      selfTestsRunner.test('should clear all calls on reset', () => {
        const mockFn = createMockFunction()
        mockFn('test1')
        mockFn('test2')

        selfTestsRunner.expect(mockFn.calls).toHaveLength(2)

        mockFn.reset()

        selfTestsRunner.expect(mockFn.calls).toHaveLength(0)
      })

      selfTestsRunner.test('should clear default implementation on reset', () => {
        const mockFn = createMockFunction()
        mockFn.implement(() => 'default')

        const result1 = mockFn()
        selfTestsRunner.expect(result1).toBe('default')

        mockFn.reset()

        const result2 = mockFn()
        selfTestsRunner.expect(result2).toBe(undefined)
      })

      selfTestsRunner.test('should clear one-time implementations on reset', () => {
        const mockFn = createMockFunction()
        mockFn.implementOnce(() => 'once1')
        mockFn.implementOnce(() => 'once2')

        mockFn.reset()

        const result = mockFn()
        selfTestsRunner.expect(result).toBe(undefined)
      })

      selfTestsRunner.test('should clear scenarios on reset', () => {
        const mockFn = createMockFunction()
        mockFn.scenario(['test'], 'matched')

        const result1 = mockFn('test')
        selfTestsRunner.expect(result1).toBe('matched')

        mockFn.reset()

        const result2 = mockFn('test')
        selfTestsRunner.expect(result2).toBe(undefined)
      })
    })

    selfTestsRunner.describe('mockClear functionality', () => {
      selfTestsRunner.test('should clear only calls on mockClear', () => {
        const mockFn = createMockFunction()
        mockFn.implement(() => 'default')
        mockFn('test1')
        mockFn('test2')

        selfTestsRunner.expect(mockFn.calls).toHaveLength(2)

        mockFn.mockClear()

        selfTestsRunner.expect(mockFn.calls).toHaveLength(0)

        // Implementation should still work
        const result = mockFn()
        selfTestsRunner.expect(result).toBe('default')
        selfTestsRunner.expect(mockFn.calls).toHaveLength(1)
      })

      selfTestsRunner.test('should preserve one-time implementations on mockClear', () => {
        const mockFn = createMockFunction()
        mockFn.implementOnce(() => 'once')

        mockFn.mockClear()

        const result = mockFn()
        selfTestsRunner.expect(result).toBe('once')
      })

      selfTestsRunner.test('should preserve scenarios on mockClear', () => {
        const mockFn = createMockFunction()
        mockFn.scenario(['test'], 'matched')
        mockFn('test')

        mockFn.mockClear()

        const result = mockFn('test')
        selfTestsRunner.expect(result).toBe('matched')
      })
    })

    selfTestsRunner.describe('edge cases', () => {
      selfTestsRunner.test('should handle null and undefined arguments', () => {
        const mockFn = createMockFunction()
        mockFn.scenario([null, undefined], 'null-undefined')

        const result = mockFn(null, undefined)

        selfTestsRunner.expect(result).toBe('null-undefined')
        selfTestsRunner.expect(mockFn.calls[0].args).toEqual([null, undefined])
      })

      selfTestsRunner.test('should handle functions as arguments', () => {
        const mockFn = createMockFunction()
        const fn = () => 'test'

        mockFn(fn)

        selfTestsRunner.expect(mockFn.calls[0].args).toEqual([fn])
      })

      selfTestsRunner.test('should handle array arguments', () => {
        const mockFn = createMockFunction()
        const arr = [1, 2, 3]
        mockFn.scenario([arr], 'array matched')

        const result = mockFn([1, 2, 3])

        selfTestsRunner.expect(result).toBe('array matched')
      })

      selfTestsRunner.test('should handle deep object comparison in scenarios', () => {
        const mockFn = createMockFunction()
        const deepObj = {
          level1: {
            level2: {
              level3: 'deep'
            }
          }
        }
        mockFn.scenario([deepObj], 'deep match')

        const result = mockFn({
          level1: {
            level2: {
              level3: 'deep'
            }
          }
        })

        selfTestsRunner.expect(result).toBe('deep match')
      })

      selfTestsRunner.test('should handle promises returned from implementations', async () => {
        const mockFn = createMockFunction()
        mockFn.implement(async () => 'async result')

        const result = await mockFn()

        selfTestsRunner.expect(result).toBe('async result')
        selfTestsRunner.expect(mockFn.calls[0].result).toBeInstanceOf(Promise)
      })

      selfTestsRunner.test('should handle async errors', async () => {
        const mockFn = createMockFunction()
        const asyncError = new Error('Async error')
        mockFn.implement(async () => {
          throw asyncError
        })

        try {
          await mockFn()
          selfTestsRunner.expect(true).toBe(false) // Should not reach here
        } catch (error) {
          selfTestsRunner.expect(error).toBe(asyncError)
        }

        // For async functions, the error is not captured in the synchronous try/catch
        // The call should still be recorded with the promise as result
        selfTestsRunner.expect(mockFn.calls[0].result).toBeInstanceOf(Promise)
        selfTestsRunner.expect(mockFn.calls[0].error).toBe(undefined)
      })

      selfTestsRunner.test('should handle circular references in arguments', () => {
        const mockFn = createMockFunction()
        const circular: any = { prop: 'value' }
        circular.self = circular

        mockFn(circular)

        // Should not throw and should record the call
        selfTestsRunner.expect(mockFn.calls).toHaveLength(1)
        selfTestsRunner.expect(mockFn.calls[0].args[0].prop).toBe('value')
        selfTestsRunner.expect(mockFn.calls[0].args[0].self).toBe(mockFn.calls[0].args[0])
      })
    })

    selfTestsRunner.describe('integration with TestsRunner', () => {
      selfTestsRunner.test('should work with TestsRunner.mockFn()', () => {
        const testsRunner = new TestsRunner()
        const mockFn = testsRunner.mockFn()

        mockFn.implement(() => 'from testsRunner')
        const result = mockFn('test')

        selfTestsRunner.expect(result).toBe('from testsRunner')
        selfTestsRunner.expect(mockFn.calls).toHaveLength(1)
        selfTestsRunner.expect(mockFn.calls[0].args).toEqual(['test'])
      })

      selfTestsRunner.test('should work with assertion toHaveBeenCalled', () => {
        const testsRunner = new TestsRunner()
        const mockFn = testsRunner.mockFn()

        // Should not throw
        testsRunner.expect(mockFn).not.toHaveBeenCalled()

        mockFn()

        // Should not throw
        testsRunner.expect(mockFn).toHaveBeenCalled()

        selfTestsRunner.expect(true).toBe(true) // Test passed if no errors
      })
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
