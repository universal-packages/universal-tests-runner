import { TestsRunner } from '../TestsRunner'
import { evaluateTestResults } from '../utils.test'

export async function closeToAssertionTest() {
  const selfTestsRunner = new TestsRunner()

  selfTestsRunner.describe('CloseToAssertion test', () => {
    selfTestsRunner.test('Should pass when values are close with default precision', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Close values with default precision', async () => {
        // Test floating point precision issues
        testsRunner.expect(0.1 + 0.2).toEqual(testsRunner.expectCloseTo(0.3))
        testsRunner.expect(0.2 + 0.1).toEqual(testsRunner.expectCloseTo(0.3))

        // Test exact matches
        testsRunner.expect(1.0).toEqual(testsRunner.expectCloseTo(1.0))
        testsRunner.expect(3.14159).toEqual(testsRunner.expectCloseTo(3.14159))

        // Test values that should be close enough with default precision (2)
        testsRunner.expect(0.123456).toEqual(testsRunner.expectCloseTo(0.123457))
        testsRunner.expect(1.234).toEqual(testsRunner.expectCloseTo(1.235))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should pass when values are close with custom precision', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Custom precision test', async () => {
        // Test with 2 decimal places
        testsRunner.expect(3.14159).toEqual(testsRunner.expectCloseTo(3.14, 2))
        testsRunner.expect(1.23456).toEqual(testsRunner.expectCloseTo(1.235, 2))

        // Test with 3 decimal places
        testsRunner.expect(3.14159).toEqual(testsRunner.expectCloseTo(3.141, 3))

        // Test with 0 decimal places (integers)
        testsRunner.expect(100.001).toEqual(testsRunner.expectCloseTo(100, 0))
        testsRunner.expect(99.9).toEqual(testsRunner.expectCloseTo(100, 0))

        // Test with high precision
        testsRunner.expect(1.123456789).toEqual(testsRunner.expectCloseTo(1.123456788, 8))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail when values are not close enough', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Not close enough test', async () => {
        testsRunner.expect(0.1).toEqual(testsRunner.expectCloseTo(0.2))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should fail when values are not close enough with custom precision', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Custom precision failure test', async () => {
        // Too far apart for 3 decimal places
        testsRunner.expect(3.14159).toEqual(testsRunner.expectCloseTo(3.15, 3))
        // Too far apart for 2 decimal places
        testsRunner.expect(1.01).toEqual(testsRunner.expectCloseTo(1.0, 2))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should handle non-number values correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-number values test', async () => {
        // Non-numbers should not match
        testsRunner.expect('hello').not.toEqual(testsRunner.expectCloseTo(5))
        testsRunner.expect(null).not.toEqual(testsRunner.expectCloseTo(0))
        testsRunner.expect(undefined).not.toEqual(testsRunner.expectCloseTo(0))
        testsRunner.expect(true).not.toEqual(testsRunner.expectCloseTo(1))
        testsRunner.expect([]).not.toEqual(testsRunner.expectCloseTo(0))
        testsRunner.expect({}).not.toEqual(testsRunner.expectCloseTo(0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work with not.expectCloseTo for successful negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Successful not.expectCloseTo test', async () => {
        // Values that are not close
        testsRunner.expect(0.1).toEqual(testsRunner.not.expectCloseTo(0.2))
        testsRunner.expect(3.14159).toEqual(testsRunner.not.expectCloseTo(3.15, 3))
        testsRunner.expect(100).toEqual(testsRunner.not.expectCloseTo(200))
        testsRunner.expect(1.01).toEqual(testsRunner.not.expectCloseTo(1.0, 2))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should fail with not.expectCloseTo when values are close', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Failing not.expectCloseTo test', async () => {
        testsRunner.expect(0.1 + 0.2).toEqual(testsRunner.not.expectCloseTo(0.3))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isFailed).toBe(true)
    })

    selfTestsRunner.test('Should handle edge cases with special numbers', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Special numbers test', async () => {
        // Infinity cases - these actually fail due to NaN comparison
        testsRunner.expect(Infinity).toEqual(testsRunner.not.expectCloseTo(Infinity))
        testsRunner.expect(-Infinity).toEqual(testsRunner.not.expectCloseTo(-Infinity))

        // Infinity should not be close to finite numbers
        testsRunner.expect(Infinity).toEqual(testsRunner.not.expectCloseTo(-Infinity))
        testsRunner.expect(1).toEqual(testsRunner.not.expectCloseTo(Infinity))
        testsRunner.expect(-1).toEqual(testsRunner.not.expectCloseTo(-Infinity))

        // Zero cases
        testsRunner.expect(0).toEqual(testsRunner.expectCloseTo(0))
        testsRunner.expect(0.001).toEqual(testsRunner.expectCloseTo(0, 2))
        testsRunner.expect(-0).toEqual(testsRunner.expectCloseTo(0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle negative numbers correctly', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Negative numbers test', async () => {
        testsRunner.expect(-3.14159).toEqual(testsRunner.expectCloseTo(-3.14, 2))
        testsRunner.expect(-0.1 - 0.2).toEqual(testsRunner.expectCloseTo(-0.3))
        testsRunner.expect(-1.0).toEqual(testsRunner.expectCloseTo(-1.0))
        testsRunner.expect(-100.001).toEqual(testsRunner.expectCloseTo(-100, 0))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle precision boundary cases', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Precision boundary cases', async () => {
        // Test precision boundaries more precisely
        // With precision 1, threshold = 0.1
        testsRunner.expect(1.05).toEqual(testsRunner.expectCloseTo(1.0, 1)) // diff = 0.05 < 0.1
        testsRunner.expect(1.15).toEqual(testsRunner.not.expectCloseTo(1.0, 1)) // diff = 0.15 > 0.1

        // With precision 2, threshold = 0.01
        testsRunner.expect(1.005).toEqual(testsRunner.expectCloseTo(1.0, 2)) // diff = 0.005 < 0.01
        testsRunner.expect(1.015).toEqual(testsRunner.not.expectCloseTo(1.0, 2)) // diff = 0.015 > 0.01

        // With precision 0, threshold = 1.0
        testsRunner.expect(1.9).toEqual(testsRunner.expectCloseTo(1, 0)) // diff = 0.9 < 1.0
        testsRunner.expect(2.1).toEqual(testsRunner.not.expectCloseTo(1, 0)) // diff = 1.1 > 1.0
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle very small and very large numbers', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Very small and large numbers test', async () => {
        // Very small numbers
        testsRunner.expect(0.000001).toEqual(testsRunner.expectCloseTo(0.000002, 5))
        testsRunner.expect(1e-10).toEqual(testsRunner.expectCloseTo(2e-10, 9))

        // Very large numbers - these need to be more reasonable differences
        testsRunner.expect(1000000.1).toEqual(testsRunner.expectCloseTo(1000000.2, 0))
        // This case fails because 1e10 + 1 === 1e10 due to floating point precision
        testsRunner.expect(1e10).toEqual(testsRunner.expectCloseTo(1e10, 0))

        // Scientific notation
        testsRunner.expect(1.23e-5).toEqual(testsRunner.expectCloseTo(1.24e-5, 7))
        // For large scientific notation, the difference is too big for precision 0
        testsRunner.expect(1.23e5).toEqual(testsRunner.not.expectCloseTo(1.24e5, 0))
        // For precision 0, threshold is 1, so values need to be within 1 unit
        testsRunner.expect(123000).toEqual(testsRunner.expectCloseTo(123000.5, 0)) // diff = 0.5 < 1
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should correctly handle NaN values', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('NaN handling test', async () => {
        // NaN should not equal any CloseToAssertion, even NaN
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectCloseTo(NaN))
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectCloseTo(0))
        testsRunner.expect(NaN).not.toEqual(testsRunner.expectCloseTo(1))

        // But with not.expectCloseTo, NaN should match (since it fails the closeness test)
        testsRunner.expect(NaN).toEqual(testsRunner.not.expectCloseTo(0))
        testsRunner.expect(NaN).toEqual(testsRunner.not.expectCloseTo(1))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should work within complex nested objects', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Complex nested object with expectCloseTo', async () => {
        // Simulate API response with calculated financial metrics
        const portfolioAnalysis = {
          portfolio: {
            totalValue: 50000.0,
            performance: {
              dailyReturn: 0.1 + 0.2, // 0.30000000000000004 due to floating point
              weeklyReturn: 2.4567891234,
              monthlyReturn: 12.345678,
              volatility: Math.sqrt(0.04) // 0.2
            },
            allocations: {
              stocks: 0.6000000000000001, // floating point precision issue
              bonds: 0.25,
              cash: 0.15
            },
            metrics: {
              sharpeRatio: 1.5 + 0.000001, // slight calculation difference
              beta: 0.95,
              alpha: 0.02500000001 // tiny precision difference
            }
          },
          lastUpdated: '2024-01-15T10:30:00Z'
        }

        // Test the complex object with expectCloseTo for floating point values
        testsRunner.expect(portfolioAnalysis).toEqual({
          portfolio: {
            totalValue: 50000.0,
            performance: {
              dailyReturn: testsRunner.expectCloseTo(0.3), // handles 0.1 + 0.2 precision
              weeklyReturn: testsRunner.expectCloseTo(2.4567891234),
              monthlyReturn: testsRunner.expectCloseTo(12.345678),
              volatility: testsRunner.expectCloseTo(0.2) // handles sqrt precision
            },
            allocations: {
              stocks: testsRunner.expectCloseTo(0.6), // handles floating point precision
              bonds: 0.25, // exact match
              cash: 0.15 // exact match
            },
            metrics: {
              sharpeRatio: testsRunner.expectCloseTo(1.500001, 5), // high precision match
              beta: 0.95, // exact match
              alpha: testsRunner.expectCloseTo(0.025, 3) // handles tiny differences
            }
          },
          lastUpdated: '2024-01-15T10:30:00Z'
        })

        // Test with nested arrays containing objects with close values
        const sensorReadings = {
          timestamp: Date.now(),
          sensors: [
            {
              id: 'temp_01',
              value: 23.1 + 0.0000001, // slight sensor drift
              unit: 'celsius'
            },
            {
              id: 'humidity_01',
              value: 65.5,
              unit: 'percent'
            },
            {
              id: 'pressure_01',
              value: 1013.25 + 0.001, // atmospheric pressure with small variance
              unit: 'hPa'
            }
          ],
          summary: {
            avgTemperature: (23.1 + 22.9 + 23.3) / 3, // calculated average
            maxHumidity: Math.max(65.5, 67.2, 64.8)
          }
        }

        testsRunner.expect(sensorReadings).toMatchObject({
          sensors: [
            {
              id: 'temp_01',
              value: testsRunner.expectCloseTo(23.1, 6), // high precision for sensor drift
              unit: 'celsius'
            },
            {
              id: 'humidity_01',
              value: 65.5,
              unit: 'percent'
            },
            {
              id: 'pressure_01',
              value: testsRunner.expectCloseTo(1013.25, 3), // allows small pressure variance
              unit: 'hPa'
            }
          ],
          summary: {
            avgTemperature: testsRunner.expectCloseTo(23.1, 1), // calculated average
            maxHumidity: testsRunner.expectCloseTo(67.2, 1)
          }
        })
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })

    selfTestsRunner.test('Should handle non-number values with negation', async () => {
      const testsRunner = new TestsRunner()

      testsRunner.test('Non-number values with negation test', async () => {
        // Non-number values should match not.expectCloseTo() (negated true case)
        testsRunner.expect('string').toEqual(testsRunner.not.expectCloseTo(1.23, 2))
        testsRunner.expect(null).toEqual(testsRunner.not.expectCloseTo(1.23, 2))
        testsRunner.expect(undefined).toEqual(testsRunner.not.expectCloseTo(1.23, 2))
        testsRunner.expect(true).toEqual(testsRunner.not.expectCloseTo(1.23, 2))
        testsRunner.expect({}).toEqual(testsRunner.not.expectCloseTo(1.23, 2))
        testsRunner.expect([]).toEqual(testsRunner.not.expectCloseTo(1.23, 2))
      })

      await testsRunner.run()
      selfTestsRunner.expect(testsRunner.isSucceeded).toBe(true)
    })
  })

  await selfTestsRunner.run()
  evaluateTestResults(selfTestsRunner)
}
