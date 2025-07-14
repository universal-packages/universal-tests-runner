import { AsymmetricAssertion } from './AsymmetricAssertion'
import { TestError } from './TestError'
import { MessageLocal } from './TestError.types'
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

  public toBe(target: any) {
    if (this.expectNot) {
      if (this.value === target || this.asymmetricAssertionPasses(target))
        throw new TestError({
          message: `Expected {{actual}} not to be {{target}}, but it was`,
          messageLocals: {
            target: this.getMessageLocal(target),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (this.value !== target && !this.asymmetricAssertionPasses(target))
        throw new TestError({
          message: `Expected {{actual}} to be {{target}}`,
          messageLocals: {
            target: this.getMessageLocal(target),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toEqual(target: any) {
    const difference = diff(target, this.value)

    if (this.expectNot) {
      if (difference.same) {
        throw new TestError({
          message: 'Expected {{actual}} not to equal {{target}}, but it did',
          messageLocals: {
            target: this.getMessageLocal(target),
            actual: this.getMessageLocal(this.value)
          },
          difference
        })
      }
    } else {
      if (!difference.same) {
        throw new TestError({
          message: 'Expected {{actual}} to equal {{target}}',
          messageLocals: {
            target: this.getMessageLocal(target),
            actual: this.getMessageLocal(this.value)
          },
          difference
        })
      }
    }
  }

  public toBeNull() {
    if (this.expectNot) {
      if (this.value === null)
        throw new TestError({
          message: 'Expected {{actual}} not to be {{target}}, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            target: this.getMessageLocal(null)
          }
        })
    } else {
      if (this.value !== null)
        throw new TestError({
          message: 'Expected {{actual}} to be {{target}}',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            target: this.getMessageLocal(null)
          }
        })
    }
  }

  public toBeUndefined() {
    if (this.expectNot) {
      if (this.value === undefined)
        throw new TestError({
          message: 'Expected {{actual}} not to be {{target}}, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            target: this.getMessageLocal(undefined)
          }
        })
    } else {
      if (this.value !== undefined)
        throw new TestError({
          message: 'Expected {{actual}} to be {{target}}',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            target: this.getMessageLocal(undefined)
          }
        })
    }
  }

  public toBeDefined() {
    if (this.expectNot) {
      if (this.value !== undefined)
        throw new TestError({
          message: 'Expected {{actual}} to not be defined, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (this.value === undefined)
        throw new TestError({
          message: 'Expected {{actual}} to be defined',
          messageLocals: {
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toBeTruthy() {
    if (this.expectNot) {
      if (this.value)
        throw new TestError({
          message: 'Expected {{actual}} to not be truthy, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (!this.value)
        throw new TestError({
          message: 'Expected {{actual}} to be truthy',
          messageLocals: {
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toBeFalsy() {
    if (this.expectNot) {
      if (!this.value)
        throw new TestError({
          message: 'Expected {{actual}} to not be falsy, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (this.value)
        throw new TestError({
          message: 'Expected {{actual}} to be falsy',
          messageLocals: {
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toContain(item: any) {
    const isString = typeof this.value === 'string'
    const isArray = Array.isArray(this.value)

    if (!isString && !isArray) {
      throw new TestError({
        message: 'Expectation {{actual}} is not a string or array',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const contains = isString ? this.value.includes(item) : this.value.some((v: any) => v === item)

    if (this.expectNot) {
      if (contains)
        throw new TestError({
          message: 'Expected {{actual}} not to contain {{target}}, but it did',
          messageLocals: {
            target: this.getMessageLocal(item),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (!contains)
        throw new TestError({
          message: 'Expected {{actual}} to contain {{target}}',
          messageLocals: {
            target: this.getMessageLocal(item),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toHaveLength(length: number) {
    if (typeof this.value.length !== 'number') {
      throw new TestError({
        message: 'Target length {{target}} is not a number',
        messageLocals: {
          target: this.getMessageLocal(length)
        }
      })
    }

    if (this.expectNot) {
      if (this.value.length === length)
        throw new TestError({
          message: 'Expected {{actual}} not to have length of {{target}}, but it did',
          messageLocals: {
            target: this.getMessageLocal(length),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (this.value.length !== length)
        throw new TestError({
          message: 'Expected {{actual}} to have length of {{target}}, but got length {{actualLength}}',
          messageLocals: {
            target: this.getMessageLocal(length),
            actual: this.getMessageLocal(this.value),
            actualLength: this.getMessageLocal(this.value.length)
          }
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

    const targetPropertyValueDiff = diff(value, current)

    if (this.expectNot) {
      if (!hasValue && propertyExists) {
        throw new TestError({
          message: 'Expected {{actual}} not to have property in path {{path}}, but it did',
          messageLocals: {
            path: this.getMessageLocal(path),
            actual: this.getMessageLocal(this.value)
          }
        })
      }
      if (hasValue && propertyExists && targetPropertyValueDiff.same) {
        throw new TestError({
          message: 'Expected {{actual}} not to have property in path {{path}} equal to {{target}}, but it did',
          messageLocals: {
            path: this.getMessageLocal(path),
            target: this.getMessageLocal(value),
            actual: this.getMessageLocal(this.value)
          }
        })
      }
    } else {
      if (!propertyExists) {
        throw new TestError({
          message: 'Expected {{actual}} to have property in path {{path}}, but it did not',
          messageLocals: {
            path: this.getMessageLocal(path),
            actual: this.getMessageLocal(this.value)
          }
        })
      }
      if (hasValue && !targetPropertyValueDiff.same) {
        throw new TestError({
          message: 'Expected {{actual}} to have property in path {{path}} equal to {{target}}',
          messageLocals: {
            path: this.getMessageLocal(path),
            target: this.getMessageLocal(value),
            actual: this.getMessageLocal(this.value)
          },
          difference: targetPropertyValueDiff
        })
      }
    }
  }

  public toBeGreaterThan(number: number) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected {{actual}} to be a number',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    if (this.expectNot) {
      if (this.value > number)
        throw new TestError({
          message: 'Expected {{actual}} not to be greater than {{target}}, but it was',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (this.value <= number)
        throw new TestError({
          message: 'Expected {{actual}} to be greater than {{target}}',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toBeLessThan(number: number) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected {{actual}} to be a number',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    if (this.expectNot) {
      if (this.value < number)
        throw new TestError({
          message: 'Expected {{actual}} not to be less than {{target}}, but it was',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (this.value >= number)
        throw new TestError({
          message: 'Expected {{actual}} to be less than {{target}}',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toMatch(regex: RegExp) {
    if (typeof this.value !== 'string') {
      throw new TestError({
        message: 'Expected {{actual}} to be a string',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const matches = regex.test(this.value)

    if (this.expectNot) {
      if (matches)
        throw new TestError({
          message: 'Expected {{actual}} not to match {{target}}, but it did',
          messageLocals: {
            target: this.getMessageLocal(regex),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (!matches)
        throw new TestError({
          message: 'Expected {{actual}} to match {{target}}',
          messageLocals: {
            target: this.getMessageLocal(regex),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toThrow(target?: Error | RegExp | string) {
    if (typeof this.value !== 'function') {
      throw new TestError({
        message: 'Expected {{actual}} to be a function',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
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
        if (!target) {
          throw new TestError({
            message: 'Expected {{actual}} not to throw, but it threw {{error}}',
            messageLocals: {
              actual: this.getMessageLocal(this.value),
              error: this.getMessageLocal(error)
            }
          })
        }

        let matches = false
        if (target instanceof RegExp) {
          matches = target.test(error.message)
        } else if (typeof target === 'string') {
          matches = error.message.includes(target)
        } else if (target instanceof Error) {
          matches = error.message === target.message
        }

        if (matches) {
          throw new TestError({
            message: 'Expected {{actual}} not to throw {{target}}, but it did',
            messageLocals: {
              actual: this.getMessageLocal(this.value),
              target: this.getMessageLocal(target)
            }
          })
        }
      }
    } else {
      if (!error) {
        throw new TestError({
          message: 'Expected {{actual}} to throw, but it did not',
          messageLocals: {
            actual: this.getMessageLocal(this.value)
          }
        })
      }

      if (target) {
        let matches = false
        if (target instanceof RegExp) {
          matches = target.test(error.message)
        } else if (typeof target === 'string') {
          matches = error.message.includes(target)
        } else if (target instanceof Error) {
          matches = error.message === target.message
        }

        if (!matches) {
          throw new TestError({
            message: 'Expected {{actual}} to throw {{target}}, but it threw {{error}}',
            messageLocals: {
              actual: this.getMessageLocal(this.value),
              target: this.getMessageLocal(target),
              error: this.getMessageLocal(error)
            }
          })
        }
      }
    }
  }

  public toBeInstanceOf(target: Function) {
    if (this.expectNot) {
      if (this.value instanceof target)
        throw new TestError({
          message: 'Expected {{actual}} not to be instance of {{target}}, but it was',
          messageLocals: {
            target: this.getMessageLocal(target),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (!(this.value instanceof target))
        throw new TestError({
          message: 'Expected {{actual}} to be instance of {{target}}',
          messageLocals: {
            target: this.getMessageLocal(target),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toBeCloseTo(number: number, precision: number = 2) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected {{actual}} to be a number',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const pow = Math.pow(10, precision)
    const delta = Math.abs(this.value - number)
    const maxDelta = 1 / pow

    if (this.expectNot) {
      if (delta < maxDelta)
        throw new TestError({
          message: 'Expected {{actual}} not to be close to {{target}} (precision: {{precision}}), but it was',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value),
            precision: this.getMessageLocal(precision)
          }
        })
    } else {
      if (delta >= maxDelta)
        throw new TestError({
          message: 'Expected {{actual}} to be close to {{target}} (precision: {{precision}})',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value),
            precision: this.getMessageLocal(precision)
          }
        })
    }
  }

  public async toResolve(target?: any): Promise<void> {
    if (typeof this.value?.then !== 'function') {
      throw new TestError({
        message: 'Expected {{actual}} to be a promise',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    try {
      const result = await this.value

      if (this.expectNot) {
        if (arguments.length > 0) {
          // We expected it to not resolve with a specific value
          // Check if the resolved value matches the expected value
          const difference = diff(target, result)

          if (difference.same) {
            throw new TestError({
              message: 'Expected {{actual}} not to resolve with {{target}}, but it did',
              messageLocals: {
                target: this.getMessageLocal(target),
                actual: this.getMessageLocal(this.value)
              },
              difference
            })
          }
          // If it resolved with a different value, that's a success case for .not.toResolve(expected)
        } else {
          throw new TestError({
            message: 'Expected {{actual}} not to resolve, but it did',
            messageLocals: {
              actual: this.getMessageLocal(this.value)
            }
          })
        }
      } else if (arguments.length > 0) {
        // Check if the resolved value matches the expected value
        const difference = diff(target, result)

        if (!difference.same) {
          throw new TestError({
            message: 'Expected {{actual}} to resolve with {{target}}',
            messageLocals: {
              target: this.getMessageLocal(target),
              actual: this.getMessageLocal(this.value)
            },
            difference
          })
        }
      }
    } catch (error) {
      if (error instanceof TestError) throw error

      if (!this.expectNot) {
        // If we're here, the promise rejected but we expected it to resolve
        throw new TestError({
          message: 'Expected {{actual}} to resolve, but it rejected with {{error}}',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            error: this.getMessageLocal(error)
          }
        })
      } else if (arguments.length > 0) {
        // We expected it to not resolve with a specific value
        // Since it rejected, it indeed didn't resolve with that value
        // So this is actually a success case for `.not.toResolve(expected)`
      }
    }
  }

  public async toReject(target?: string | RegExp | Error): Promise<void> {
    if (typeof this.value?.then !== 'function') {
      throw new TestError({
        message: 'Expected {{actual}} to be a promise',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    try {
      const result = await this.value

      if (!this.expectNot) {
        // We expected the promise to reject, but it resolved
        throw new TestError({
          message: 'Expected {{actual}} to reject, but it resolved with {{result}}',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            result: this.getMessageLocal(result)
          }
        })
      }
    } catch (error) {
      if (error instanceof TestError) throw error

      if (this.expectNot) {
        // We expected the promise not to reject, but it did
        if (arguments.length === 0) {
          // We expected it not to reject at all
          throw new TestError({
            message: 'Expected {{actual}} not to reject, but it did with {{error}}',
            messageLocals: {
              actual: this.getMessageLocal(this.value),
              error: this.getMessageLocal(error)
            }
          })
        } else {
          // We expected it not to reject with a specific error
          let matches = false

          if (target instanceof RegExp) {
            matches = target.test(error instanceof Error ? error.message : String(error))
          } else if (typeof target === 'string') {
            matches = (error instanceof Error ? error.message : String(error)).includes(target)
          } else if (target instanceof Error) {
            matches = error instanceof Error && error.message === target.message
          }

          if (matches) {
            throw new TestError({
              message: 'Expected {{actual}} not to reject with {{target}}, but it did',
              messageLocals: {
                target: this.getMessageLocal(target),
                actual: this.getMessageLocal(this.value)
              }
            })
          }
        }
      } else {
        // We expected the promise to reject, which it did
        if (arguments.length > 0) {
          // We expected it to reject with a specific error
          let matches = false

          if (target instanceof RegExp) {
            matches = target.test(error instanceof Error ? error.message : String(error))
          } else if (typeof target === 'string') {
            matches = (error instanceof Error ? error.message : String(error)).includes(target)
          } else if (target instanceof Error) {
            matches = error instanceof Error && error.message === target.message
          }

          if (!matches) {
            throw new TestError({
              message: 'Expected {{actual}} to reject with {{target}}, but it rejected with {{error}}',
              messageLocals: {
                target: this.getMessageLocal(target),
                actual: this.getMessageLocal(this.value),
                error: this.getMessageLocal(error)
              }
            })
          }
        }
      }
    }
  }

  public toBeGreaterThanOrEqual(number: number) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected {{actual}} to be a number',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    if (this.expectNot) {
      if (this.value >= number)
        throw new TestError({
          message: 'Expected {{actual}} not to be greater than or equal to {{target}}, but it was',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (this.value < number)
        throw new TestError({
          message: 'Expected {{actual}} to be greater than or equal to {{target}}',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toBeLessThanOrEqual(number: number) {
    if (typeof this.value !== 'number') {
      throw new TestError({
        message: 'Expected {{actual}} to be a number',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    if (this.expectNot) {
      if (this.value <= number)
        throw new TestError({
          message: 'Expected {{actual}} not to be less than or equal to {{target}}, but it was',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (this.value > number)
        throw new TestError({
          message: 'Expected {{actual}} to be less than or equal to {{target}}',
          messageLocals: {
            target: this.getMessageLocal(number),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toBeNaN() {
    const isNaN = Number.isNaN(this.value)

    if (this.expectNot) {
      if (isNaN)
        throw new TestError({
          message: 'Expected {{actual}} not to be {{target}}, but it was',
          messageLocals: {
            target: this.getMessageLocal(NaN),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (!isNaN)
        throw new TestError({
          message: 'Expected {{actual}} to be {{target}}',
          messageLocals: {
            target: this.getMessageLocal(NaN),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toContainEqual(item: any) {
    const isArray = Array.isArray(this.value)

    if (!isArray) {
      throw new TestError({
        message: 'Expected {{actual}} to be an array',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const containsEqual = this.value.some((v: any) => diff(v, item).same)

    if (this.expectNot) {
      if (containsEqual)
        throw new TestError({
          message: 'Expected {{actual}} not to contain an item equal to {{target}}, but it did',
          messageLocals: {
            target: this.getMessageLocal(item),
            actual: this.getMessageLocal(this.value)
          }
        })
    } else {
      if (!containsEqual)
        throw new TestError({
          message: 'Expected {{actual}} to contain an item equal to {{target}}',
          messageLocals: {
            target: this.getMessageLocal(item),
            actual: this.getMessageLocal(this.value)
          }
        })
    }
  }

  public toMatchObject(target: Record<string, any>) {
    if (typeof this.value !== 'object' || this.value === null) {
      throw new TestError({
        message: 'Expected {{actual}} to be an object',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const difference = diff(target, this.value)

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
          message: 'Expected {{actual}} not to match {{target}}',
          messageLocals: {
            target: this.getMessageLocal(target),
            actual: this.getMessageLocal(this.value)
          },
          difference: differenceWithoutAdded
        })
      }
    } else {
      if (!difference.same && !isOnlyAdded(difference)) {
        throw new TestError({
          message: 'Expected {{actual}} to match {{target}}',
          messageLocals: {
            target: this.getMessageLocal(target),
            actual: this.getMessageLocal(this.value)
          },
          difference: differenceWithoutAdded
        })
      }
    }
  }

  public toHaveBeenCalled() {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected {{actual}} to be a mock function',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const callCount = this.value.calls.length

    if (this.expectNot) {
      if (callCount > 0) {
        throw new TestError({
          message: 'Expected {{actual}} not to have been called, but it was called {{count}} times',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            count: this.getMessageLocal(callCount)
          }
        })
      }
    } else {
      if (callCount === 0) {
        throw new TestError({
          message: 'Expected {{actual}} to have been called, but it was not called',
          messageLocals: {
            actual: this.getMessageLocal(this.value)
          }
        })
      }
    }
  }

  public toHaveBeenCalledWith(...args: any[]) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected {{actual}} to be a mock function',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const calls: MockFunctionCall[] = this.value.calls
    const callDiffs = calls.map((call) => diff(args, call.args))

    // Check if any call matches the expected arguments
    const matchingCall = callDiffs.some((diff) => diff.same)

    if (this.expectNot) {
      if (matchingCall) {
        throw new TestError({
          message: 'Expected {{actual}} not to have been called with {{args}}, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            args: this.getMessageLocal(args)
          }
        })
      }
    } else {
      if (!matchingCall) {
        throw new TestError({
          message: 'Expected {{actual}} to have been called with {{args}}',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            args: this.getMessageLocal(args)
          },
          differences: callDiffs
        })
      }
    }
  }

  public toHaveBeenCalledTimes(targetCount: number) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected {{actual}} to be a mock function',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const callCount = this.value.calls.length

    if (this.expectNot) {
      if (callCount === targetCount) {
        throw new TestError({
          message: 'Expected {{actual}} not to have been called {{target}} times, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            target: this.getMessageLocal(targetCount)
          }
        })
      }
    } else {
      if (callCount !== targetCount) {
        throw new TestError({
          message: 'Expected {{actual}} to have been called {{target}} times, but it was called {{count}} times',
          messageLocals: {
            target: this.getMessageLocal(targetCount),
            actual: this.getMessageLocal(callCount),
            count: this.getMessageLocal(callCount)
          }
        })
      }
    }
  }

  public toHaveBeenLastCalledWith(...args: any[]) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected {{actual}} to be a mock function',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const calls: MockFunctionCall[] = this.value.calls

    if (calls.length === 0) {
      throw new TestError({
        message: 'Expected {{actual}} to have been called, but it was not called',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const lastCall = calls[calls.length - 1]
    const callDiff = diff(args, lastCall.args)

    if (this.expectNot) {
      if (callDiff.same) {
        throw new TestError({
          message: 'Expected {{actual}} not to have been called last with {{args}}, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            args: this.getMessageLocal(args)
          }
        })
      }
    } else {
      if (!callDiff.same) {
        throw new TestError({
          message: 'Expected {{actual}} to have been called last with {{args}}',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            args: this.getMessageLocal(args)
          },
          difference: callDiff
        })
      }
    }
  }

  public toHaveBeenCalledTimesWith(targetCount: number, ...args: any[]) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected {{actual}} to be a mock function',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const calls: MockFunctionCall[] = this.value.calls
    const matchingCalls = calls.filter((call) => diff(args, call.args).same)
    const matchCount = matchingCalls.length

    if (this.expectNot) {
      if (matchCount === targetCount) {
        throw new TestError({
          message: 'Expected {{actual}} not to have been called {{target}} times with {{args}}, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            target: this.getMessageLocal(targetCount),
            args: this.getMessageLocal(args)
          }
        })
      }
    } else {
      if (matchCount !== targetCount) {
        throw new TestError({
          message: 'Expected {{actual}} to have been called {{target}} times with {{args}}, but it was called {{count}} times',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            target: this.getMessageLocal(targetCount),
            args: this.getMessageLocal(args),
            count: this.getMessageLocal(matchCount)
          }
        })
      }
    }
  }

  public toHaveBeenNthCalledWith(n: number, ...args: any[]) {
    if (typeof this.value !== 'function' || !('calls' in this.value)) {
      throw new TestError({
        message: 'Expected {{actual}} to be a mock function',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const calls: MockFunctionCall[] = this.value.calls

    if (n <= 0) {
      throw new TestError({
        message: 'Expected {{n}} to be a positive integer',
        messageLocals: {
          n: this.getMessageLocal(n)
        }
      })
    }

    if (calls.length < n) {
      throw new TestError({
        message: 'Expected {{actual}} to have been called, but it was not',
        messageLocals: {
          actual: this.getMessageLocal(this.value)
        }
      })
    }

    const nthCall = calls[n - 1]
    const callDiff = diff(args, nthCall.args)

    if (this.expectNot) {
      if (callDiff.same) {
        throw new TestError({
          message: 'Expected {{actual}} not to have been called {{n}}th with {{args}}, but it was',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            n: this.getMessageLocal(n),
            args: this.getMessageLocal(args)
          }
        })
      }
    } else {
      if (!callDiff.same) {
        throw new TestError({
          message: 'Expected {{actual}} to have been called {{n}}th with {{args}}',
          messageLocals: {
            actual: this.getMessageLocal(this.value),
            n: this.getMessageLocal(n),
            args: this.getMessageLocal(args)
          },
          difference: callDiff
        })
      }
    }
  }

  protected getMessageLocal(value: any): MessageLocal {
    switch (typeof value) {
      case 'function':
        return {
          type: 'function',
          representation: '[Function]'
        }
      case 'object':
        if (value === null) {
          return {
            type: 'null',
            representation: 'null'
          }
        }
        if (Array.isArray(value)) {
          return {
            type: 'array',
            representation: '[Array]'
          }
        }
        if (AsymmetricAssertion.isAsymmetricAssertion(value)) {
          return {
            type: 'asymmetric-assertion',
            representation: value.constructor.name
          }
        }
        if (value?.constructor?.name) {
          return {
            type: 'instanceOf',
            representation: value.constructor.name
          }
        }
        return {
          type: 'object',
          representation: '[Object]'
        }
      case 'string':
        return {
          type: 'string',
          representation: `'${value}'`
        }
      case 'number':
        return {
          type: 'number',
          representation: `${value}`
        }
      case 'boolean':
        return {
          type: 'boolean',
          representation: `${value}`
        }
      case 'undefined':
        return {
          type: 'undefined',
          representation: 'undefined'
        }
      default:
        return {
          type: 'object',
          representation: '[Object]'
        }
    }
  }

  protected asymmetricAssertionPasses(assertion: AsymmetricAssertion) {
    return AsymmetricAssertion.isAsymmetricAssertion(assertion) && assertion.assert(this.value)
  }
}
