import { TestsRunner } from '../src'

// Sample data service to demonstrate lifecycle hooks
class DataService {
  private data: Record<string, any> = {}
  private connections = 0

  async connect(): Promise<void> {
    console.log('    🔌 Connecting to database...')
    await new Promise((resolve) => setTimeout(resolve, 100))
    this.connections++
    console.log(`    ✅ Connected! (${this.connections} active connections)`)
  }

  async disconnect(): Promise<void> {
    console.log('    🔌 Disconnecting from database...')
    await new Promise((resolve) => setTimeout(resolve, 50))
    this.connections--
    console.log(`    ✅ Disconnected! (${this.connections} active connections)`)
  }

  async save(key: string, value: any): Promise<void> {
    console.log(`    💾 Saving ${key} = ${JSON.stringify(value)}`)
    await new Promise((resolve) => setTimeout(resolve, 25))
    this.data[key] = value
  }

  async load(key: string): Promise<any> {
    console.log(`    📖 Loading ${key}`)
    await new Promise((resolve) => setTimeout(resolve, 25))
    return this.data[key]
  }

  async clear(): Promise<void> {
    console.log('    🧹 Clearing all data...')
    this.data = {}
  }

  getConnectionCount(): number {
    return this.connections
  }
}

export async function runTestLifecycleExample(): Promise<void> {
  console.log('🚀 Running Test Lifecycle Example')
  console.log('='.repeat(50))

  // Example 1: Basic lifecycle hooks
  console.log('\n1️⃣  Basic Lifecycle Hooks:')
  const testsRunner1 = new TestsRunner({ identifier: 'lifecycle-example-1' })
  await runBasicLifecycleExample(testsRunner1)

  // Example 2: Nested lifecycle hooks
  console.log('\n2️⃣  Nested Lifecycle Hooks:')
  const testsRunner2 = new TestsRunner({ identifier: 'lifecycle-example-2' })
  await runNestedLifecycleExample(testsRunner2)

  // Example 3: Error handling in hooks
  console.log('\n3️⃣  Error Handling in Hooks:')
  const testsRunner3 = new TestsRunner({ identifier: 'lifecycle-example-3' })
  await runErrorHandlingExample(testsRunner3)

  console.log('='.repeat(50))
}

async function runBasicLifecycleExample(testsRunner: TestsRunner): Promise<void> {
  const dataService = new DataService()
  let testCounter = 0

  // Global setup and teardown
  testsRunner.before(async () => {
    console.log('  🚀 Global setup: Initializing test environment')
    await dataService.connect()
  })

  testsRunner.after(async () => {
    console.log('  🧹 Global teardown: Cleaning up test environment')
    await dataService.disconnect()
  })

  // Run before each test
  testsRunner.beforeEach(async () => {
    testCounter++
    console.log(`  📝 Test ${testCounter} setup: Preparing test data`)
    await dataService.clear()
  })

  // Run after each test
  testsRunner.afterEach(async () => {
    console.log(`  ✨ Test ${testCounter} cleanup: Test completed`)
  })

  testsRunner.describe('Data Service Tests', () => {
    testsRunner.test('should save and load data', async () => {
      await dataService.save('user1', { name: 'John', age: 30 })
      const result = await dataService.load('user1')
      testsRunner.expect(result).toEqual({ name: 'John', age: 30 })
    })

    testsRunner.test('should handle missing data', async () => {
      const result = await dataService.load('nonexistent')
      testsRunner.expect(result).toBeUndefined()
    })

    testsRunner.test('should maintain connection', () => {
      testsRunner.expect(dataService.getConnectionCount()).toEqual(1)
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`    ✅ ${event.payload.test.name} - passed`)
  })

  await testsRunner.run()
  console.log(`📊 Basic lifecycle tests completed. Status: ${testsRunner.status}`)
}

async function runNestedLifecycleExample(testsRunner: TestsRunner): Promise<void> {
  const dataService = new DataService()
  let setupOrder: string[] = []

  testsRunner.before(async () => {
    setupOrder.push('global-before')
    console.log('  🌍 Global before hook')
    await dataService.connect()
  })

  testsRunner.beforeEach(() => {
    setupOrder.push('global-beforeEach')
    console.log('  🌍 Global beforeEach hook')
  })

  testsRunner.afterEach(() => {
    console.log('  🌍 Global afterEach hook')
  })

  testsRunner.after(async () => {
    console.log('  🌍 Global after hook')
    await dataService.disconnect()
  })

  testsRunner.describe('Outer Describe Block', () => {
    testsRunner.before(() => {
      setupOrder.push('outer-before')
      console.log('    📦 Outer before hook')
    })

    testsRunner.beforeEach(() => {
      setupOrder.push('outer-beforeEach')
      console.log('    📦 Outer beforeEach hook')
    })

    testsRunner.afterEach(() => {
      console.log('    📦 Outer afterEach hook')
    })

    testsRunner.after(() => {
      console.log('    📦 Outer after hook')
    })

    testsRunner.describe('Inner Describe Block', () => {
      testsRunner.before(() => {
        setupOrder.push('inner-before')
        console.log('      📂 Inner before hook')
      })

      testsRunner.beforeEach(() => {
        setupOrder.push('inner-beforeEach')
        console.log('      📂 Inner beforeEach hook')
      })

      testsRunner.afterEach(() => {
        console.log('      📂 Inner afterEach hook')
      })

      testsRunner.after(() => {
        console.log('      📂 Inner after hook')
      })

      testsRunner.test('should demonstrate hook order', async () => {
        console.log('        🧪 Test is running')
        await dataService.save('test', 'value')

        // Verify the order of before hooks
        const expectedOrder = ['global-before', 'outer-before', 'inner-before', 'global-beforeEach', 'outer-beforeEach', 'inner-beforeEach']
        testsRunner.expect(setupOrder).toEqual(expectedOrder)
      })
    })

    testsRunner.test('should run in outer scope', () => {
      console.log('      🧪 Outer scope test running')
      testsRunner.expect(dataService.getConnectionCount()).toEqual(1)
    })
  })

  await testsRunner.run()
  console.log(`📊 Nested lifecycle tests completed. Status: ${testsRunner.status}`)
}

async function runErrorHandlingExample(testsRunner: TestsRunner): Promise<void> {
  const dataService = new DataService()

  testsRunner.before(async () => {
    console.log('  🚀 Setting up with potential error...')
    await dataService.connect()
  })

  testsRunner.beforeEach(() => {
    console.log('  📝 BeforeEach running...')
    // This could potentially throw an error
    if (Math.random() < 0.1) {
      // 10% chance of error
      throw new Error('Random beforeEach error!')
    }
  })

  testsRunner.afterEach(() => {
    console.log('  ✨ AfterEach running...')
  })

  testsRunner.after(async () => {
    console.log('  🧹 Cleaning up...')
    await dataService.disconnect()
  })

  testsRunner.describe('Error Handling Tests', () => {
    testsRunner.test('should handle async operations', async () => {
      await dataService.save('key1', 'value1')
      const result = await dataService.load('key1')
      testsRunner.expect(result).toEqual('value1')
    })

    testsRunner.test('should pass even if setup occasionally fails', () => {
      console.log('    🧪 This test should run regardless of setup issues')
      testsRunner.expect(true).toBe(true)
    })

    testsRunner.test('should demonstrate error recovery', async () => {
      try {
        await dataService.save('key2', 'value2')
        const result = await dataService.load('key2')
        testsRunner.expect(result).toEqual('value2')
      } catch (error) {
        console.log('    ⚠️  Test handled its own error gracefully')
        testsRunner.expect(error).toBeInstanceOf(Error)
      }
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`    ✅ ${event.payload.test.name} - passed`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`    ❌ ${event.payload.test.name} - failed: ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Error handling tests completed. Status: ${testsRunner.status}`)
}
