import { TestsRunner } from '../src'

// Sample class to test
class Calculator {
  add(a: number, b: number): number {
    return a + b
  }

  subtract(a: number, b: number): number {
    return a - b
  }

  multiply(a: number, b: number): number {
    return a * b
  }

  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Division by zero')
    }
    return a / b
  }

  isEven(n: number): boolean {
    return n % 2 === 0
  }
}

export async function runBasicTestsExample(): Promise<void> {
  console.log('🚀 Running Basic Tests Example')
  console.log('='.repeat(50))

  // Example 1: Simple test structure
  console.log('\n1️⃣  Basic Test Structure:')
  const testsRunner1 = new TestsRunner({ identifier: 'basic-example-1' })
  await runBasicExample(testsRunner1)

  // Example 2: Nested describe blocks
  console.log('\n2️⃣  Nested Describe Blocks:')
  const testsRunner2 = new TestsRunner({ identifier: 'basic-example-2' })
  await runNestedExample(testsRunner2)

  // Example 3: Using only and skip
  console.log('\n3️⃣  Only and Skip Tests:')
  const testsRunner3 = new TestsRunner({ identifier: 'basic-example-3' })
  await runOnlySkipExample(testsRunner3)

  console.log('='.repeat(50))
}

async function runBasicExample(testsRunner: TestsRunner): Promise<void> {
  const calculator = new Calculator()

  testsRunner.describe('Calculator', () => {
    testsRunner.test('should add two numbers', () => {
      const result = calculator.add(2, 3)
      testsRunner.expect(result).toEqual(5)
    })

    testsRunner.test('should subtract two numbers', () => {
      const result = calculator.subtract(5, 3)
      testsRunner.expect(result).toEqual(2)
    })

    testsRunner.test('should handle division by zero', () => {
      testsRunner
        .expect(() => {
          calculator.divide(10, 0)
        })
        .toThrow('Division by zero')
    })
  })

  // Alternative syntax using `it` (it is an alias for test)
  testsRunner.describe('Calculator (using it syntax)', () => {
    testsRunner.it('should multiply two numbers', () => {
      const result = calculator.multiply(4, 5)
      testsRunner.expect(result).toEqual(20)
    })

    testsRunner.it('should check if number is even', () => {
      testsRunner.expect(calculator.isEven(4)).toBe(true)
      testsRunner.expect(calculator.isEven(5)).toBe(false)
    })
  })

  // Listen to events
  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ ${event.payload.test.name} - passed`)
  })

  testsRunner.on('test:failed', (event) => {
    console.log(`  ❌ ${event.payload.test.name} - failed: ${event.payload.reason}`)
  })

  const results = await testsRunner.run()
  console.log(`📊 Tests completed. Status: ${testsRunner.status}`)
}

async function runNestedExample(testsRunner: TestsRunner): Promise<void> {
  const calculator = new Calculator()

  testsRunner.describe('Mathematical Operations', () => {
    testsRunner.describe('Basic Operations', () => {
      testsRunner.describe('Addition', () => {
        testsRunner.test('should add positive numbers', () => {
          testsRunner.expect(calculator.add(1, 2)).toEqual(3)
        })

        testsRunner.test('should add negative numbers', () => {
          testsRunner.expect(calculator.add(-1, -2)).toEqual(-3)
        })
      })

      testsRunner.describe('Subtraction', () => {
        testsRunner.test('should subtract positive numbers', () => {
          testsRunner.expect(calculator.subtract(5, 3)).toEqual(2)
        })

        testsRunner.test('should handle negative results', () => {
          testsRunner.expect(calculator.subtract(3, 5)).toEqual(-2)
        })
      })
    })

    testsRunner.describe('Advanced Operations', () => {
      testsRunner.test('should multiply', () => {
        testsRunner.expect(calculator.multiply(3, 4)).toEqual(12)
      })

      testsRunner.test('should divide', () => {
        testsRunner.expect(calculator.divide(12, 3)).toEqual(4)
      })
    })
  })

  testsRunner.on('succeeded', () => {
    console.log('  🎉 All nested tests passed!')
  })

  testsRunner.on('failed', (event) => {
    console.log(`  ⚠️  Some tests failed: ${event.payload.reason}`)
  })

  await testsRunner.run()
  console.log(`📊 Nested tests completed. Status: ${testsRunner.status}`)
}

async function runOnlySkipExample(testsRunner: TestsRunner): Promise<void> {
  const calculator = new Calculator()

  testsRunner.describe('Only and Skip Demo', () => {
    testsRunner.test('normal test - should run', () => {
      testsRunner.expect(calculator.add(1, 1)).toEqual(2)
    })

    testsRunner.test(
      'skipped test - should be skipped',
      () => {
        testsRunner.expect(calculator.add(1, 1)).toEqual(3) // This would fail, but it's skipped
      },
      { skip: true, skipReason: 'This test is intentionally skipped' }
    )

    testsRunner.describe('Only describe block', () => {
      testsRunner.test(
        'only test - should run',
        () => {
          testsRunner.expect(calculator.multiply(2, 3)).toEqual(6)
        },
        { only: true }
      )

      testsRunner.test(
        'another only test - should run',
        () => {
          testsRunner.expect(calculator.subtract(5, 2)).toEqual(3)
        },
        { only: true }
      )
    })

    testsRunner.test('this test should be skipped because only tests are active', () => {
      testsRunner.expect(calculator.add(1, 1)).toEqual(2)
    })
  })

  testsRunner.on('test:skipped', (event) => {
    const reason = event.payload.reason || 'No reason provided'
    console.log(`  ⏭️  Skipped: ${event.payload.test.name} - ${reason}`)
  })

  testsRunner.on('test:succeeded', (event) => {
    console.log(`  ✅ Passed: ${event.payload.test.name}`)
  })

  await testsRunner.run()
  console.log(`📊 Only/Skip tests completed. Status: ${testsRunner.status}`)
}
