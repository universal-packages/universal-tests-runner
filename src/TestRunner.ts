import { BaseRunner } from '@universal-packages/base-runner'

import { TestError } from './TestError'
import { TestRunnerOptions, TestRunnerState } from './TestRunner.types'

export class TestRunner extends BaseRunner {
  declare public readonly options: TestRunnerOptions

  private readonly _testFunction: () => void | Promise<void>
  private readonly _beforeEachHooksErrors: Error[] = []
  private readonly _afterEachHooksErrors: Error[] = []

  public get id() {
    return this.options.id
  }

  public get name() {
    return this.options.name
  }

  public get spec() {
    return this.options.spec
  }

  public get nodePath() {
    return this.options.nodePath
  }

  public get beforeEachHooksErrors() {
    return this._beforeEachHooksErrors
  }

  public get afterEachHooksErrors() {
    return this._afterEachHooksErrors
  }

  public get state(): TestRunnerState {
    return {
      id: this.id,
      name: this.name,
      spec: this.spec,
      options: {
        only: this.options.only,
        skip: this.options.skip,
        skipReason: this.options.skipReason,
        timeout: this.options.timeout
      },
      status: this.status,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      measurement: this.measurement,
      beforeEachHooksErrors: this.beforeEachHooksErrors,
      afterEachHooksErrors: this.afterEachHooksErrors,
      skipReason: this.skipReason || this.options.skipReason,
      failureReason: this.failureReason,
      error: this.error
    }
  }

  public constructor(options: TestRunnerOptions) {
    super({ ...options })

    this._testFunction = this.options.testFunction
  }

  protected override async internalPrepare(): Promise<void> {
    await this._runBeforeEachHooksInPath()
  }

  protected override async internalRun(): Promise<TestError | void> {
    try {
      await this._testFunction()
    } catch (error) {
      return error as TestError
    }
  }

  protected override async internalRelease(): Promise<void> {
    await this._runAfterEachHooksInPath()
  }

  private async _runBeforeEachHooksInPath() {
    for (const node of this.nodePath) {
      for (const hook of node.beforeEachHooks) {
        try {
          await hook()
        } catch (error: unknown) {
          this._beforeEachHooksErrors.push(error as Error)
        }
      }
    }

    if (this._beforeEachHooksErrors.length > 0) {
      throw new Error('beforeEach hooks failed')
    }
  }

  private async _runAfterEachHooksInPath() {
    for (const node of this.nodePath.slice().reverse()) {
      for (const hook of node.afterEachHooks) {
        try {
          await hook()
        } catch (error: unknown) {
          this._afterEachHooksErrors.push(error as Error)
        }
      }
    }

    if (this._afterEachHooksErrors.length > 0) {
      throw new Error('afterEach hooks failed')
    }
  }
}
