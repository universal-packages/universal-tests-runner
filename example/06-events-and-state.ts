import { TestsRunner } from '../src'

export async function runEventsAndStateExample(): Promise<void> {
  console.log('🚀 Running Events and State Example')
  console.log('='.repeat(50))

  // Example 1: Basic event tracking
  console.log('\n1️⃣  Basic Event Tracking:')
  const testsRunner1 = new TestsRunner({ identifier: 'events-example-1' })
  await runBasicEventsExample(testsRunner1)

  // Example 2: State monitoring
  console.log('\n2️⃣  State Monitoring:')
  const testsRunner2 = new TestsRunner({ identifier: 'events-example-2' })
  await runStateMonitoringExample(testsRunner2)

  // Example 3: Comprehensive event logging
  console.log('\n3️⃣  Comprehensive Event Logging:')
  const testsRunner3 = new TestsRunner({ identifier: 'events-example-3' })
  await runComprehensiveEventExample(testsRunner3)

  console.log('='.repeat(50))
}

async function runBasicEventsExample(testsRunner: TestsRunner): Promise<void> {
  // Track all events
  const eventLog: string[] = []

  // BaseRunner events (inherited)
  testsRunner.on('preparing', (event) => {
    eventLog.push(`🔧 Preparing started at ${event.payload.startedAt.toISOString()}`)
  })

  testsRunner.on('prepared', (event) => {
    eventLog.push(`✅ Prepared - Duration: ${event.measurement?.toString()}`)
  })

  testsRunner.on('running', (event) => {
    eventLog.push(`🏃 Running started at ${event.payload.startedAt.toISOString()}`)
  })

  testsRunner.on('succeeded', (event) => {
    eventLog.push(`🎉 Succeeded - Duration: ${event.measurement?.toString()}`)
  })

  testsRunner.on('failed', (event) => {
    eventLog.push(`❌ Failed: ${event.payload.reason} - Duration: ${event.measurement?.toString()}`)
  })

  // TestsRunner specific events
  testsRunner.on('describe', (event) => {
    eventLog.push(`📝 Describe: ${event.payload.name}`)
  })

  testsRunner.on('test', (event) => {
    eventLog.push(`🧪 Test registered: ${event.payload.name}`)
  })

  // Test lifecycle events
  testsRunner.on('test:preparing', (event) => {
    eventLog.push(`  🔧 Test preparing: ${event.payload.test.name}`)
  })

  testsRunner.on('test:prepared', (event) => {
    eventLog.push(`  ✅ Test prepared: ${event.payload.test.name}`)
  })

  testsRunner.on('test:running', (event) => {
    eventLog.push(`  🏃 Test running: ${event.payload.test.name}`)
  })

  testsRunner.on('test:succeeded', (event) => {
    eventLog.push(`  🎉 Test succeeded: ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    eventLog.push(`  ❌ Test failed: ${event.payload.test.name} - ${event.payload.reason}`)
  })

  testsRunner.on('test:skipped', (event) => {
    eventLog.push(`  ⏭️  Test skipped: ${event.payload.test.name} - ${event.payload.reason}`)
  })

  // Define some tests
  testsRunner.describe('Basic Math', () => {
    testsRunner.test('addition works', () => {
      testsRunner.expect(1 + 1).toEqual(2)
    })

    testsRunner.test('subtraction works', () => {
      testsRunner.expect(5 - 3).toEqual(2)
    })

    testsRunner.test('this test will fail', () => {
      testsRunner.expect(2 + 2).toEqual(5) // This will fail
    })

    testsRunner.test(
      'skipped test',
      () => {
        testsRunner.expect(true).toBe(true)
      },
      { skip: true, skipReason: 'Just for demo' }
    )
  })

  await testsRunner.run()

  console.log('\n📊 Event Log:')
  eventLog.forEach((event) => console.log(`  ${event}`))
  console.log(`\n📈 Total events captured: ${eventLog.length}`)
}

async function runStateMonitoringExample(testsRunner: TestsRunner): Promise<void> {
  const stateSnapshots: any[] = []

  // Capture state at key moments
  testsRunner.on('**' as any, (event) => {
    const snapshot = {
      event: event.event,
      timestamp: new Date().toISOString(),
      state: {
        status: testsRunner.status,
        identifier: testsRunner.state.identifier,
        totalTests: testsRunner.state.tests.length,
        nodeStructure: testsRunner.state.nodes
      }
    }
    stateSnapshots.push(snapshot)
  })

  testsRunner.describe('State Monitoring Tests', () => {
    testsRunner.describe('Nested Group', () => {
      testsRunner.test('first test', () => {
        testsRunner.expect(true).toBe(true)
      })

      testsRunner.test('second test', () => {
        testsRunner.expect(false).toBe(false)
      })
    })

    testsRunner.test('top level test', () => {
      testsRunner.expect('hello').toEqual('hello')
    })
  })

  await testsRunner.run()

  console.log('\n📊 State Evolution:')
  stateSnapshots.forEach((snapshot, index) => {
    console.log(`  ${index + 1}. Event: ${snapshot.event}`)
    console.log(`     Status: ${snapshot.state.status}`)
    console.log(`     Total Tests: ${snapshot.state.totalTests}`)
    console.log(`     Node Status: ${snapshot.state.nodeStructure.status}`)
    if (snapshot.state.nodeStructure.children.length > 0) {
      console.log(`     Child Nodes: ${snapshot.state.nodeStructure.children.length}`)
    }
    console.log('')
  })

  console.log(`📈 Final State:`)
  console.log(`  Status: ${testsRunner.status}`)
  console.log(`  Total Tests: ${testsRunner.state.tests.length}`)
  console.log(`  Test Results:`)
  testsRunner.state.tests.forEach((test) => {
    console.log(`    - ${test.name}: ${test.status}`)
  })
}

async function runComprehensiveEventExample(testsRunner: TestsRunner): Promise<void> {
  const eventAnalytics = {
    totalEvents: 0,
    eventTypes: {} as Record<string, number>,
    testResults: { passed: 0, failed: 0, skipped: 0 },
    timing: {
      start: new Date(),
      end: null as Date | null,
      duration: null as number | null
    }
  }

  // Track all events with analytics
  testsRunner.on('**' as any, (event) => {
    eventAnalytics.totalEvents++
    eventAnalytics.eventTypes[event.event] = (eventAnalytics.eventTypes[event.event] || 0) + 1

    if (event.event === 'test:succeeded') {
      eventAnalytics.testResults.passed++
    } else if (event.event === 'test:failed') {
      eventAnalytics.testResults.failed++
    } else if (event.event === 'test:skipped') {
      eventAnalytics.testResults.skipped++
    }
  })

  testsRunner.on('succeeded', () => {
    eventAnalytics.timing.end = new Date()
    eventAnalytics.timing.duration = eventAnalytics.timing.end.getTime() - eventAnalytics.timing.start.getTime()
  })

  testsRunner.on('failed', () => {
    eventAnalytics.timing.end = new Date()
    eventAnalytics.timing.duration = eventAnalytics.timing.end.getTime() - eventAnalytics.timing.start.getTime()
  })

  // Real-time progress tracking
  let currentTestIndex = 0
  testsRunner.on('test:running', (event) => {
    currentTestIndex++
    const progress = (currentTestIndex / testsRunner.state.tests.length) * 100
    console.log(`  📊 Progress: ${progress.toFixed(1)}% - Running: ${event.payload.test.name}`)
  })

  // Error tracking
  const errors: any[] = []
  testsRunner.on('test:failed', (event) => {
    errors.push({
      test: event.payload.test.name,
      spec: event.payload.test.spec,
      reason: event.payload.reason,
      timestamp: event.payload.finishedAt
    })
  })

  // Define test suite
  testsRunner.describe('Comprehensive Test Suite', () => {
    testsRunner.describe('String Operations', () => {
      testsRunner.test('concatenation', () => {
        testsRunner.expect('hello' + ' world').toEqual('hello world')
      })

      testsRunner.test('length check', () => {
        testsRunner.expect('test'.length).toEqual(4)
      })
    })

    testsRunner.describe('Array Operations', () => {
      testsRunner.test('array creation', () => {
        testsRunner.expect([1, 2, 3]).toHaveLength(3)
      })

      testsRunner.test('array contains', () => {
        testsRunner.expect([1, 2, 3]).toContain(2)
      })

      testsRunner.test('failing test', () => {
        testsRunner.expect([1, 2, 3]).toContain(4) // This will fail
      })
    })

    testsRunner.describe('Async Operations', () => {
      testsRunner.test('promise resolution', async () => {
        const result = await Promise.resolve('success')
        testsRunner.expect(result).toEqual('success')
      })

      testsRunner.test(
        'skipped async test',
        async () => {
          await Promise.resolve()
          testsRunner.expect(true).toBe(true)
        },
        { skip: true, skipReason: 'Demonstration purposes' }
      )
    })
  })

  await testsRunner.run()

  // Final analytics report
  console.log('\n📊 Test Analytics Report:')
  console.log(`  Total Events: ${eventAnalytics.totalEvents}`)
  console.log(`  Duration: ${eventAnalytics.timing.duration}ms`)
  console.log(`  Final Status: ${testsRunner.status}`)

  console.log('\n  Event Breakdown:')
  Object.entries(eventAnalytics.eventTypes).forEach(([event, count]) => {
    console.log(`    ${event}: ${count}`)
  })

  console.log('\n  Test Results:')
  console.log(`    ✅ Passed: ${eventAnalytics.testResults.passed}`)
  console.log(`    ❌ Failed: ${eventAnalytics.testResults.failed}`)
  console.log(`    ⏭️  Skipped: ${eventAnalytics.testResults.skipped}`)

  if (errors.length > 0) {
    console.log('\n  Errors:')
    errors.forEach((error, index) => {
      console.log(`    ${index + 1}. ${error.test} (${error.spec.join(' > ')})`)
      console.log(`       ${error.reason}`)
    })
  }

  console.log('\n  Node Structure:')
  console.log(`    Root Status: ${testsRunner.state.nodes.status}`)
  console.log(`    Child Nodes: ${testsRunner.state.nodes.children.length}`)
  testsRunner.state.nodes.children.forEach((child) => {
    console.log(`      - ${String(child.name)}: ${child.status} (${child.tests.length} tests)`)
  })
}
