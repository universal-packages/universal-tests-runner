import { TestsRunner } from '../src'

// Sample classes to demonstrate spying
class Calculator {
  private history: string[] = []

  add(a: number, b: number): number {
    const result = a + b
    this.history.push(`${a} + ${b} = ${result}`)
    return result
  }

  multiply(a: number, b: number): number {
    const result = a * b
    this.history.push(`${a} * ${b} = ${result}`)
    return result
  }

  getHistory(): string[] {
    return [...this.history]
  }

  clearHistory(): void {
    this.history = []
  }
}

class Logger {
  private logs: Array<{ level: string; message: string; timestamp: Date }> = []

  info(message: string): void {
    this.logs.push({ level: 'info', message, timestamp: new Date() })
    console.log(`[INFO] ${message}`)
  }

  error(message: string): void {
    this.logs.push({ level: 'error', message, timestamp: new Date() })
    console.error(`[ERROR] ${message}`)
  }

  getLogs(): Array<{ level: string; message: string; timestamp: Date }> {
    return [...this.logs]
  }
}

export async function runSpyExample(): Promise<void> {
  console.log('🚀 Running Spy Functions Example')
  console.log('='.repeat(50))

  // Example 1: Basic spying
  console.log('\n1️⃣  Basic Spying:')
  const testsRunner1 = new TestsRunner({ identifier: 'spy-example-1' })
  await runBasicSpyExample(testsRunner1)

  // Example 2: Spy implementations
  console.log('\n2️⃣  Spy Implementations:')
  const testsRunner2 = new TestsRunner({ identifier: 'spy-example-2' })
  await runSpyImplementationExample(testsRunner2)

  // Example 3: Spy restoration
  console.log('\n3️⃣  Spy Restoration:')
  const testsRunner3 = new TestsRunner({ identifier: 'spy-example-3' })
  await runSpyRestorationExample(testsRunner3)

  console.log('='.repeat(50))
}

async function runBasicSpyExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Basic Spying', () => {
    testsRunner.test('should spy on method calls', () => {
      const calculator = new Calculator()
      const addSpy = testsRunner.spyOn(calculator, 'add')

      // Use the calculator normally
      const result1 = calculator.add(2, 3)
      const result2 = calculator.add(5, 7)

      // Verify the original functionality works
      testsRunner.expect(result1).toBe(5)
      testsRunner.expect(result2).toBe(12)

      // Verify the spy tracked the calls
      testsRunner.expect(addSpy).toHaveBeenCalledTimes(2)
      testsRunner.expect(addSpy).toHaveBeenCalledWith(2, 3)
      testsRunner.expect(addSpy).toHaveBeenCalledWith(5, 7)
      testsRunner.expect(addSpy).toHaveBeenLastCalledWith(5, 7)

      // Check call details
      testsRunner.expect(addSpy.calls).toHaveLength(2)
      testsRunner.expect(addSpy.calls[0].args).toEqual([2, 3])
      testsRunner.expect(addSpy.calls[0].result).toBe(5)
      testsRunner.expect(addSpy.calls[1].args).toEqual([5, 7])
      testsRunner.expect(addSpy.calls[1].result).toBe(12)
    })

    testsRunner.test('should preserve context', () => {
      const calculator = new Calculator()
      const historySpy = testsRunner.spyOn(calculator, 'getHistory')

      calculator.add(1, 2)
      calculator.multiply(3, 4)
      const history = calculator.getHistory()

      testsRunner.expect(historySpy).toHaveBeenCalledTimes(1)
      testsRunner.expect(history).toHaveLength(2)
      testsRunner.expect(history[0]).toMatch(/1 \+ 2 = 3/)
      testsRunner.expect(history[1]).toMatch(/3 \* 4 = 12/)
    })

    testsRunner.test('should spy on multiple methods', () => {
      const logger = new Logger()
      const infoSpy = testsRunner.spyOn(logger, 'info')
      const errorSpy = testsRunner.spyOn(logger, 'error')

      logger.info('Application started')
      logger.error('Something went wrong')
      logger.info('Operation completed')

      testsRunner.expect(infoSpy).toHaveBeenCalledTimes(2)
      testsRunner.expect(errorSpy).toHaveBeenCalledTimes(1)
      testsRunner.expect(infoSpy).toHaveBeenCalledWith('Application started')
      testsRunner.expect(errorSpy).toHaveBeenCalledWith('Something went wrong')
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Basic spy tests completed. Status: ${testsRunner.status}`)
}

async function runSpyImplementationExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Spy Implementations', () => {
    testsRunner.test('should override method behavior', () => {
      const calculator = new Calculator()
      const addSpy = testsRunner.spyOn(calculator, 'add')

      // Override the implementation
      addSpy.implement((a: number, b: number) => {
        console.log(`  🔄 Mock add called with ${a} and ${b}`)
        return a + b + 100 // Add 100 to every result
      })

      const result = calculator.add(2, 3)
      testsRunner.expect(result).toBe(105) // 2 + 3 + 100
      testsRunner.expect(addSpy).toHaveBeenCalledWith(2, 3)
    })

    testsRunner.test('should use implementOnce for temporary override', () => {
      const calculator = new Calculator()
      const multiplySpy = testsRunner.spyOn(calculator, 'multiply')

      // First call will be overridden
      multiplySpy.implementOnce((a: number, b: number) => {
        console.log(`  🔄 One-time override: ${a} * ${b}`)
        return 999
      })

      const result1 = calculator.multiply(2, 3)
      const result2 = calculator.multiply(2, 3)

      testsRunner.expect(result1).toBe(999) // Overridden
      testsRunner.expect(result2).toBe(6) // Original behavior
      testsRunner.expect(multiplySpy).toHaveBeenCalledTimes(2)
    })

    testsRunner.test('should use scenarios for conditional behavior', () => {
      const calculator = new Calculator()
      const addSpy = testsRunner.spyOn(calculator, 'add')

      // Setup scenarios
      addSpy.scenario([1, 1], 10) // When adding 1+1, return 10
      addSpy.scenario([5, 5], 50) // When adding 5+5, return 50

      testsRunner.expect(calculator.add(1, 1)).toBe(10) // Scenario match
      testsRunner.expect(calculator.add(5, 5)).toBe(50) // Scenario match
      testsRunner.expect(calculator.add(2, 3)).toBe(5) // Original behavior
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Spy implementation tests completed. Status: ${testsRunner.status}`)
}

async function runSpyRestorationExample(testsRunner: TestsRunner): Promise<void> {
  testsRunner.describe('Spy Restoration', () => {
    testsRunner.test('should restore original behavior', () => {
      const calculator = new Calculator()
      const addSpy = testsRunner.spyOn(calculator, 'add')

      // Override behavior
      addSpy.implement(() => 999)
      testsRunner.expect(calculator.add(1, 2)).toBe(999)

      // Restore original behavior
      addSpy.restore()
      testsRunner.expect(calculator.add(1, 2)).toBe(3) // Original behavior
    })

    testsRunner.test('should handle spy after restoration', () => {
      const logger = new Logger()
      const infoSpy = testsRunner.spyOn(logger, 'info')

      logger.info('Before restoration')
      testsRunner.expect(infoSpy).toHaveBeenCalledTimes(1)

      const callsBeforeRestore = infoSpy.calls.length
      infoSpy.restore()

      // After restoration, the original method still works
      logger.info('After restoration')
      // The spy object retains its call history from before restoration
      testsRunner.expect(infoSpy.calls.length).toBe(callsBeforeRestore)
      testsRunner.expect(infoSpy).toHaveBeenCalledWith('Before restoration')
    })

    testsRunner.test('should handle non-existent properties gracefully', () => {
      const obj = {}

      testsRunner
        .expect(() => {
          testsRunner.spyOn(obj, 'nonExistent')
        })
        .toThrow('Cannot spy on nonExistent: property does not exist')
    })
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name}`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Spy restoration tests completed. Status: ${testsRunner.status}`)
}
