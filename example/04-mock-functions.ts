import { TestsRunner } from '../src'

// Sample service to demonstrate mocking
class EmailService {
  constructor(private apiClient: ApiClient) {}

  async sendEmail(to: string, subject: string, body: string): Promise<{ id: string; status: string }> {
    const result = await this.apiClient.post('/emails', { to, subject, body })
    return { id: result.id, status: 'sent' }
  }

  async getEmailStatus(id: string): Promise<string> {
    const result = await this.apiClient.get(`/emails/${id}`)
    return result.status
  }
}

class ApiClient {
  async post(url: string, data: any): Promise<any> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 100))
    return { id: Math.random().toString(36), success: true }
  }

  async get(url: string): Promise<any> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 50))
    return { status: 'delivered' }
  }
}

export async function runMockFunctionsExample(): Promise<void> {
  console.log('🚀 Running Mock Functions Example')
  console.log('='.repeat(50))

  // Example 1: Basic mock functions
  console.log('\n1️⃣  Basic Mock Functions:')
  const testsRunner1 = new TestsRunner({ identifier: 'mock-example-1' })
  await runBasicMockExample(testsRunner1)

  // Example 2: Mock implementations
  console.log('\n2️⃣  Mock Implementations:')
  const testsRunner2 = new TestsRunner({ identifier: 'mock-example-2' })
  await runMockImplementationExample(testsRunner2)

  // Example 3: Mock scenarios
  console.log('\n3️⃣  Mock Scenarios:')
  const testsRunner3 = new TestsRunner({ identifier: 'mock-example-3' })
  await runMockScenariosExample(testsRunner3)

  console.log('='.repeat(50))
}

async function runBasicMockExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Basic Mock Functions', () => {
    testsRunner.test('should create and track mock function calls', () => {
      const mockFn = testsRunner.mockFn()

      // Mock function returns undefined by default
      testsRunner.expect(mockFn()).toBeUndefined()

      // Test basic call tracking
      testsRunner.expect(mockFn).toHaveBeenCalled()
      testsRunner.expect(mockFn).toHaveBeenCalledTimes(1)

      // Call with arguments
      mockFn('hello', 'world')
      testsRunner.expect(mockFn).toHaveBeenCalledTimes(2)
      testsRunner.expect(mockFn).toHaveBeenCalledWith('hello', 'world')
      testsRunner.expect(mockFn).toHaveBeenLastCalledWith('hello', 'world')
    })

    testsRunner.test('should track multiple calls with different arguments', () => {
      const mockFn = testsRunner.mockFn()

      mockFn('first')
      mockFn('second', 123)
      mockFn({ complex: 'object' })

      testsRunner.expect(mockFn).toHaveBeenCalledTimes(3)
      testsRunner.expect(mockFn).toHaveBeenNthCalledWith(1, 'first')
      testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, 'second', 123)
      testsRunner.expect(mockFn).toHaveBeenNthCalledWith(3, { complex: 'object' })

      // Check calls array
      testsRunner.expect(mockFn.calls).toHaveLength(3)
      testsRunner.expect(mockFn.calls[0].args).toEqual(['first'])
      testsRunner.expect(mockFn.calls[1].args).toEqual(['second', 123])
      testsRunner.expect(mockFn.calls[2].args).toEqual([{ complex: 'object' }])
    })

    testsRunner.test('should reset mock function state', () => {
      const mockFn = testsRunner.mockFn()

      mockFn('test')
      mockFn('another')
      testsRunner.expect(mockFn).toHaveBeenCalledTimes(2)

      mockFn.reset()
      testsRunner.expect(mockFn).not.toHaveBeenCalled()
      testsRunner.expect(mockFn.calls).toHaveLength(0)
    })

    testsRunner.test('should work with toHaveBeenCalledTimesWith', () => {
      const mockFn = testsRunner.mockFn()

      mockFn('hello')
      mockFn('world')
      mockFn('hello') // 'hello' called twice
      mockFn('test')

      testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(2, 'hello')
      testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(1, 'world')
      testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(1, 'test')
      testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(0, 'notcalled')
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Basic mock tests completed. Status: ${testsRunner.status}`)
}

async function runMockImplementationExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Mock Implementations', () => {
    testsRunner.test('should implement permanent mock behavior', () => {
      const mockAdd = testsRunner.mockFn()
      mockAdd.implement((a: number, b: number) => a + b)

      testsRunner.expect(mockAdd(2, 3)).toBe(5)
      testsRunner.expect(mockAdd(10, 20)).toBe(30)
      testsRunner.expect(mockAdd).toHaveBeenCalledTimes(2)
    })

    testsRunner.test('should implement one-time mock behavior', () => {
      const mockFn = testsRunner.mockFn()

      mockFn.implementOnce(() => 'first call')
      mockFn.implementOnce(() => 'second call')

      testsRunner.expect(mockFn()).toBe('first call')
      testsRunner.expect(mockFn()).toBe('second call')
      testsRunner.expect(mockFn()).toBeUndefined() // Back to default
    })

    testsRunner.test('should combine permanent and one-time implementations', () => {
      const mockFn = testsRunner.mockFn()

      // Set permanent implementation
      mockFn.implement(() => 'default')

      // Override with one-time implementations
      mockFn.implementOnce(() => 'once-1')
      mockFn.implementOnce(() => 'once-2')

      testsRunner.expect(mockFn()).toBe('once-1')
      testsRunner.expect(mockFn()).toBe('once-2')
      testsRunner.expect(mockFn()).toBe('default') // Back to permanent
      testsRunner.expect(mockFn()).toBe('default')
    })

    testsRunner.test('should work with async implementations', async () => {
      const mockAsyncFn = testsRunner.mockFn()

      mockAsyncFn.implement(async (delay: number) => {
        await new Promise((resolve) => setTimeout(resolve, delay))
        return `waited ${delay}ms`
      })

      const result = await mockAsyncFn(10)
      testsRunner.expect(result).toBe('waited 10ms')
      testsRunner.expect(mockAsyncFn).toHaveBeenCalledWith(10)
    })

    testsRunner.test('should demonstrate real-world usage', async () => {
      const mockApiClient = {
        post: testsRunner.mockFn(),
        get: testsRunner.mockFn()
      }

      // Setup mock implementations
      mockApiClient.post.implement(async (url: string, data: any) => {
        console.log(`    🔄 Mock API POST to ${url}`)
        return { id: 'mock-email-123', success: true }
      })

      mockApiClient.get.implement(async (url: string) => {
        console.log(`    🔄 Mock API GET to ${url}`)
        return { status: 'delivered' }
      })

      // Use the mocked service
      const emailService = new EmailService(mockApiClient as any)

      const result = await emailService.sendEmail('test@example.com', 'Test', 'Hello')
      testsRunner.expect(result).toEqual({ id: 'mock-email-123', status: 'sent' })

      const status = await emailService.getEmailStatus('mock-email-123')
      testsRunner.expect(status).toBe('delivered')

      // Verify the mock calls
      testsRunner.expect(mockApiClient.post).toHaveBeenCalledWith('/emails', {
        to: 'test@example.com',
        subject: 'Test',
        body: 'Hello'
      })

      testsRunner.expect(mockApiClient.get).toHaveBeenCalledWith('/emails/mock-email-123')
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Mock implementation tests completed. Status: ${testsRunner.status}`)
}

async function runMockScenariosExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Mock Scenarios', () => {
    testsRunner.test('should handle different argument scenarios', () => {
      const mockFn = testsRunner.mockFn()

      // Setup scenarios for different arguments
      mockFn.scenario([1, 2], 'one and two')
      mockFn.scenario(['hello'], 'greeting')
      mockFn.scenario([{ type: 'user' }], 'user object')
      mockFn.scenario([], 'no arguments')

      testsRunner.expect(mockFn(1, 2)).toBe('one and two')
      testsRunner.expect(mockFn('hello')).toBe('greeting')
      testsRunner.expect(mockFn({ type: 'user' })).toBe('user object')
      testsRunner.expect(mockFn()).toBe('no arguments')

      // Non-matching arguments return undefined
      testsRunner.expect(mockFn('other')).toBeUndefined()
      testsRunner.expect(mockFn(3, 4)).toBeUndefined()
    })

    testsRunner.test('should handle complex object scenarios', () => {
      const mockFn = testsRunner.mockFn()

      const complexArg = {
        user: { id: 1, name: 'John' },
        options: { format: 'json' }
      }

      mockFn.scenario([complexArg], 'complex match')

      testsRunner.expect(mockFn(complexArg)).toBe('complex match')
      testsRunner.expect(mockFn).toHaveBeenCalledWith(complexArg)
    })

    testsRunner.test('should combine scenarios with implementations', () => {
      const mockCalculator = testsRunner.mockFn()

      // Default implementation
      mockCalculator.implement((operation: string, a: number, b: number) => {
        throw new Error(`Unknown operation: ${operation}`)
      })

      // Specific scenarios
      mockCalculator.scenario(['add', 2, 3], 5)
      mockCalculator.scenario(['multiply', 4, 5], 20)
      mockCalculator.scenario(['divide', 10, 2], 5)

      testsRunner.expect(mockCalculator('add', 2, 3)).toBe(5)
      testsRunner.expect(mockCalculator('multiply', 4, 5)).toBe(20)
      testsRunner.expect(mockCalculator('divide', 10, 2)).toBe(5)

      // Non-scenario calls use the default implementation
      testsRunner
        .expect(() => {
          mockCalculator('unknown', 1, 2)
        })
        .toThrow('Unknown operation: unknown')
    })

    testsRunner.test('should reset scenarios', () => {
      const mockFn = testsRunner.mockFn()

      mockFn.scenario(['test'], 'scenario result')
      testsRunner.expect(mockFn('test')).toBe('scenario result')

      mockFn.reset()
      testsRunner.expect(mockFn('test')).toBeUndefined()
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Mock scenarios tests completed. Status: ${testsRunner.status}`)
}
