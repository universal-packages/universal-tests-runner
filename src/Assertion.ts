import { AsymmetricAssertion } from './AsymmetricAssertion'
import { TestError } from './TestError'
import { MockFunctionCall } from './createMockFunction.types'
import { diff } from './diff'
import { DiffResult } from './diff.types'

export class Assertion {
  public readonly value: any

  private expectNot: boolean = false

  public get not() {
    this.expectNot = true
    return this
  }

  public constructor(value: any) {
    this.value = value
  }

  public toBe(expected: any) {
    if (this.expectNot) {
      if (this.value === expected || this.asymmetricAssertionPasses(expected))
        throw new TestError({
          message: `Expected {{expected}} not to be {{actual}}, but it was`,
          messageLocals: {
            expected: this.getMessageLocalName(expected),
            actual: this.getMessageLocalName(this.value)
          },
          expected,
          actual: this.value
        })
    } else {
      if (this.value !== expected && !this.asymmetricAssertionPasses(expected))
        throw new TestError({
          message: `Expected {{expected}} but got {{actual}}`,
          messageLocals: {
            expected: this.getMessageLocalName(expected),
            actual: this.getMessageLocalName(this.value)
          },
          expected,
          actual: this.value
        })
    }
  }

  public toEqual(expected: any) {
    const difference = this.diff(expected, this.value)

    if (this.expectNot) {
      if (difference.same) {
        throw new TestError({
          message: 'Expected {{expected}} not to equal {{actual}}, but it did',
          messageLocals: {
            expected: this.getMessageLocalName(expected),
            actual: this.getMessageLocalName(this.value)
          },
          expected,
          actual: this.value,
          difference
        })
      }
    } else {
      if (!difference.same) {
        let message: string = 'Expected {{expected}} to equal {{actual}}'
        let messageLocals: Record<string, string> = {
          expected: this.getMessageLocalName(expected),
          actual: this.getMessageLocalName(this.value)
        }

        if (difference.type === 'object') {
          message = 'Expected objects to be equal, but they were not'
          messageLocals = {}
        }

        if (difference.type === 'array') {
          message = 'Expected arrays to be equal, but they were not'
          messageLocals = {}
        }

        throw new TestError({
          message,
          messageLocals,
          expected,
          actual: this.value,
          difference
        })
      }
    }
  }

  public toBeNull() {
    if (this.expectNot) {
      if (this.value === null)
        throw new TestError({
          message: 'Expected value not to be null, but it was',
          messageLocals: {},
          expected: 'not null',
          actual: null
        })
    } else {
      if (this.value !== null)
        throw new TestError({
          message: 'Expected value to be null, but got {{actual}}',
          messageLocals: {
            actual: this.getMessageLocalName(this.value)
          },
          expected: null,
          actual: this.value
        })
    }
  }

  public toBeUndefined() {
    if (this.expectNot) {
      if (this.value === undefined)
        throw new TestError({
          message: 'Expected value not to be undefined, but it was',
          messageLocals: {},
          expected: 'not undefined',
          actual: undefined
        })
    } else {
      if (this.value !== undefined)
        throw new TestError({
          message: 'Expected value to be undefined, but got {{actual}}',
          messageLocals: {
            actual: this.getMessageLocalName(this.value)
          },
          expected: undefined,
          actual: this.value
        })
    }
  }

  public toBeDefined() {
    if (this.expectNot) {
      if (this.value !== undefined)
        throw new TestError({
          message: 'Expected value to be undefined, but got {{actual}}',
          messageLocals: {
            actual: this.getMessageLocalName(this.value)
          },
          expected: undefined,
          actual: this.value
        })
    } else {
      if (this.value === undefined)
        throw new TestError({
          message: 'Expected value to be defined, but it was undefined',
          messageLocals: {},
          expected: 'defined',
          actual: undefined
        })
    }
  }

  public toBeTruthy() {
    if (this.expectNot) {
      if (this.value)
        throw new TestError({
          message: 'Expected value to be falsy, but got {{actual}}',
          messageLocals: {
            actual: this.getMessageLocalName(this.value)
          },
          expected: 'falsy',
          actual: this.value
        })
    } else {
      if (!this.value)
        throw new TestError({
          message: 'Expected value to be truthy, but got {{actual}}',
          messageLocals: {
            actual: this.getMessageLocalName(this.value)
          },
          expected: 'truthy',
          actual: this.value
        })
    }
  }

  public toBeFalsy() {
    if (this.expectNot) {
      if (!this.value)
        throw new TestError({
          message: 'Expected value to be truthy, but got {{actual}}',
          messageLocals: {
            actual: this.getMessageLocalName(this.value)
          },
          expected: 'truthy',
          actual: this.value
        })
    } else {
      if (this.value)
        throw new TestError({
          message: 'Expected value to be falsy, but got {{actual}}',
          messageLocals: {
            actual: this.getMessageLocalName(this.value)
          },
          expected: 'falsy',
          actual: this.value
        })
    }
  }

  public toContain(item: any) {
    const isString = typeof this.value === 'string'
    const isArray = Array.isArray(this.value)

    if (!isString && !isArray) {
      throw new TestError({
        message: 'Expected a string or array, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'string or array',
        actual: this.value
      })
    }

    const contains = isString ? this.value.includes(item) : this.value.some((v: any) => v === item)

    if (this.expectNot) {
      if (contains)
        throw new TestError({
          message: 'Expected {{actual}} not to contain {{expected}}, but it did',
          messageLocals: {
            expected: this.getMessageLocalName(item),
            actual: this.getMessageLocalName(this.value)
          },
          expected: item,
          actual: this.value
        })
    } else {
      if (!contains)
        throw new TestError({
          message: 'Expected {{actual}} to contain {{expected}}, but it did not',
          messageLocals: {
            expected: this.getMessageLocalName(item),
            actual: this.getMessageLocalName(this.value)
          },
          expected: item,
          actual: this.value
        })
    }
  }

  public toHaveLength(length: number) {
    if (typeof this.value.length !== 'number') {
      throw new TestError({
        message: 'Expected value to have a length, but it does not',
        messageLocals: {},
        expected: 'value with length property',
        actual: this.value
      })
    }

    if (this.expectNot) {
      if (this.value.length === length)
        throw new TestError({
          message: 'Expected {{actual}} not to have length {{expected}}, but it did',
          messageLocals: {
            expected: String(length),
            actual: this.getMessageLocalName(this.value)
          },
          expected: length,
          actual: this.value.length
        })
    } else {
      if (this.value.length !== length)
        throw new TestError({
          message: 'Expected {{actual}} to have length {{expected}}, but got length {{actualLength}}',
          messageLocals: {
            expected: String(length),
            actual: this.getMessageLocalName(this.value),
            actualLength: String(this.value.length)
          },
          expected: length,
          actual: this.value.length
        })
    }
  }

  public toHaveProperty(path: string, value?: any) {
    const hasValue = arguments.length > 1
    const pathParts = path.split('.')
    let current = this.value
    let propertyExists = true

    for (const part of pathParts) {
      if (current === null || current === undefined || typeof current !== 'object') {
        propertyExists = false
        break
      }
      if (!(part in current)) {
        propertyExists = false
        break
      }
      current = current[part]
    }

    if (this.expectNot) {
      if (!hasValue && propertyExists) {
        throw new TestError({
          message: 'Expected object not to have property {{path}}, but it did',
          messageLocals: {
            path
          },
          expected: `no property ${path}`,
          actual: current
        })
      }
      if (hasValue && propertyExists && this.diff(value, current).same) {
        throw new TestError({
          message: 'Expected property {{path}} not to equal {{expected}}, but it did',
          messageLocals: {
            path,
            expected: this.getMessageLocalName(value)
          },
          expected: value,
          actual: current
        })
      }
    } else {
      if (!propertyExists) {
        throw new TestError({
          message: 'Expected object to have property {{path}}, but it did not',
          messageLocals: {
            path
          },
          expected: `property ${path}`,
          actual: this.value
        })
      }
      if (hasValue && !this.diff(value, current).same) {
        throw new TestError({
          message: 'Expected property {{path}} to equal {{expected}}, but got {{actual}}',
          messageLocals: {
            path,
            expected: this.getMessageLocalName(value),
            actual: this.getMessageLocalName(current)
          },
          expected: value,
          actual: current
        })
      }
    }
  }

  public toBeGreaterThan(number: number) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected a number, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'number',
        actual: this.value
      })
    }

    if (this.expectNot) {
      if (this.value > number)
        throw new TestError({
          message: 'Expected {{actual}} not to be greater than {{expected}}, but it was',
          messageLocals: {
            expected: String(number),
            actual: String(this.value)
          },
          expected: number,
          actual: this.value
        })
    } else {
      if (this.value <= number)
        throw new TestError({
          message: 'Expected {{actual}} to be greater than {{expected}}, but it was not',
          messageLocals: {
            expected: String(number),
            actual: String(this.value)
          },
          expected: number,
          actual: this.value
        })
    }
  }

  public toBeLessThan(number: number) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected a number, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'number',
        actual: this.value
      })
    }

    if (this.expectNot) {
      if (this.value < number)
        throw new TestError({
          message: 'Expected {{actual}} not to be less than {{expected}}, but it was',
          messageLocals: {
            expected: String(number),
            actual: String(this.value)
          },
          expected: number,
          actual: this.value
        })
    } else {
      if (this.value >= number)
        throw new TestError({
          message: 'Expected {{actual}} to be less than {{expected}}, but it was not',
          messageLocals: {
            expected: String(number),
            actual: String(this.value)
          },
          expected: number,
          actual: this.value
        })
    }
  }

  public toMatch(regex: RegExp) {
    if (typeof this.value !== 'string') {
      throw new TestError({
        message: 'Expected a string, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'string',
        actual: this.value
      })
    }

    const matches = regex.test(this.value)

    if (this.expectNot) {
      if (matches)
        throw new TestError({
          message: 'Expected {{actual}} not to match {{expected}}, but it did',
          messageLocals: {
            expected: String(regex),
            actual: this.value
          },
          expected: regex,
          actual: this.value
        })
    } else {
      if (!matches)
        throw new TestError({
          message: 'Expected {{actual}} to match {{expected}}, but it did not',
          messageLocals: {
            expected: String(regex),
            actual: this.value
          },
          expected: regex,
          actual: this.value
        })
    }
  }

  public toThrow(expected?: Error | RegExp | string) {
    if (typeof this.value !== 'function') {
      throw new TestError({
        message: 'Expected a function, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'function',
        actual: this.value
      })
    }

    let error: Error | undefined
    try {
      this.value()
    } catch (e) {
      error = e as Error
    }

    if (this.expectNot) {
      if (error) {
        if (!expected) {
          throw new TestError({
            message: 'Expected function not to throw, but it threw {{actual}}',
            messageLocals: {
              actual: error.message
            },
            expected: 'no error',
            actual: error
          })
        }

        let matches = false
        if (expected instanceof RegExp) {
          matches = expected.test(error.message)
        } else if (typeof expected === 'string') {
          matches = error.message.includes(expected)
        } else if (expected instanceof Error) {
          matches = error.message === expected.message
        }

        if (matches) {
          throw new TestError({
            message: 'Expected function not to throw matching error, but it did',
            messageLocals: {},
            expected: expected,
            actual: error
          })
        }
      }
    } else {
      if (!error) {
        throw new TestError({
          message: 'Expected function to throw, but it did not',
          messageLocals: {},
          expected: expected || 'error',
          actual: 'no error'
        })
      }

      if (expected) {
        let matches = false
        if (expected instanceof RegExp) {
          matches = expected.test(error.message)
        } else if (typeof expected === 'string') {
          matches = error.message.includes(expected)
        } else if (expected instanceof Error) {
          matches = error.message === expected.message
        }

        if (!matches) {
          throw new TestError({
            message: 'Expected function to throw matching error, but it threw {{actual}}',
            messageLocals: {
              actual: error.message
            },
            expected: expected,
            actual: error
          })
        }
      }
    }
  }

  public toBeInstanceOf(constructor: Function) {
    if (this.expectNot) {
      if (this.value instanceof constructor)
        throw new TestError({
          message: 'Expected {{actual}} not to be instance of {{expected}}, but it was',
          messageLocals: {
            expected: constructor.name,
            actual: this.getMessageLocalName(this.value)
          },
          expected: constructor.name,
          actual: this.value
        })
    } else {
      if (!(this.value instanceof constructor))
        throw new TestError({
          message: 'Expected {{actual}} to be instance of {{expected}}, but it was not',
          messageLocals: {
            expected: constructor.name,
            actual: this.getMessageLocalName(this.value)
          },
          expected: constructor.name,
          actual: this.value
        })
    }
  }

  public toBeCloseTo(number: number, precision: number = 2) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected a number, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'number',
        actual: this.value
      })
    }

    const pow = Math.pow(10, precision)
    const delta = Math.abs(this.value - number)
    const maxDelta = 1 / pow

    if (this.expectNot) {
      if (delta < maxDelta)
        throw new TestError({
          message: 'Expected {{actual}} not to be close to {{expected}} (precision: {{precision}}), but it was',
          messageLocals: {
            expected: String(number),
            actual: String(this.value),
            precision: String(precision)
          },
          expected: number,
          actual: this.value
        })
    } else {
      if (delta >= maxDelta)
        throw new TestError({
          message: 'Expected {{actual}} to be close to {{expected}} (precision: {{precision}}), but it was not',
          messageLocals: {
            expected: String(number),
            actual: String(this.value),
            precision: String(precision)
          },
          expected: number,
          actual: this.value
        })
    }
  }

  public async toResolve(expected?: any): Promise<void> {
    if (typeof this.value?.then !== 'function') {
      throw new TestError({
        message: 'Expected a promise, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'promise',
        actual: this.value
      })
    }

    try {
      const result = await this.value

      if (this.expectNot) {
        if (arguments.length > 0) {
          // We expected it to not resolve with a specific value
          // Check if the resolved value matches the expected value
          const difference = this.diff(expected, result)

          if (difference.same) {
            throw new TestError({
              message: 'Expected promise not to resolve with {{expected}}, but it resolved with that value',
              messageLocals: {
                expected: this.getMessageLocalName(expected)
              },
              expected,
              actual: result,
              difference
            })
          }
          // If it resolved with a different value, that's a success case for .not.toResolve(expected)
        } else {
          throw new TestError({
            message: 'Expected promise to not resolve (reject), but it resolved with {{actual}}',
            messageLocals: {
              actual: this.getMessageLocalName(result)
            },
            expected: 'no resolution',
            actual: result
          })
        }
      } else if (arguments.length > 0) {
        // Check if the resolved value matches the expected value
        const difference = this.diff(expected, result)

        if (!difference.same) {
          throw new TestError({
            message: 'Expected promise to resolve with {{expected}}, but got {{actual}}',
            messageLocals: {
              expected: this.getMessageLocalName(expected),
              actual: this.getMessageLocalName(result)
            },
            expected,
            actual: result,
            difference
          })
        }
      }
    } catch (error) {
      if (error instanceof TestError) throw error

      if (!this.expectNot) {
        // If we're here, the promise rejected but we expected it to resolve
        throw new TestError({
          message: 'Expected promise to resolve, but it rejected with {{actual}}',
          messageLocals: {
            actual: error instanceof Error ? error.message : this.getMessageLocalName(error)
          },
          expected: 'resolution',
          actual: error
        })
      } else if (arguments.length > 0) {
        // We expected it to not resolve with a specific value
        // Since it rejected, it indeed didn't resolve with that value
        // So this is actually a success case for `.not.toResolve(expected)`
      }
    }
  }

  public async toReject(expected?: string | RegExp | Error): Promise<void> {
    if (typeof this.value?.then !== 'function') {
      throw new TestError({
        message: 'Expected a promise, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'promise',
        actual: this.value
      })
    }

    try {
      const result = await this.value

      if (!this.expectNot) {
        // We expected the promise to reject, but it resolved
        throw new TestError({
          message: 'Expected promise to reject, but it resolved with {{actual}}',
          messageLocals: {
            actual: this.getMessageLocalName(result)
          },
          expected: 'rejection',
          actual: result
        })
      }
    } catch (error) {
      if (error instanceof TestError) throw error

      if (this.expectNot) {
        // We expected the promise not to reject, but it did
        if (arguments.length === 0) {
          // We expected it not to reject at all
          throw new TestError({
            message: 'Expected promise not to reject, but it rejected with {{actual}}',
            messageLocals: {
              actual: error instanceof Error ? error.message : this.getMessageLocalName(error)
            },
            expected: 'no rejection',
            actual: error
          })
        } else {
          // We expected it not to reject with a specific error
          let matches = false

          if (expected instanceof RegExp) {
            matches = expected.test(error instanceof Error ? error.message : String(error))
          } else if (typeof expected === 'string') {
            matches = (error instanceof Error ? error.message : String(error)).includes(expected)
          } else if (expected instanceof Error) {
            matches = error instanceof Error && error.message === expected.message
          }

          if (matches) {
            throw new TestError({
              message: 'Expected promise not to reject with {{expected}}, but it did',
              messageLocals: {
                expected: expected instanceof Error ? expected.message : this.getMessageLocalName(expected)
              },
              expected,
              actual: error
            })
          }
        }
      } else {
        // We expected the promise to reject, which it did
        if (arguments.length > 0) {
          // We expected it to reject with a specific error
          let matches = false

          if (expected instanceof RegExp) {
            matches = expected.test(error instanceof Error ? error.message : String(error))
          } else if (typeof expected === 'string') {
            matches = (error instanceof Error ? error.message : String(error)).includes(expected)
          } else if (expected instanceof Error) {
            matches = error instanceof Error && error.message === expected.message
          }

          if (!matches) {
            throw new TestError({
              message: 'Expected promise to reject with {{expected}}, but it rejected with {{actual}}',
              messageLocals: {
                expected: expected instanceof Error ? expected.message : this.getMessageLocalName(expected),
                actual: error instanceof Error ? error.message : this.getMessageLocalName(error)
              },
              expected,
              actual: error
            })
          }
        }
      }
    }
  }

  public toBeGreaterThanOrEqual(number: number) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected a number, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'number',
        actual: this.value
      })
    }

    if (this.expectNot) {
      if (this.value >= number)
        throw new TestError({
          message: 'Expected {{actual}} not to be greater than or equal to {{expected}}, but it was',
          messageLocals: {
            expected: String(number),
            actual: String(this.value)
          },
          expected: number,
          actual: this.value
        })
    } else {
      if (this.value < number)
        throw new TestError({
          message: 'Expected {{actual}} to be greater than or equal to {{expected}}, but it was not',
          messageLocals: {
            expected: String(number),
            actual: String(this.value)
          },
          expected: number,
          actual: this.value
        })
    }
  }

  public toBeLessThanOrEqual(number: number) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected a number, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'number',
        actual: this.value
      })
    }

    if (this.expectNot) {
      if (this.value <= number)
        throw new TestError({
          message: 'Expected {{actual}} not to be less than or equal to {{expected}}, but it was',
          messageLocals: {
            expected: String(number),
            actual: String(this.value)
          },
          expected: number,
          actual: this.value
        })
    } else {
      if (this.value > number)
        throw new TestError({
          message: 'Expected {{actual}} to be less than or equal to {{expected}}, but it was not',
          messageLocals: {
            expected: String(number),
            actual: String(this.value)
          },
          expected: number,
          actual: this.value
        })
    }
  }

  public toBeNaN() {
    const isNaN = Number.isNaN(this.value)

    if (this.expectNot) {
      if (isNaN)
        throw new TestError({
          message: 'Expected value not to be NaN, but it was',
          messageLocals: {},
          expected: 'not NaN',
          actual: NaN
        })
    } else {
      if (!isNaN)
        throw new TestError({
          message: 'Expected value to be NaN, but got {{actual}}',
          messageLocals: {
            actual: this.getMessageLocalName(this.value)
          },
          expected: NaN,
          actual: this.value
        })
    }
  }

  public toContainEqual(item: any) {
    const isArray = Array.isArray(this.value)

    if (!isArray) {
      throw new TestError({
        message: 'Expected an array, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'array',
        actual: this.value
      })
    }

    const containsEqual = this.value.some((v: any) => this.diff(v, item).same)

    if (this.expectNot) {
      if (containsEqual)
        throw new TestError({
          message: 'Expected {{actual}} not to contain an item equal to {{expected}}, but it did',
          messageLocals: {
            expected: this.getMessageLocalName(item),
            actual: this.getMessageLocalName(this.value)
          },
          expected: item,
          actual: this.value
        })
    } else {
      if (!containsEqual)
        throw new TestError({
          message: 'Expected {{actual}} to contain an item equal to {{expected}}, but it did not',
          messageLocals: {
            expected: this.getMessageLocalName(item),
            actual: this.getMessageLocalName(this.value)
          },
          expected: item,
          actual: this.value
        })
    }
  }

  public toMatchObject(object: Record<string, any>) {
    if (typeof this.value !== 'object' || this.value === null) {
      throw new TestError({
        message: 'Expected an object, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'object',
        actual: this.value
      })
    }

    const difference = this.diff(object, this.value)

    // Returns true if all differences are only 'added' (i.e., actual has extra keys, but all expected keys match)
    const isOnlyAdded = (diff: DiffResult): boolean => {
      if (diff.type === 'object') {
        return Object.values(diff.keys).every((child) => {
          if (child.type === 'added') return true
          if (child.type === 'object' || child.type === 'array') return isOnlyAdded(child)
          return child.same
        })
      }
      if (diff.type === 'array') {
        return diff.items.every((child) => {
          if (child.type === 'added') return true
          if (child.type === 'object' || child.type === 'array') return isOnlyAdded(child)
          return child.same
        })
      }
      // For primitives, only 'added' or 'same' are allowed
      return diff.type === 'added' || diff.same
    }

    // Returns a copy of the diff with all 'added' keys/items removed
    const stripAddedTypes = (diff: DiffResult): DiffResult => {
      if (diff.type === 'object') {
        const newKeys: Record<string, DiffResult> = {}
        for (const [key, child] of Object.entries(diff.keys)) {
          if (child.type === 'added') continue
          newKeys[key] = stripAddedTypes(child)
        }
        return { ...diff, keys: newKeys }
      }
      if (diff.type === 'array') {
        const newItems = diff.items.filter((child) => child.type !== 'added').map(stripAddedTypes)
        return { ...diff, items: newItems }
      }
      return diff
    }

    const differenceWithoutAdded = stripAddedTypes(difference)

    if (this.expectNot) {
      if (difference.same || isOnlyAdded(difference)) {
        throw new TestError({
          message: 'Expected {{expected}} not to match {{actual}}',
          messageLocals: {
            expected: this.getMessageLocalName(object),
            actual: this.getMessageLocalName(this.value)
          },
          expected: object,
          actual: this.value,
          difference: differenceWithoutAdded
        })
      }
    } else {
      if (!difference.same && !isOnlyAdded(difference)) {
        throw new TestError({
          message: 'Expected {{expected}} to match {{actual}}',
          messageLocals: {
            expected: this.getMessageLocalName(object),
            actual: this.getMessageLocalName(this.value)
          },
          expected: object,
          actual: this.value,
          difference: differenceWithoutAdded
        })
      }
    }
  }

  public toHaveBeenCalled() {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected a mock function, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'mock function',
        actual: this.value
      })
    }

    const callCount = this.value.calls.length

    if (this.expectNot) {
      if (callCount > 0) {
        throw new TestError({
          message: 'Expected mock function not to have been called, but it was called {{count}} times',
          messageLocals: {
            count: String(callCount)
          },
          expected: 0,
          actual: callCount
        })
      }
    } else {
      if (callCount === 0) {
        throw new TestError({
          message: 'Expected mock function to have been called, but it was not called',
          messageLocals: {},
          expected: 'at least 1 call',
          actual: '0 calls'
        })
      }
    }
  }

  public toHaveBeenCalledWith(...args: any[]) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected a mock function, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'mock function',
        actual: this.value
      })
    }

    const calls: MockFunctionCall[] = this.value.calls
    const callDiffs = calls.map((call) => this.diff(args, call.args))

    // Check if any call matches the expected arguments
    const matchingCall = callDiffs.some((diff) => diff.same)

    if (this.expectNot) {
      if (matchingCall) {
        throw new TestError({
          message: 'Expected mock function not to have been called with given arguments, but it was',
          messageLocals: {},
          expected: args,
          actual: calls.map((call) => call.args),
          differences: callDiffs
        })
      }
    } else {
      if (!matchingCall) {
        throw new TestError({
          message: 'Expected mock function to have been called with given arguments, but it was not',
          messageLocals: {},
          expected: args,
          actual: calls.map((call) => call.args),
          differences: callDiffs
        })
      }
    }
  }

  public toHaveBeenCalledTimes(expectedCount: number) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected a mock function, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'mock function',
        actual: this.value
      })
    }

    const callCount = this.value.calls.length

    if (this.expectNot) {
      if (callCount === expectedCount) {
        throw new TestError({
          message: 'Expected mock function not to have been called {{expected}} times, but it was',
          messageLocals: {
            expected: String(expectedCount)
          },
          expected: expectedCount,
          actual: callCount
        })
      }
    } else {
      if (callCount !== expectedCount) {
        throw new TestError({
          message: 'Expected mock function to have been called {{expected}} times, but it was called {{actual}} times',
          messageLocals: {
            expected: String(expectedCount),
            actual: String(callCount)
          },
          expected: expectedCount,
          actual: callCount
        })
      }
    }
  }

  public toHaveBeenLastCalledWith(...args: any[]) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected a mock function, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'mock function',
        actual: this.value
      })
    }

    const calls: MockFunctionCall[] = this.value.calls

    if (calls.length === 0) {
      throw new TestError({
        message: 'Expected mock function to have been called, but it was not called',
        messageLocals: {},
        expected: 'at least 1 call',
        actual: '0 calls'
      })
    }

    const lastCall = calls[calls.length - 1]
    const diff = this.diff(args, lastCall.args)

    if (this.expectNot) {
      if (diff.same) {
        throw new TestError({
          message: 'Expected last call not to have been called with given arguments, but it was',
          messageLocals: {},
          expected: args,
          actual: lastCall.args,
          difference: diff
        })
      }
    } else {
      if (!diff.same) {
        throw new TestError({
          message: 'Expected last call to have been called with {{expected}}, but it was called with {{actual}}',
          messageLocals: {
            expected: this.getMessageLocalName(args),
            actual: this.getMessageLocalName(lastCall.args)
          },
          expected: args,
          actual: lastCall.args,
          difference: diff
        })
      }
    }
  }

  public toHaveBeenCalledTimesWith(expectedCount: number, ...args: any[]) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected a mock function, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'mock function',
        actual: this.value
      })
    }

    const calls: MockFunctionCall[] = this.value.calls
    const matchingCalls = calls.filter((call) => this.diff(args, call.args).same)
    const matchCount = matchingCalls.length

    if (this.expectNot) {
      if (matchCount === expectedCount) {
        throw new TestError({
          message: 'Expected mock function not to have been called {{expected}} times with given arguments, but it was',
          messageLocals: {
            expected: String(expectedCount)
          },
          expected: expectedCount,
          actual: matchCount
        })
      }
    } else {
      if (matchCount !== expectedCount) {
        throw new TestError({
          message: 'Expected mock function to have been called {{expected}} times with given arguments, but it was called {{actual}} times with those arguments',
          messageLocals: {
            expected: String(expectedCount),
            actual: String(matchCount)
          },
          expected: expectedCount,
          actual: matchCount,
          allCalls: calls.map((call) => call.args)
        })
      }
    }
  }

  public toHaveBeenNthCalledWith(n: number, ...args: any[]) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected a mock function, but got {{actual}}',
        messageLocals: {
          actual: this.getMessageLocalName(this.value)
        },
        expected: 'mock function',
        actual: this.value
      })
    }

    const calls: MockFunctionCall[] = this.value.calls

    if (n <= 0) {
      throw new TestError({
        message: 'N must be a positive integer',
        messageLocals: {},
        expected: 'positive integer',
        actual: n
      })
    }

    if (calls.length < n) {
      throw new TestError({
        message: 'Expected mock function to have been called at least {{expected}} times, but it was called {{actual}} times',
        messageLocals: {
          expected: String(n),
          actual: String(calls.length)
        },
        expected: n,
        actual: calls.length
      })
    }

    const nthCall = calls[n - 1]
    const diff = this.diff(args, nthCall.args)

    if (this.expectNot) {
      if (diff.same) {
        throw new TestError({
          message: 'Expected {{n}}th call not to have been called with given arguments, but it was',
          messageLocals: {
            n: String(n)
          },
          expected: args,
          actual: nthCall.args,
          difference: diff
        })
      }
    } else {
      if (!diff.same) {
        throw new TestError({
          message: 'Expected {{n}}th call to have been called with {{expected}}, but it was called with {{actual}}',
          messageLocals: {
            n: String(n),
            expected: this.getMessageLocalName(args),
            actual: this.getMessageLocalName(nthCall.args)
          },
          expected: args,
          actual: nthCall.args,
          difference: diff
        })
      }
    }
  }

  protected diff(expected: any, actual: any) {
    return diff(expected, actual)
  }

  protected getMessageLocalName(value: any) {
    if (AsymmetricAssertion.isAsymmetricAssertion(value)) return value.name
    if (Array.isArray(value)) return 'Array'
    if (typeof value === 'object' && value !== null) return 'Object'

    return String(value)
  }

  protected asymmetricAssertionPasses(assertion: AsymmetricAssertion) {
    return AsymmetricAssertion.isAsymmetricAssertion(assertion) && assertion.assert(this.value)
  }
}
