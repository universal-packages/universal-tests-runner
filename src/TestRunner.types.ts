import { BaseRunnerOptions } from '@universal-packages/base-runner'
import { Measurement } from '@universal-packages/time-measurer'

import { TestError } from './TestError'
import { TestOptions, TestStatus, TestingNode } from './TestsRunner.types'

export interface TestRunnerOptions extends BaseRunnerOptions {
  id: string
  name: string
  spec: string[]
  nodePath: TestingNode[]
  only: boolean
  skip: boolean
  skipReason: string
  testFunction: () => void | Promise<void>
}

export interface TestRunnerState {
  id: string
  name: string
  spec: string[]
  options: TestOptions
  status: TestStatus
  startedAt: Date | null
  finishedAt: Date | null
  measurement: Measurement | null
  beforeEachHooksErrors: Error[]
  afterEachHooksErrors: Error[]
  skipReason: string | null
  failureReason: string | Error | TestError | null
  error: Error | null
}
