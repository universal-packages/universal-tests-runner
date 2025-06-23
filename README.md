# Tests Runner

[![npm version](https://badge.fury.io/js/@universal-packages%2Ftests-runner.svg)](https://www.npmjs.com/package/@universal-packages/tests-runner)
[![Testing](https://github.com/universal-packages/universal-tests-runner/actions/workflows/testing.yml/badge.svg)](https://github.com/universal-packages/universal-tests-runner/actions/workflows/testing.yml)
[![codecov](https://codecov.io/gh/universal-packages/universal-tests-runner/branch/main/graph/badge.svg?token=CXPJSN8IGL)](https://codecov.io/gh/universal-packages/universal-tests-runner)

Tests runner and utilities.

# Getting Started

```shell
npm install @universal-packages/tests-runner
```

# Usage

## TestsRunner `class`

The `TestsRunner` class is a utility where you pack and organize your tests. It also supplies all matchers and utilities for testing.

```ts
import { TestsRunner } from '@universal-packages/tests-runner'

import { MyCode } from './my-code'

const testsRunner = new TestsRunner()

testsRunner.describe(MyCode, () => {
  testsRunner.it('should do something', () => {
    const result = MyCode.doSomething()
    testsRunner.expect(result).toEqual('expected result')
  })
})

const testResults = await testsRunner.run()
```

### Constructor <small><small>`constructor`</small></small>

```ts
new TestsRunner(options?: TestsRunnerOptions)
```

#### TestsRunnerOptions

Additional to the [BaseRunnerOptions](https://github.com/universal-packages/universal-base-runner?tab=readme-ov-file#baserunneroptions), the following options are available:

- **`bail`**: `boolean` (default: `false`)
  If a test fails, the tests-runner will stop and mark the test suite as failed.
- **`runOrder`**: `sequence` | `random` | `parallel` (default: `sequence`)
  It defines the order of the tests.
  - **`sequence`**: Run tests in the order they are defined.
  - **`random`**: Run tests in random order.
  - **`parallel`**: Run tests in parallel.
- **`testTimeout`**: `number` (default: `5000`)
  If the test takes longer than the timeout, it will be killed and marked as failed.

### Tests description

#### describe

```ts
describe(description: string, callback: () => void, options?: DescribeOptions)
```

The `describe` method is used to group tests together.

```ts
testsRunner.describe(MyCode, () => {
  testsRunner.describe('when passing a string', () => {
    testsRunner.it('should do something', () => {
      const result = MyCode.doSomething('test')
      testsRunner.expect(result).toEqual('string found')
    })

    testsRunner.describe('when passing an array', () => {
      testsRunner.it('should do something', () => {
        const result = MyCode.doSomething(['test'])
        testsRunner.expect(result).toEqual('array found')
      })
    })
  })
})
```

##### DescribeOptions

- **`only`**: `boolean` (default: `false`)
  It will run only the tests that are inside the `describe` block.
- **`skip`**: `boolean` (default: `false`)
  It will skip the tests that are inside the `describe` block.
- **`skipReason`**: `string` (default: `null`)
  Information about why the tests are skipped.
- **`timeout`**: `number` (default: `5000`)
  If the test inside the `describe` block takes longer than the timeout, it will be killed and marked as failed.

#### when

```ts
when(description: string, callback: () => void)
```

The `when` is an alias for the `describe` method.

#### test

```ts
test(description: string, callback: () => void)
```

The `test` method is used to run a single test. It can be inside a `describe` block or by itself.

```ts
tests -
  runner.test('should do something', () => {
    const result = MyCode.doSomething()
    tests - runner.expect(result).toEqual('expected result')
  })
```

##### TestOptions

- **`only`**: `boolean` (default: `false`)
  It will run only the tests that are inside the `describe` block.
- **`skip`**: `boolean` (default: `false`)
  It will skip the tests that are inside the `describe` block.
- **`skipReason`**: `string` (default: `null`)
  Information about why the tests are skipped.
- **`timeout`**: `number` (default: `5000`)
  If the test takes longer than the timeout, it will be killed and marked as failed.

#### it

```ts
it(description: string, callback: () => void)
```

The `it` method is an alias for the `test` method.

### Tests lifecycle

#### before

```ts
before(callback: () => void | Promise<void>)
```

The `before` method is used to run a function before the immediate tests are run. For example, if you need something to happen before the whole test suite is run, you can use the `before` method outside of all the `describe` blocks.

```ts
testsRunner.before(() => {
  console.log('before the whole test suite')
})
```

If you want to run something just before a group of tests inside a `describe` block, you can use the `before` method inside the `describe` block.

```ts
testsRunner.describe('when passing a string', () => {
  testsRunner.before(() => {
    console.log('before the tests inside the describe block')
  })
})
```

#### beforeEach

```ts
beforeEach(callback: () => void | Promise<void>)
```

The `beforeEach` method is used to run a function before each test. Just like the `before` method, it can be inside a `describe` block or by itself. If it is outside of a `describe` block, it will run before each test.

```ts
testsRunner.beforeEach(() => {
  console.log('before each test')
})
```

If it is inside a `describe` block, it will run before each test inside that `describe` block.

```ts
testsRunner.describe('when passing a string', () => {
  testsRunner.beforeEach(() => {
    console.log('before each test inside the describe block')
  })
})
```

#### after

```ts
after(callback: () => void | Promise<void>)
```

The `after` method is used to run a function after the immediate tests are run. For example, if you need something to happen after the whole test suite is run, you can use the `after` method outside of all the `describe` blocks.

```ts
testsRunner.after(() => {
  console.log('after the whole test suite')
})
```

If you want to run something just after a group of tests inside a `describe` block, you can use the `after` method inside the `describe` block.

```ts
testsRunner.describe('when passing a string', () => {
  testsRunner.after(() => {
    console.log('after the tests inside the describe block')
  })
})
```

#### afterEach

```ts
afterEach(callback: () => void | Promise<void>)
```

The `afterEach` method is used to run a function after each test. Just like the `after` method, it can be inside a `describe` block or by itself. If it is outside of a `describe` block, it will run after each test.

```ts
testsRunner.afterEach(() => {
  console.log('after each test inside the describe block')
})
```

If it is inside a `describe` block, it will run after each test inside that `describe` block.

```ts
testsRunner.describe('when passing a string', () => {
  testsRunner.afterEach(() => {
    console.log('after each test inside the describe block')
  })
})
```

### Test matchers

The `TestsRunner` class has a set of matchers that can be used to test the value of a variable.

#### expect

```ts
expect(value: any)
```

The `expect` method is used to setup an assertion with the obtained value of some calculation.

```ts
testsRunner.expect(result).toEqual('expected result')
```

#### toBe

```ts
toBe(value: any)
```

The `toBe` matcher is used to test if the value of a variable is equal to the expected value. It works the same way as the `toEqual` matcher for primitive values, but it will not work for objects and arrays. For an object or array, it will check if the value is the same instance of the expected value.

```ts
tests - runner.expect(result).toBe(expectedResult)
```

#### toBeCloseTo

```ts
toBeCloseTo(number: number, precision?: number)
```

The `toBeCloseTo` matcher is used to test if a floating point number is close to the expected value within a certain precision. The default precision is 2 decimal places.

```ts
testsRunner.expect(0.1 + 0.2).toBeCloseTo(0.3)
testsRunner.expect(0.1 + 0.2).toBeCloseTo(0.3, 5)
```

#### toBeDefined

```ts
toBeDefined()
```

The `toBeDefined` matcher is used to test if the value is not `undefined`.

```ts
testsRunner.expect(result).toBeDefined()
```

#### toBeFalsy

```ts
toBeFalsy()
```

The `toBeFalsy` matcher is used to test if the value is falsy (evaluates to `false` in a boolean context).

```ts
testsRunner.expect(result).toBeFalsy()
```

#### toBeGreaterThan

```ts
toBeGreaterThan(number: number)
```

The `toBeGreaterThan` matcher is used to test if a number is greater than the expected value.

```ts
testsRunner.expect(10).toBeGreaterThan(5)
```

#### toBeGreaterThanOrEqual

```ts
toBeGreaterThanOrEqual(number: number)
```

The `toBeGreaterThanOrEqual` matcher is used to test if a number is greater than or equal to the expected value.

```ts
testsRunner.expect(10).toBeGreaterThanOrEqual(10)
testsRunner.expect(15).toBeGreaterThanOrEqual(10)
```

#### toBeInstanceOf

```ts
toBeInstanceOf(constructor: Function)
```

The `toBeInstanceOf` matcher is used to test if an object is an instance of a specific constructor function or class.

```ts
testsRunner.expect(new Date()).toBeInstanceOf(Date)
testsRunner.expect([]).toBeInstanceOf(Array)
testsRunner.expect('hello').toBeInstanceOf(String)
```

#### toBeLessThan

```ts
toBeLessThan(number: number)
```

The `toBeLessThan` matcher is used to test if a number is less than the expected value.

```ts
testsRunner.expect(5).toBeLessThan(10)
```

#### toBeLessThanOrEqual

```ts
toBeLessThanOrEqual(number: number)
```

The `toBeLessThanOrEqual` matcher is used to test if a number is less than or equal to the expected value.

```ts
testsRunner.expect(10).toBeLessThanOrEqual(10)
testsRunner.expect(5).toBeLessThanOrEqual(10)
```

#### toBeNaN

```ts
toBeNaN()
```

The `toBeNaN` matcher is used to test if the value is `NaN`.

```ts
testsRunner.expect(NaN).toBeNaN()
testsRunner.expect(Number('not a number')).toBeNaN()
```

#### toBeNull

```ts
toBeNull()
```

The `toBeNull` matcher is used to test if the value is `null`.

```ts
testsRunner.expect(result).toBeNull()
```

#### toBeTruthy

```ts
toBeTruthy()
```

The `toBeTruthy` matcher is used to test if the value is truthy (evaluates to `true` in a boolean context).

```ts
testsRunner.expect(result).toBeTruthy()
```

#### toBeUndefined

```ts
toBeUndefined()
```

The `toBeUndefined` matcher is used to test if the value is `undefined`.

```ts
testsRunner.expect(result).toBeUndefined()
```

#### toContain

```ts
toContain(item: any)
```

The `toContain` matcher is used to test if an array contains a specific item or if a string contains a substring.

```ts
testsRunner.expect(['apple', 'banana', 'cherry']).toContain('banana')
testsRunner.expect('hello world').toContain('world')
```

#### toContainEqual

```ts
toContainEqual(item: any)
```

The `toContainEqual` matcher is used to test if an array contains an item that is equal to the expected value (using deep equality comparison).

```ts
testsRunner.expect([{ name: 'John' }, { name: 'Jane' }]).toContainEqual({ name: 'John' })
```

#### toEqual

```ts
toEqual(value: any)
```

The `toEqual` matcher is used to test if the value of a variable is equal to the expected value. It works for primitive values, arrays, and objects. For objects, it will check if the value is equal to the expected value by comparing the keys and values. For arrays, it will check if the value is equal to the expected value by comparing the length and the values of the array.

```ts
testsRunner.expect(result).toEqual('expected result')
```

#### toHaveLength

```ts
toHaveLength(length: number)
```

The `toHaveLength` matcher is used to test if an array, string, or any object with a `length` property has the expected length.

```ts
testsRunner.expect([1, 2, 3]).toHaveLength(3)
testsRunner.expect('hello').toHaveLength(5)
```

#### toHaveProperty

```ts
toHaveProperty(path: string, value?: any)
```

The `toHaveProperty` matcher is used to test if an object has a specific property. Optionally, you can also check if the property has a specific value. The path can use dot notation for nested properties.

```ts
testsRunner.expect({ name: 'John', age: 30 }).toHaveProperty('name')
testsRunner.expect({ name: 'John', age: 30 }).toHaveProperty('name', 'John')
testsRunner.expect({ user: { name: 'John' } }).toHaveProperty('user.name', 'John')
```

#### toMatch

```ts
toMatch(regex: RegExp)
```

The `toMatch` matcher is used to test if a string matches a regular expression.

```ts
testsRunner.expect('hello world').toMatch(/world/)
testsRunner.expect('123-456-7890').toMatch(/\d{3}-\d{3}-\d{4}/)
```

#### toMatchObject

```ts
toMatchObject(object: Record<string, any>)
```

The `toMatchObject` matcher is used to test if an object matches a subset of properties from the expected object. The actual object can have additional properties.

```ts
testsRunner.expect({ name: 'John', age: 30, city: 'New York' }).toMatchObject({ name: 'John', age: 30 })
```

#### toReject

```ts
async toReject(expected?: string | RegExp | Error): Promise<void>
```

The `toReject` matcher is used to test if a promise rejects. You can optionally specify the expected error message, error instance, or a regex pattern.

```ts
await testsRunner.expect(Promise.reject(new Error('Failed'))).toReject()
await testsRunner.expect(Promise.reject(new Error('Failed'))).toReject('Failed')
await testsRunner.expect(Promise.reject(new Error('Failed'))).toReject(/Failed/)
```

#### toResolve

```ts
async toResolve(expected?: any): Promise<void>
```

The `toResolve` matcher is used to test if a promise resolves successfully. You can optionally specify the expected resolved value.

```ts
await testsRunner.expect(Promise.resolve('success')).toResolve()
await testsRunner.expect(Promise.resolve('success')).toResolve('success')
```

#### toThrow

```ts
toThrow(expected?: Error | RegExp | string)
```

The `toThrow` matcher is used to test if a function throws an error. You can optionally specify the expected error message, error instance, or a regex pattern.

```ts
testsRunner
  .expect(() => {
    throw new Error('Something went wrong')
  })
  .toThrow()
testsRunner
  .expect(() => {
    throw new Error('Something went wrong')
  })
  .toThrow('Something went wrong')
testsRunner
  .expect(() => {
    throw new Error('Something went wrong')
  })
  .toThrow(/went wrong/)
testsRunner
  .expect(() => {
    throw new Error('Something went wrong')
  })
  .toThrow(new Error('Something went wrong'))
```

### Mock function matchers

The following matchers are used specifically for testing mock functions created with the testing framework.

#### toHaveBeenCalled

```ts
toHaveBeenCalled()
```

The `toHaveBeenCalled` matcher is used to test if a mock function has been called at least once.

```ts
const mockFn = testsRunner.mockFn()
mockFn()
testsRunner.expect(mockFn).toHaveBeenCalled()
```

#### toHaveBeenCalledTimes

```ts
toHaveBeenCalledTimes(expectedCount: number)
```

The `toHaveBeenCalledTimes` matcher is used to test if a mock function has been called a specific number of times.

```ts
const mockFn = testsRunner.mockFn()
mockFn()
mockFn()
testsRunner.expect(mockFn).toHaveBeenCalledTimes(2)
```

#### toHaveBeenCalledTimesWith

```ts
toHaveBeenCalledTimesWith(expectedCount: number, ...args: any[])
```

The `toHaveBeenCalledTimesWith` matcher is used to test if a mock function has been called a specific number of times with specific arguments.

```ts
const mockFn = testsRunner.mockFn()
mockFn('hello')
mockFn('world')
mockFn('hello')
testsRunner.expect(mockFn).toHaveBeenCalledTimesWith(2, 'hello')
```

#### toHaveBeenCalledWith

```ts
toHaveBeenCalledWith(...args: any[])
```

The `toHaveBeenCalledWith` matcher is used to test if a mock function has been called with specific arguments.

```ts
const mockFn = testsRunner.mockFn()
mockFn('hello', 'world')
testsRunner.expect(mockFn).toHaveBeenCalledWith('hello', 'world')
```

#### toHaveBeenLastCalledWith

```ts
toHaveBeenLastCalledWith(...args: any[])
```

The `toHaveBeenLastCalledWith` matcher is used to test if a mock function's last call was made with specific arguments.

```ts
const mockFn = testsRunner.mockFn()
mockFn('first', 'call')
mockFn('last', 'call')
testsRunner.expect(mockFn).toHaveBeenLastCalledWith('last', 'call')
```

#### toHaveBeenNthCalledWith

```ts
toHaveBeenNthCalledWith(n: number, ...args: any[])
```

The `toHaveBeenNthCalledWith` matcher is used to test if a mock function's nth call was made with specific arguments.

```ts
const mockFn = testsRunner.mockFn()
mockFn('first')
mockFn('second')
mockFn('third')
testsRunner.expect(mockFn).toHaveBeenNthCalledWith(2, 'second')
```

### Mock function creation

#### mockFn

```ts
mockFn(): MockFn
```

The `mockFn` method creates a mock function that can be used for testing. Mock functions allow you to track calls, control return values, and implement custom behavior for testing purposes.

```ts
const mockFn = testsRunner.mockFn()
```

##### Basic Usage

By default, a mock function returns `undefined` when called:

```ts
const mockFn = testsRunner.mockFn()
testsRunner.expect(mockFn()).toBeUndefined()
```

##### implement

```ts
implement(fn: Function): void
```

Sets a permanent implementation for the mock function:

```ts
const mockFn = testsRunner.mockFn()
mockFn.implement((a: number, b: number) => a + b)
testsRunner.expect(mockFn(1, 2)).toBe(3)
testsRunner.expect(mockFn(3, 4)).toBe(7)
```

##### implementOnce

```ts
implementOnce(fn: Function): void
```

Sets a one-time implementation for the mock function. After the first call, subsequent calls will use the next `implementOnce` or fall back to the default behavior:

```ts
const mockFn = testsRunner.mockFn()
mockFn.implementOnce(() => 'first call')
mockFn.implementOnce(() => 'second call')
testsRunner.expect(mockFn()).toBe('first call')
testsRunner.expect(mockFn()).toBe('second call')
testsRunner.expect(mockFn()).toBeUndefined()
```

##### scenario

```ts
scenario(args: any[], returnValue: any): void
```

Sets up scenario-based return values. When the mock function is called with arguments that match the scenario, it returns the specified value:

```ts
const mockFn = testsRunner.mockFn()
mockFn.scenario([1, 2], 'one and two')
mockFn.scenario(['hello'], 'greeting')
mockFn.scenario([{ a: 1, b: 2 }], 'object match')

testsRunner.expect(mockFn(1, 2)).toBe('one and two')
testsRunner.expect(mockFn('hello')).toBe('greeting')
testsRunner.expect(mockFn({ a: 1, b: 2 })).toBe('object match')
testsRunner.expect(mockFn('other')).toBeUndefined()
```

##### calls

```ts
calls: Array<{ args: any[] }>
```

An array that tracks all calls made to the mock function, including the arguments passed:

```ts
const mockFn = testsRunner.mockFn()
mockFn('first')
mockFn('second', 123)
mockFn({ complex: 'object' })

testsRunner.expect(mockFn.calls.length).toBe(3)
testsRunner.expect(mockFn.calls[0].args).toEqual(['first'])
testsRunner.expect(mockFn.calls[1].args).toEqual(['second', 123])
testsRunner.expect(mockFn.calls[2].args[0]).toEqual({ complex: 'object' })
```

##### reset

```ts
reset(): void
```

Resets the mock function, clearing all call history, implementations, and scenarios:

```ts
const mockFn = testsRunner.mockFn()
mockFn.implement(() => 'implementation')
mockFn.scenario([1], 'one')
mockFn()

mockFn.reset()

testsRunner.expect(mockFn.calls.length).toBe(0)
testsRunner.expect(mockFn()).toBeUndefined()
testsRunner.expect(mockFn(1)).toBeUndefined() // Scenario is gone
```

Mock functions work seamlessly with all the mock function matchers like `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`, etc.

#### spyOn

```ts
spyOn(object: any, propertyPath: string): SpyFn
```

The `spyOn` method creates a spy for an existing method on an object. Unlike `mockFn`, spies preserve the original behavior of the method while allowing you to track calls and optionally override the implementation.

```ts
const obj = { getValue: () => 'original' }
const spy = testsRunner.spyOn(obj, 'getValue')
```

##### Basic Spying

By default, spying preserves the original method behavior while tracking all calls:

```ts
class Calculator {
  sum(a: number, b: number): number {
    return a + b
  }
}

const calculator = new Calculator()
const spy = testsRunner.spyOn(calculator, 'sum')

const result = calculator.sum(1, 2)
testsRunner.expect(result).toBe(3) // Original behavior preserved
testsRunner.expect(spy.calls).toHaveLength(1)
testsRunner.expect(spy.calls[0].args).toEqual([1, 2])
testsRunner.expect(spy.calls[0].result).toBe(3)
```

##### Call Tracking

Spies automatically track all method calls with their arguments and return values:

```ts
const obj = { multiply: (x: number, y: number) => x * y }
const spy = testsRunner

obj.multiply(3, 4)
obj.multiply(5, 6)

testsRunner.expect(spy.calls).toHaveLength(2)
testsRunner.expect(spy.calls[0].args).toEqual([3, 4])
testsRunner.expect(spy.calls[0].result).toBe(12)
testsRunner.expect(spy.calls[1].args).toEqual([5, 6])
testsRunner.expect(spy.calls[1].result).toBe(30)
```

##### implement

```ts
implement(fn: Function): void
```

Override the original method implementation permanently:

```ts
const obj = { getValue: () => 'original' }
const spy = testsRunner.spyOn(obj, 'getValue')

spy.implement(() => 'mocked')

testsRunner.expect(obj.getValue()).toBe('mocked')
testsRunner.expect(spy.calls[0].result).toBe('mocked')
```

##### implementOnce

```ts
implementOnce(fn: Function): void
```

Override the method implementation for one call only, then fall back to original behavior:

```ts
const obj = { getValue: () => 'original' }
const spy = testsRunner.spyOn(obj, 'getValue')

spy.implementOnce(() => 'once')

testsRunner.expect(obj.getValue()).toBe('once') // First call uses override
testsRunner.expect(obj.getValue()).toBe('original') // Second call uses original
```

##### scenario

```ts
scenario(args: any[], returnValue: any): void
```

Return specific values when called with matching arguments, otherwise use original behavior:

```ts
const obj = { add: (a: number, b: number) => a + b }
const spy = testsRunner.spyOn(obj, 'add')

spy.scenario([1, 2], 100)

testsRunner.expect(obj.add(1, 2)).toBe(100) // Scenario match
testsRunner.expect(obj.add(3, 4)).toBe(7) // Original behavior
```

##### restore

```ts
restore(): void
```

Restore the original method implementation and stop spying:

```ts
const obj = { getValue: () => 'original' }
const spy = testsRunner.spyOn(obj, 'getValue')

spy.implement(() => 'mocked')
testsRunner.expect(obj.getValue()).toBe('mocked')

spy.restore()
testsRunner.expect(obj.getValue()).toBe('original')
```

##### Context Preservation

Spies preserve the `this` context, ensuring methods work correctly with object state:

```ts
class Counter {
  count: number = 0

  increment(): number {
    this.count++
    return this.count
  }
}

const counter = new Counter()
const spy = testsRunner.spyOn(counter, 'increment')

testsRunner.expect(counter.increment()).toBe(1)
testsRunner.expect(counter.count).toBe(1) // State correctly modified
testsRunner.expect(spy.calls[0].result).toBe(1)
```

Even with custom implementations, `this` context is preserved:

```ts
const spy = testsRunner.spyOn(counter, 'increment')
spy.implement(function (this: Counter) {
  this.count += 2 // Custom behavior with correct context
  return this.count
})
```

##### Error Handling

Attempting to spy on non-existent properties throws an error:

```ts
const obj = {}
testsRunner
  .expect(() => {
    testsRunner.spyOn(obj, 'nonExistent')
  })
  .toThrow('Cannot spy on nonExistent: property does not exist')
```

Spies work seamlessly with all mock function matchers like `toHaveBeenCalled`, `toHaveBeenCalledWith`, `toHaveBeenCalledTimes`, etc.

### Asymmetric assertions

Asymmetric assertions are special objects that allow you to perform partial matching within complex data structures. They are particularly useful when testing objects or arrays where you only care about certain properties or values matching specific criteria, rather than exact equality.

Asymmetric assertions work with matchers like `toEqual`, `toMatchObject`, `toHaveBeenCalledWith`, and others, allowing you to specify flexible matching rules for nested values.

#### Basic Usage

Instead of requiring exact matches, you can use asymmetric assertions to test specific conditions:

```ts
// Instead of exact matching
testsRunner.expect({ id: 1, name: 'John', timestamp: 1634567890 }).toEqual({
  id: 1,
  name: 'John',
  timestamp: 1634567890 // Hard to predict exact timestamp
})

// Use asymmetric assertions for flexible matching
testsRunner.expect({ id: 1, name: 'John', timestamp: 1634567890 }).toEqual({
  id: 1,
  name: testsRunner.expectAnything(),
  timestamp: testsRunner.expectGreaterThan(1634567000)
})
```

#### expectAnything

```ts
expectAnything()
```

Matches any value, including `null`, `undefined`, and `NaN`:

```ts
testsRunner.expect({ a: 1, b: 'hello', c: null }).toEqual({
  a: 1,
  b: testsRunner.expectAnything(),
  c: testsRunner.expectAnything()
})

testsRunner.expect([1, 'hello', null]).toEqual([1, testsRunner.expectAnything(), testsRunner.expectAnything()])
```

#### expectGreaterThan

```ts
expectGreaterThan(value: number)
```

Matches numbers greater than the specified value:

```ts
testsRunner.expect({ score: 85, count: 20 }).toEqual({
  score: testsRunner.expectGreaterThan(80),
  count: testsRunner.expectGreaterThan(10)
})
```

#### expectLessThan

```ts
expectLessThan(value: number)
```

Matches numbers less than the specified value:

```ts
testsRunner.expect({ temperature: 15, humidity: 45 }).toEqual({
  temperature: testsRunner.expectLessThan(20),
  humidity: testsRunner.expectLessThan(50)
})
```

#### expectGreaterThanOrEqual

```ts
expectGreaterThanOrEqual(value: number)
```

Matches numbers greater than or equal to the specified value:

```ts
testsRunner.expect({ min: 10, max: 100 }).toEqual({
  min: testsRunner.expectGreaterThanOrEqual(10),
  max: testsRunner.expectGreaterThanOrEqual(50)
})
```

#### expectLessThanOrEqual

```ts
expectLessThanOrEqual(value: number)
```

Matches numbers less than or equal to the specified value:

```ts
testsRunner.expect({ limit: 100, current: 75 }).toEqual({
  limit: testsRunner.expectLessThanOrEqual(100),
  current: testsRunner.expectLessThanOrEqual(100)
})
```

#### expectCloseTo

```ts
expectCloseTo(value: number, precision?: number)
```

Matches floating-point numbers that are close to the expected value within a specified precision:

```ts
testsRunner.expect({ result: 10.001, pi: 3.14159 }).toEqual({
  result: testsRunner.expectCloseTo(10, 2),
  pi: testsRunner.expectCloseTo(3.14, 2)
})
```

#### expectMatch

```ts
expectMatch(pattern: RegExp)
```

Matches strings that match the provided regular expression:

```ts
testsRunner.expect({ email: 'user@example.com', phone: '123-456-7890' }).toEqual({
  email: testsRunner.expectMatch(/@example\.com$/),
  phone: testsRunner.expectMatch(/^\d{3}-\d{3}-\d{4}$/)
})
```

#### expectInstanceOf

```ts
expectInstanceOf(constructor: Function)
```

Matches values that are instances of the specified constructor or class:

```ts
testsRunner.expect({ created: new Date(), error: new Error('test') }).toEqual({
  created: testsRunner.expectInstanceOf(Date),
  error: testsRunner.expectInstanceOf(Error)
})
```

#### expectContain

```ts
expectContain(item: any)
```

Matches strings containing a substring or arrays containing a specific value:

```ts
testsRunner.expect({ message: 'hello world', tags: ['important', 'test'] }).toEqual({
  message: testsRunner.expectContain('world'),
  tags: testsRunner.expectContain('important')
})
```

#### expectContainEqual

```ts
expectContainEqual(item: any)
```

Matches arrays containing an object that deeply equals the expected value:

```ts
testsRunner
  .expect({
    users: [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]
  })
  .toEqual({
    users: testsRunner.expectContainEqual({ id: 1, name: 'John' })
  })
```

#### expectHaveLength

```ts
expectHaveLength(length: number)
```

Matches arrays or strings with the specified length:

```ts
testsRunner.expect({ items: [1, 2, 3], title: 'hello' }).toEqual({
  items: testsRunner.expectHaveLength(3),
  title: testsRunner.expectHaveLength(5)
})
```

#### expectHaveProperty

```ts
expectHaveProperty(path: string, value?: any)
```

Matches objects that have the specified property, optionally with a specific value:

```ts
testsRunner.expect({ user: { name: 'John', age: 30 } }).toEqual({
  user: testsRunner.expectHaveProperty('name')
})

testsRunner.expect({ config: { enabled: true, timeout: 5000 } }).toEqual({
  config: testsRunner.expectHaveProperty('enabled', true)
})
```

#### expectMatchObject

```ts
expectMatchObject(obj: Record<string, any>)
```

Matches objects that contain at least the specified properties and values:

```ts
testsRunner
  .expect({
    user: { id: 1, name: 'John', email: 'john@example.com', role: 'admin' }
  })
  .toEqual({
    user: testsRunner.expectMatchObject({ name: 'John', role: 'admin' })
  })
```

#### expectTruthy

```ts
expectTruthy()
```

Matches any truthy value:

```ts
testsRunner.expect({ active: true, count: 5, name: 'test' }).toEqual({
  active: testsRunner.expectTruthy(),
  count: testsRunner.expectTruthy(),
  name: testsRunner.expectTruthy()
})
```

#### expectFalsy

```ts
expectFalsy()
```

Matches any falsy value (`false`, `0`, `''`, `null`, `undefined`, `NaN`):

```ts
testsRunner.expect({ disabled: false, count: 0, name: '' }).toEqual({
  disabled: testsRunner.expectFalsy(),
  count: testsRunner.expectFalsy(),
  name: testsRunner.expectFalsy()
})
```

#### Negated Asymmetric Assertions

All asymmetric assertions support negation using the `not` property:

```ts
testsRunner.expect({ score: 5, message: 'hello' }).toEqual({
  score: testsRunner.not.expectGreaterThan(10),
  message: testsRunner.not.expectMatch(/world/)
})
```

#### Complex Examples

Asymmetric assertions can be combined for sophisticated testing scenarios:

```ts
const apiResponse = {
  id: 123,
  name: 'Test Object',
  created: new Date(),
  tags: ['important', 'test', 'example'],
  metadata: {
    version: '1.0.5',
    priority: 1,
    settings: {
      enabled: true,
      timeout: 500
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
  created: testsRunner.expectInstanceOf(Date),
  tags: testsRunner.expectContain('important'),
  metadata: testsRunner.expectMatchObject({
    version: testsRunner.expectMatch(/^\d+\.\d+\.\d+$/),
    priority: testsRunner.expectLessThanOrEqual(10),
    settings: testsRunner.expectHaveProperty('enabled', true)
  }),
  items: testsRunner.expectHaveLength(3)
})
```

Asymmetric assertions work seamlessly with mock function matchers:

```ts
const mockFn = tests - runner.mockFn()
mockFn({ timestamp: Date.now(), data: 'test' })

testsRunner.expect(mockFn).toHaveBeenCalledWith({
  timestamp: testsRunner.expectGreaterThan(0),
  data: testsRunner.expectAnything()
})
```

## Events and State

The `TestsRunner` extends `BaseRunner` and emits various events during test execution. You can listen to these events to implement custom reporting, logging, or monitoring.

### Events

#### Inherited from BaseRunner

- **`preparing`** - Emitted when the test runner starts preparing
- **`prepared`** - Emitted when preparation is complete
- **`running`** - Emitted when tests start executing
- **`releasing`** - Emitted when cleanup starts
- **`released`** - Emitted when cleanup is complete
- **`succeeded`** - Emitted when all tests pass
- **`failed`** - Emitted when tests fail
- **`stopped`** - Emitted when execution is stopped
- **`timed-out`** - Emitted when execution times out

#### TestsRunner Specific Events

- **`describe`** - Emitted when a describe block is registered

  ```ts
  testsRunner.on('describe', (event) => {
    console.log(`Describe: ${event.payload.name}`)
    console.log(`Options:`, event.payload.options)
  })
  ```

- **`test`** - Emitted when a test is registered
  ```ts
  testsRunner.on('test', (event) => {
    console.log(`Test: ${event.payload.name}`)
    console.log(`Test object:`, event.payload.test)
  })
  ```

#### Test Lifecycle Events

Each individual test emits lifecycle events:

- **`test:preparing`** - Individual test is preparing
- **`test:prepared`** - Individual test preparation complete
- **`test:running`** - Individual test is executing
- **`test:releasing`** - Individual test cleanup started
- **`test:released`** - Individual test cleanup complete
- **`test:succeeded`** - Individual test passed
- **`test:failed`** - Individual test failed
- **`test:skipped`** - Individual test was skipped
- **`test:error`** - Individual test had an error
- **`test:stopped`** - Individual test was stopped
- **`test:timed-out`** - Individual test timed out

```ts
testsRunner.on('test:succeeded', (event) => {
  console.log(`✅ ${event.payload.test.name} passed`)
})

testsRunner.on('test:failed', (event) => {
  console.log(`❌ ${event.payload.test.name} failed: ${event.payload.reason}`)
})
```

### State

The `TestsRunner` provides a comprehensive state object that includes information about the test structure and execution status:

```ts
const state = testsRunner.state
console.log(state)
```

#### State Structure

```ts
interface TestsRunnerState {
  status: Status // Current runner status
  identifier: string // Runner identifier
  nodes: NodeState // Hierarchical test structure
  tests: TestRunnerState[] // Flat list of all tests
}

interface NodeState {
  status: Status // Node status (idle, running, succeeded, failed, etc.)
  name: string | symbol // Node name
  options: DescribeOptions // Options for this describe block
  tests: TestRunnerState[] // Tests directly in this node
  children: NodeState[] // Child describe blocks
}

interface TestRunnerState {
  status: Status // Test status
  id: string // Unique test ID
  name: string // Test name
  spec: string[] // Full test path (describe hierarchy + test name)
}
```

#### Example Usage

```ts
// Monitor test progress
testsRunner.on('**' as any, (event) => {
  const state = testsRunner.state
  const totalTests = state.tests.length
  const completedTests = state.tests.filter((t) => t.status === 'succeeded' || t.status === 'failed' || t.status === 'skipped').length

  console.log(`Progress: ${completedTests}/${totalTests} tests completed`)
})

// Get final results
await testsRunner.run()
const finalState = testsRunner.state
console.log(`Final status: ${finalState.status}`)
console.log(`Tests run: ${finalState.tests.length}`)

// Analyze test hierarchy
function printNodeStructure(node: NodeState, indent = 0) {
  const spaces = '  '.repeat(indent)
  console.log(`${spaces}${String(node.name)}: ${node.status}`)

  node.tests.forEach((test) => {
    console.log(`${spaces}  - ${test.name}: ${test.status}`)
  })

  node.children.forEach((child) => {
    printNodeStructure(child, indent + 1)
  })
}

printNodeStructure(testsRunner.state.nodes)
```

## Typescript

This library is developed in TypeScript and shipped fully typed.

## Contributing

The development of this library happens in the open on GitHub, and we are grateful to the community for contributing bugfixes and improvements. Read below to learn how you can take part in improving this library.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Contributing Guide](./CONTRIBUTING.md)

### License

[MIT licensed](./LICENSE).
