export type DiffResult = SameDiffResult | DifferentDiffResult | AddedDiffResult | RemovedDiffResult | ObjectDiffResult | ArrayDiffResult | CircularRefDiffResult

export interface SameDiffResult {
  type: 'same'
  value: any
  same: true
}

export interface DifferentDiffResult {
  type: 'different'
  expected: any
  actual: any
  same: false
}

export interface AddedDiffResult {
  type: 'added'
  value: any
  same: false
}

export interface RemovedDiffResult {
  type: 'removed'
  value: any
  same: false
}

export interface ObjectDiffResult {
  type: 'object'
  keys: Record<string, DiffResult>
  same: boolean
}

export interface ArrayDiffResult {
  type: 'array'
  items: DiffResult[]
  same: boolean
}

export interface CircularRefDiffResult {
  type: 'circular'
  path: string
  same: boolean
}
