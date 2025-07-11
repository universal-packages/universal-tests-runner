import { BaseRunnerEventMap, BaseRunnerOptions, Status as TestStatus } from '@universal-packages/base-runner'

import { TestRunner } from './TestRunner'
import { TestRunnerState } from './TestRunner.types'

export type RunOrder = 'sequence' | 'random' | 'parallel'
export { Status as TestStatus } from '@universal-packages/base-runner'
export interface TestsRunnerOptions extends BaseRunnerOptions {
  bail?: boolean
  runOrder?: RunOrder
  testTimeout?: number
  identifier?: string
}

export interface DescribeOptions {
  only?: boolean
  skip?: boolean
  skipReason?: string
  timeout?: number
}

export interface TestOptions {
  only?: boolean
  skip?: boolean
  skipReason?: string
  timeout?: number
}

export interface TestingNode {
  name: string | symbol
  options: DescribeOptions
  testRunners: TestRunner[]
  children: TestingNode[]
  parent?: TestingNode
  status: TestStatus
  beforeHooks: (() => void | Promise<void>)[]
  beforeHooksErrors: Error[]
  beforeHooksHaveRun: boolean
  beforeEachHooks: (() => void | Promise<void>)[]

  afterEachHooks: (() => void | Promise<void>)[]
  afterHooks: (() => void | Promise<void>)[]
  afterHooksErrors: Error[]
  afterHooksHaveRun: boolean
}

export interface NodeState {
  status: TestStatus
  name: string | symbol
  options: DescribeOptions
  tests: TestRunnerState[]
  beforeHooksErrors: Error[]
  afterHooksErrors: Error[]
  children: NodeState[]
}

export interface TestsRunnerState {
  status: TestStatus
  identifier: string
  nodes: NodeState
  tests: TestRunnerState[]
}

export interface TestsRunnerEventMap extends BaseRunnerEventMap {
  describe: { name: string; options: DescribeOptions }
  test: { name: string; test: TestRunner }
  'test:preparing': { startedAt: Date; test: TestRunner }
  'test:prepared': { startedAt: Date; finishedAt: Date; test: TestRunner }
  'test:running': { startedAt: Date; test: TestRunner }
  'test:succeeded': { startedAt: Date; finishedAt: Date; test: TestRunner }
  'test:failed': { reason: string | Error; startedAt: Date; finishedAt: Date; test: TestRunner }
  'test:skipped': { reason?: string; skippedAt: Date; test: TestRunner }
  'test:error': { reason: string | Error; startedAt: Date; finishedAt: Date; test: TestRunner }
  'test:stopped': { reason?: string; startedAt: Date; stoppedAt: Date; test: TestRunner }
  'test:timed-out': { startedAt: Date; timedOutAt: Date; test: TestRunner }
}
