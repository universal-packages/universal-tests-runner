import { BaseRunner } from '@universal-packages/base-runner'

import { Assertion } from './Assertion'
import { TestRunner } from './TestRunner'
import { DescribeOptions, NodeState, TestOptions, TestStatus, TestingNode, TestsRunnerEventMap, TestsRunnerOptions, TestsRunnerState } from './TestsRunner.types'
import { AnythingAssertion } from './asymmetric-assertions/AnythingAssertion'
import { CloseToAssertion } from './asymmetric-assertions/CloseToAssertion'
import { ContainAssertion } from './asymmetric-assertions/ContainAssertion'
import { ContainEqualAssertion } from './asymmetric-assertions/ContainEqualAssertion'
import { FalsyAssertion } from './asymmetric-assertions/FalsyAssertion'
import { GreaterThanAssertion } from './asymmetric-assertions/GreaterThanAssertion'
import { GreaterThanOrEqualAssertion } from './asymmetric-assertions/GreaterThanOrEqualAssertion'
import { HaveLengthAssertion } from './asymmetric-assertions/HaveLengthAssertion'
import { HavePropertyAssertion } from './asymmetric-assertions/HavePropertyAssertion'
import { InstanceOfAssertion } from './asymmetric-assertions/InstanceOfAssertion'
import { LessThanAssertion } from './asymmetric-assertions/LessThanAssertion'
import { LessThanOrEqualAssertion } from './asymmetric-assertions/LessThanOrEqualAssertion'
import { MatchAssertion } from './asymmetric-assertions/MatchAssertion'
import { MatchObjectAssertion } from './asymmetric-assertions/MatchObjectAssertion'
import { TruthyAssertion } from './asymmetric-assertions/TruthyAssertion'
import { createMockFunction } from './createMockFunction'
import { spyOn } from './spyOn'

export class TestsRunner extends BaseRunner<TestsRunnerEventMap> {
  declare public readonly options: TestsRunnerOptions

  private readonly _testingTree: TestingNode
  private readonly _currentTestingNodeStack: TestingNode[] = []
  private readonly _testRunnersSequence: TestRunner[] = []
  private _testIdCounter = 0

  private _thereWereErrors = false

  public get state(): TestsRunnerState {
    return {
      status: this.status,
      identifier: this.options.identifier!,
      nodes: this._generateNodeState(this._testingTree),
      tests: this._testRunnersSequence.map((test) => test.state)
    }
  }

  public get not() {
    return {
      expectAnything: () => new AnythingAssertion(true),
      expectCloseTo: (value: number, precision?: number) => new CloseToAssertion(value, precision, true),
      expectContain: (item: any) => new ContainAssertion(item, true),
      expectContainEqual: (item: any) => new ContainEqualAssertion(item, true),
      expectFalsy: () => new FalsyAssertion(true),
      expectGreaterThan: (value: number) => new GreaterThanAssertion(value, true),
      expectGreaterThanOrEqual: (value: number) => new GreaterThanOrEqualAssertion(value, true),
      expectHaveLength: (length: number) => new HaveLengthAssertion(length, true),
      expectHaveProperty: (path: string, ...args: any[]) => {
        if (args.length === 0) {
          return new HavePropertyAssertion(path, true)
        }
        return new HavePropertyAssertion(path, true, args[0])
      },
      expectInstanceOf: (constructor: Function) => new InstanceOfAssertion(constructor, true),
      expectLessThan: (value: number) => new LessThanAssertion(value, true),
      expectLessThanOrEqual: (value: number) => new LessThanOrEqualAssertion(value, true),
      expectMatch: (pattern: RegExp) => new MatchAssertion(pattern, true),
      expectMatchObject: (obj: Record<string, any>) => new MatchObjectAssertion(obj, true),
      expectTruthy: () => new TruthyAssertion(true)
    }
  }

  public constructor(options?: TestsRunnerOptions) {
    super({ bail: false, runOrder: 'sequence', testTimeout: 5000, identifier: 'tests-runner', ...options })

    this._testingTree = {
      name: Symbol('root'),
      options: { timeout: this.options.testTimeout },
      testRunners: [],
      children: [],
      status: TestStatus.Idle,
      beforeHooks: [],
      beforeHooksErrors: [],
      beforeHooksHaveRun: false,
      beforeEachHooks: [],
      afterEachHooks: [],
      afterHooks: [],
      afterHooksErrors: [],
      afterHooksHaveRun: false
    }

    this._currentTestingNodeStack.push(this._testingTree)
  }

  public mockFn() {
    return createMockFunction()
  }

  public spyOn(object: any, propertyPath: string) {
    return spyOn(object, propertyPath)
  }

  public expectAnything() {
    return new AnythingAssertion()
  }

  public expectGreaterThan(value: number) {
    return new GreaterThanAssertion(value)
  }

  public expectLessThan(value: number) {
    return new LessThanAssertion(value)
  }

  public expectGreaterThanOrEqual(value: number) {
    return new GreaterThanOrEqualAssertion(value)
  }

  public expectLessThanOrEqual(value: number) {
    return new LessThanOrEqualAssertion(value)
  }

  public expectMatch(pattern: RegExp) {
    return new MatchAssertion(pattern)
  }

  public expectInstanceOf(constructor: Function) {
    return new InstanceOfAssertion(constructor)
  }

  public expectCloseTo(value: number, precision?: number) {
    return new CloseToAssertion(value, precision)
  }

  public expectContain(item: any) {
    return new ContainAssertion(item)
  }

  public expectContainEqual(item: any) {
    return new ContainEqualAssertion(item)
  }

  public expectHaveLength(length: number) {
    return new HaveLengthAssertion(length)
  }

  public expectHaveProperty(path: string, value?: any) {
    if (arguments.length === 1) {
      return new HavePropertyAssertion(path, false)
    }
    return new HavePropertyAssertion(path, false, value)
  }

  public expectMatchObject(obj: Record<string, any>) {
    return new MatchObjectAssertion(obj)
  }

  public expectTruthy() {
    return new TruthyAssertion()
  }

  public expectFalsy() {
    return new FalsyAssertion()
  }

  public describe(name: string | Function, fn: () => void, options?: DescribeOptions) {
    const describeName = typeof name === 'string' ? name : name.name || 'Anonymous Function'

    const describeNode: TestingNode = {
      name: describeName,
      options: options || {},
      testRunners: [],
      children: [],
      parent: this._currentTestingNodeStack[this._currentTestingNodeStack.length - 1],
      status: TestStatus.Idle,
      beforeHooks: [],
      beforeHooksErrors: [],
      beforeHooksHaveRun: false,
      beforeEachHooks: [],
      afterEachHooks: [],
      afterHooks: [],
      afterHooksErrors: [],
      afterHooksHaveRun: false
    }

    this._currentTestingNodeStack[this._currentTestingNodeStack.length - 1].children.push(describeNode)
    this._currentTestingNodeStack.push(describeNode)

    this.emit('describe', { payload: { name: describeName, options: describeNode.options } })

    fn()

    this._currentTestingNodeStack.pop()
  }

  public test(name: string, fn: () => void | Promise<void>, options?: TestOptions) {
    // Merge options from describe blocks (from outer to inner)
    const mergedOptions: TestOptions = { timeout: this.options.testTimeout }
    const describeOptionsStack = this._currentTestingNodeStack.map((node) => node.options)
    const nodePath: TestingNode[] = [...this._currentTestingNodeStack]
    const spec: string[] = [name]

    for (const node of nodePath.slice().reverse()) {
      if (node.name.toString() !== Symbol('root').toString()) spec.unshift(node.name.toString())
    }

    // Apply describe options from outermost to innermost
    for (const describeOpts of describeOptionsStack) {
      if (describeOpts.timeout !== undefined) mergedOptions.timeout = describeOpts.timeout
      if (describeOpts.only !== undefined) mergedOptions.only = describeOpts.only
      if (describeOpts.skip !== undefined) mergedOptions.skip = describeOpts.skip
      if (describeOpts.skipReason !== undefined) mergedOptions.skipReason = describeOpts.skipReason
    }

    // Test options take precedence over all describe options
    if (options) Object.assign(mergedOptions, options)

    const testRunner = new TestRunner({
      id: this._generateTestId(),
      name,
      spec,
      nodePath,
      only: mergedOptions.only || false,
      skip: mergedOptions.skip || false,
      skipReason: mergedOptions.skipReason || '',
      timeout: mergedOptions.timeout,
      testFunction: fn
    })

    testRunner.on('error', () => (this._thereWereErrors = true))
    testRunner.on('failed', () => (this._thereWereErrors = true))
    testRunner.on('**' as any, (event) => {
      this._updateNodeStatus(this._testingTree)
      this.emit(`test:${event.event}` as keyof TestsRunnerEventMap, { error: event.error, payload: { ...event.payload, test: testRunner } })
    })

    this._testRunnersSequence.push(testRunner)
    this._currentTestingNodeStack[this._currentTestingNodeStack.length - 1].testRunners.push(testRunner)

    this.emit('test', { payload: { name: name, test: testRunner } })
  }

  public it(name: string, fn: () => void | Promise<void>, options?: TestOptions) {
    return this.test(name, fn, options)
  }

  public when(name: string | Function, fn: () => void, options?: DescribeOptions) {
    return this.describe(name, fn, options)
  }

  public before(fn: () => void | Promise<void>) {
    this._currentTestingNodeStack[this._currentTestingNodeStack.length - 1].beforeHooks.push(fn)
  }

  public beforeEach(fn: () => void | Promise<void>) {
    this._currentTestingNodeStack[this._currentTestingNodeStack.length - 1].beforeEachHooks.push(fn)
  }

  public after(fn: () => void | Promise<void>) {
    this._currentTestingNodeStack[this._currentTestingNodeStack.length - 1].afterHooks.push(fn)
  }

  public afterEach(fn: () => void | Promise<void>) {
    this._currentTestingNodeStack[this._currentTestingNodeStack.length - 1].afterEachHooks.push(fn)
  }

  public expect(value: any) {
    return new Assertion(value)
  }

  protected override async internalRun(): Promise<Error | void> {
    const potentialTestRunnersToRun = [...this._testRunnersSequence]
    const onlyTestAreActive = potentialTestRunnersToRun.some((test) => test.options.only)

    for (const test of potentialTestRunnersToRun) {
      if (test.options.skip || (onlyTestAreActive && !test.options.only)) {
        const skipReason = onlyTestAreActive && !test.options.only ? '"only" tests are running' : ''
        await test.skip(skipReason)
      }
    }

    const testRunnersToRun = potentialTestRunnersToRun.filter((test) => test.isIdle)

    if (this.options.runOrder === 'random') {
      testRunnersToRun.sort(() => Math.random() - 0.5)
    } else if (this.options.runOrder === 'parallel') {
      await Promise.all(testRunnersToRun.map((test) => this._runTest(test)))

      if (this._thereWereErrors) {
        return new Error('Tests filed')
      } else {
        return
      }
    }

    let bailTriggered = false
    for (let i = 0; i < testRunnersToRun.length; i++) {
      const test = testRunnersToRun[i]

      if (bailTriggered) {
        await test.skip('Bail, skipped after first failure')
      } else {
        await this._runTest(test)

        if (this.options.bail && this._thereWereErrors) {
          bailTriggered = true
        }
      }
    }

    if (this._thereWereErrors) {
      return new Error('Tests failed')
    }
  }

  private async _runTest(testRunner: TestRunner) {
    await this._runBeforeHooksInPath(testRunner.nodePath)

    await testRunner.run()

    await this._runAfterHooksInPath(testRunner.nodePath)

    testRunner.removeAllListeners()
  }

  private async _runBeforeHooksInPath(nodePath: TestingNode[]) {
    for (const node of nodePath) {
      if (!node.beforeHooksHaveRun) {
        node.beforeHooksHaveRun = true

        for (const hook of node.beforeHooks) {
          try {
            await hook()
          } catch (error: unknown) {
            this._thereWereErrors = true
            node.beforeHooksErrors.push(error as Error)
          }
        }
      }
    }
  }

  private async _runAfterHooksInPath(nodePath: TestingNode[]) {
    for (const node of nodePath.slice().reverse()) {
      const allTestsAreFinished = node.testRunners.every((test) => test.isFinished)
      const allNodesAreFinished = node.children.every((child) => child.status === TestStatus.Succeeded || child.status === TestStatus.Failed || child.status === TestStatus.Skipped)

      if (!node.afterHooksHaveRun && allTestsAreFinished && allNodesAreFinished) {
        node.afterHooksHaveRun = true

        for (const hook of node.afterHooks) {
          try {
            await hook()
          } catch (error: unknown) {
            this._thereWereErrors = true
            node.afterHooksErrors.push(error as Error)
          }
        }
      }
    }
  }

  private _generateTestId(): string {
    return `${this.options.identifier}-${++this._testIdCounter}`
  }

  private _generateNodeState(node: TestingNode): NodeState {
    return {
      name: node.name,
      options: node.options,
      tests: node.testRunners.map((test) => test.state),
      children: node.children.map((child) => this._generateNodeState(child)),
      status: node.status,
      beforeHooksErrors: node.beforeHooksErrors,
      afterHooksErrors: node.afterHooksErrors
    }
  }

  private _updateNodeStatus(node: TestingNode): void {
    for (const child of node.children) this._updateNodeStatus(child)

    if (node.status === TestStatus.Succeeded || node.status === TestStatus.Failed || node.status === TestStatus.Skipped) return

    const children = node.children.filter((child) => child.status !== TestStatus.Skipped)
    const testRunners = node.testRunners.filter((test) => test.status !== TestStatus.Skipped)

    if (children.length === 0 && testRunners.length === 0) {
      node.status = TestStatus.Skipped
      return
    }

    const someTestRunnersAreActive = testRunners.some((test) => test.isActive)
    const someNodesAreRunning = children.some((child) => child.status === TestStatus.Running)

    if (someTestRunnersAreActive || someNodesAreRunning) {
      node.status = TestStatus.Running
      return
    }

    const someTestRunnersAreFailedOrErrored = testRunners.some((test) => test.isFailed || test.isError || test.isTimedOut)
    const someChildrenAreFailed = children.some((child) => child.status === TestStatus.Failed)

    if (someTestRunnersAreFailedOrErrored || someChildrenAreFailed) {
      node.status = TestStatus.Failed
      return
    }

    const allTestRunnersAreSucceeded = testRunners.every((test) => test.isSucceeded)
    const allChildrenAreSucceeded = children.every((child) => child.status === TestStatus.Succeeded)

    if (allTestRunnersAreSucceeded && allChildrenAreSucceeded) {
      node.status = TestStatus.Succeeded
      return
    }
  }
}
