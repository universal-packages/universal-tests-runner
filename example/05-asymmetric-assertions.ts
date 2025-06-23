import { TestsRunner } from '../src'

// Sample API response data
interface ApiResponse {
  id: number
  name: string
  email: string
  created: Date
  tags: string[]
  metadata: {
    version: string
    priority: number
    settings: {
      enabled: boolean
      timeout: number
    }
  }
  items: Array<{ id: number; name: string }>
}

export async function runAsymmetricAssertionsExample(): Promise<void> {
  console.log('🚀 Running Asymmetric Assertions Example')
  console.log('='.repeat(50))

  // Example 1: Basic asymmetric assertions
  console.log('\n1️⃣  Basic Asymmetric Assertions:')
  const testsRunner1 = new TestsRunner({ identifier: 'asymmetric-example-1' })
  await runBasicAsymmetricExample(testsRunner1)

  // Example 2: Complex object matching
  console.log('\n2️⃣  Complex Object Matching:')
  const testsRunner2 = new TestsRunner({ identifier: 'asymmetric-example-2' })
  await runComplexObjectExample(testsRunner2)

  // Example 3: Mock function verification
  console.log('\n3️⃣  Mock Function Verification:')
  const testsRunner3 = new TestsRunner({ identifier: 'asymmetric-example-3' })
  await runMockVerificationExample(testsRunner3)

  console.log('='.repeat(50))
}

async function runBasicAsymmetricExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Basic Asymmetric Assertions', () => {
    testsRunner.test('expectAnything - matches any value', () => {
      testsRunner.expect({ a: 1, b: 'hello', c: null }).toEqual({
        a: 1,
        b: testsRunner.expectAnything(),
        c: testsRunner.expectAnything()
      })

      testsRunner.expect([1, 'hello', null, undefined]).toEqual([1, testsRunner.expectAnything(), testsRunner.expectAnything(), testsRunner.expectAnything()])
    })

    testsRunner.test('numeric comparisons', () => {
      const scores = { math: 85, english: 92, science: 78 }

      testsRunner.expect(scores).toEqual({
        math: testsRunner.expectGreaterThan(80),
        english: testsRunner.expectGreaterThanOrEqual(90),
        science: testsRunner.expectLessThan(80)
      })

      const limits = { min: 10, max: 100, current: 50 }
      testsRunner.expect(limits).toEqual({
        min: testsRunner.expectGreaterThanOrEqual(10),
        max: testsRunner.expectLessThanOrEqual(100),
        current: testsRunner.expectLessThanOrEqual(100)
      })
    })

    testsRunner.test('string and pattern matching', () => {
      const user = {
        email: 'user@example.com',
        phone: '123-456-7890',
        username: 'john_doe_123'
      }

      testsRunner.expect(user).toEqual({
        email: testsRunner.expectMatch(/@example\.com$/),
        phone: testsRunner.expectMatch(/^\d{3}-\d{3}-\d{4}$/),
        username: testsRunner.expectMatch(/^[a-z_0-9]+$/)
      })
    })

    testsRunner.test('type checking', () => {
      const response = {
        timestamp: new Date(),
        error: new Error('test error'),
        data: [1, 2, 3]
      }

      testsRunner.expect(response).toEqual({
        timestamp: testsRunner.expectInstanceOf(Date),
        error: testsRunner.expectInstanceOf(Error),
        data: testsRunner.expectInstanceOf(Array)
      })
    })

    testsRunner.test('truthiness and falsiness', () => {
      const config = {
        enabled: true,
        disabled: false,
        count: 5,
        empty: '',
        nullValue: null
      }

      testsRunner.expect(config).toEqual({
        enabled: testsRunner.expectTruthy(),
        disabled: testsRunner.expectFalsy(),
        count: testsRunner.expectTruthy(),
        empty: testsRunner.expectFalsy(),
        nullValue: testsRunner.expectFalsy()
      })
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Basic asymmetric tests completed. Status: ${testsRunner.status}`)
}

async function runComplexObjectExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Complex Object Matching', () => {
    testsRunner.test('API response validation', () => {
      const apiResponse: ApiResponse = {
        id: 123,
        name: 'Test User',
        email: 'test@example.com',
        created: new Date(),
        tags: ['important', 'test', 'example'],
        metadata: {
          version: '1.2.3',
          priority: 1,
          settings: {
            enabled: true,
            timeout: 5000
          }
        },
        items: [
          { id: 1, name: 'Item 1' },
          { id: 2, name: 'Item 2' },
          { id: 3, name: 'Item 3' }
        ]
      }

      testsRunner.expect(apiResponse).toEqual({
        id: testsRunner.expectGreaterThan(100),
        name: testsRunner.expectMatch(/Test/),
        email: testsRunner.expectMatch(/@example\.com$/),
        created: testsRunner.expectInstanceOf(Date),
        tags: testsRunner.expectContain('important'),
        metadata: testsRunner.expectMatchObject({
          version: testsRunner.expectMatch(/^\d+\.\d+\.\d+$/),
          priority: testsRunner.expectLessThanOrEqual(10),
          settings: testsRunner.expectHaveProperty('enabled', true)
        }),
        items: testsRunner.expectHaveLength(3)
      })
    })

    testsRunner.test('nested array matching', () => {
      const data = {
        users: [
          { id: 1, name: 'John', active: true },
          { id: 2, name: 'Jane', active: false },
          { id: 3, name: 'Bob', active: true }
        ],
        summary: {
          total: 3,
          active: 2,
          inactive: 1
        }
      }

      testsRunner.expect(data).toEqual({
        users: testsRunner.expectContainEqual({ id: 1, name: 'John', active: true }),
        summary: testsRunner.expectMatchObject({
          total: testsRunner.expectGreaterThan(0),
          active: testsRunner.expectGreaterThan(0)
        })
      })

      // Check that all users have required properties
      testsRunner.expect(data.users).toEqual([testsRunner.expectHaveProperty('id'), testsRunner.expectHaveProperty('name'), testsRunner.expectHaveProperty('active')])
    })

    testsRunner.test('floating point precision', () => {
      const calculations = {
        result1: 0.1 + 0.2,
        result2: Math.PI,
        result3: 1.0000001
      }

      testsRunner.expect(calculations).toEqual({
        result1: testsRunner.expectCloseTo(0.3),
        result2: testsRunner.expectCloseTo(3.14, 2),
        result3: testsRunner.expectCloseTo(1.0, 6)
      })
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Complex object tests completed. Status: ${testsRunner.status}`)
}

async function runMockVerificationExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Mock Function Verification', () => {
    testsRunner.test('mock calls with asymmetric assertions', () => {
      const mockLogger = testsRunner.mockFn()

      // Simulate some log calls
      mockLogger('info', 'User logged in', { userId: 123, timestamp: new Date() })
      mockLogger('error', 'Database error', { error: new Error('Connection failed') })
      mockLogger('debug', 'Cache hit', { key: 'user:123', ttl: 300 })

      // Verify calls using asymmetric assertions
      testsRunner.expect(mockLogger).toHaveBeenCalledWith('info', testsRunner.expectMatch(/User/), {
        userId: testsRunner.expectGreaterThan(100),
        timestamp: testsRunner.expectInstanceOf(Date)
      })

      testsRunner.expect(mockLogger).toHaveBeenCalledWith('error', testsRunner.expectAnything(), {
        error: testsRunner.expectInstanceOf(Error)
      })

      testsRunner.expect(mockLogger).toHaveBeenCalledWith(testsRunner.expectMatch(/debug/), testsRunner.expectContain('Cache'), {
        key: testsRunner.expectMatch(/^user:/),
        ttl: testsRunner.expectGreaterThan(0)
      })
    })

    testsRunner.test('flexible API call verification', () => {
      const mockApiClient = testsRunner.mockFn()

      // Simulate API calls
      mockApiClient('POST', '/users', {
        name: 'John Doe',
        email: 'john@example.com',
        metadata: { source: 'web', timestamp: Date.now() }
      })

      mockApiClient('GET', '/users/123', {
        fields: ['id', 'name', 'email'],
        expand: ['profile', 'settings']
      })

      // Verify with asymmetric assertions
      testsRunner.expect(mockApiClient).toHaveBeenCalledWith('POST', '/users', {
        name: testsRunner.expectMatch(/John/),
        email: testsRunner.expectMatch(/@example\.com$/),
        metadata: testsRunner.expectMatchObject({
          source: testsRunner.expectAnything(),
          timestamp: testsRunner.expectGreaterThan(0)
        })
      })

      testsRunner.expect(mockApiClient).toHaveBeenCalledWith(testsRunner.expectMatch(/GET/), testsRunner.expectMatch(/\/users\/\d+/), {
        fields: testsRunner.expectContain('name'),
        expand: testsRunner.expectHaveLength(2)
      })
    })

    testsRunner.test('negated asymmetric assertions', () => {
      const data = {
        score: 85,
        message: 'Good job!',
        errors: []
      }

      testsRunner.expect(data).toEqual({
        score: testsRunner.not.expectLessThan(80),
        message: testsRunner.not.expectMatch(/bad/i),
        errors: testsRunner.not.expectHaveLength(1)
      })
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Mock verification tests completed. Status: ${testsRunner.status}`)
}
