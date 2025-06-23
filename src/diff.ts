import { AsymmetricAssertion } from './AsymmetricAssertion'
import { DiffResult } from './diff.types'

/**
 * Compares two values of any type and returns a structured representation of their differences
 * @param expected The expected value
 * @param actual The actual value
 * @returns A structured representation of the differences
 */
export function diff(expected: any, actual: any): DiffResult {
  // Maintain references to detect circular structures
  const expectedRefs = new Map<any, string>()
  const actualRefs = new Map<any, string>()

  return diffInternal(expected, actual, expectedRefs, actualRefs, '')
}

function diffInternal(expected: any, actual: any, expectedRefs: Map<any, string>, actualRefs: Map<any, string>, path: string): DiffResult {
  if (AsymmetricAssertion.isAsymmetricAssertion(expected)) {
    if (expected.assert(actual)) {
      return { type: 'same', value: actual, same: true }
    } else {
      return { type: 'different', expected, actual, same: false }
    }
  }

  // Check for same value (strict equality for primitives)
  if (expected === actual) {
    return { type: 'same', value: expected, same: true }
  }

  // NaN is a special case
  if (Number.isNaN(expected) && Number.isNaN(actual)) {
    return { type: 'same', value: expected, same: true }
  }

  // Check for null or undefined separately - at the root level we use 'different'
  if (expected === null || expected === undefined || actual === null || actual === undefined) {
    // For direct value comparisons, we use 'different' even if one is undefined
    return { type: 'different', expected, actual, same: false }
  }

  // Check for different types
  if (typeof expected !== typeof actual) {
    return { type: 'different', expected, actual, same: false }
  }

  // Handle objects (including arrays)
  if (typeof expected === 'object') {
    // Check for array vs non-array mismatch
    if (Array.isArray(expected) !== Array.isArray(actual)) {
      return { type: 'different', expected, actual, same: false }
    }

    // Handle arrays
    if (Array.isArray(expected)) {
      return diffArrays(expected, actual, expectedRefs, actualRefs, path)
    }

    // Handle regular objects
    return diffObjects(expected, actual, expectedRefs, actualRefs, path)
  }

  // For all other types (primitives that didn't match)
  return { type: 'different', expected, actual, same: false }
}

function diffArrays(expected: any[], actual: any[], expectedRefs: Map<any, string>, actualRefs: Map<any, string>, path: string): DiffResult {
  // Check for circular references
  if (expectedRefs.has(expected) || actualRefs.has(actual)) {
    const expectedPath = expectedRefs.get(expected)
    const actualPath = actualRefs.get(actual)
    return {
      type: 'circular',
      path: expectedPath || actualPath || path,
      same: expectedPath === actualPath
    }
  }

  // Add to reference maps
  expectedRefs.set(expected, path)
  actualRefs.set(actual, path)

  const maxLength = Math.max(expected.length, actual.length)
  const items: DiffResult[] = []
  let allSame = expected.length === actual.length // Start with true only if lengths match

  for (let i = 0; i < maxLength; i++) {
    const itemPath = `${path}[${i}]`

    if (i >= expected.length) {
      // Extra item in actual (added)
      items.push({ type: 'added', value: actual[i], same: false })
      allSame = false
    } else if (i >= actual.length) {
      // Missing item in actual (removed)
      items.push({ type: 'removed', value: expected[i], same: false })
      allSame = false
    } else {
      // Compare both items
      const itemResult = diffInternal(expected[i], actual[i], expectedRefs, actualRefs, itemPath)
      items.push(itemResult)
      if (!itemResult.same) {
        allSame = false
      }
    }
  }

  // Remove from reference maps before returning
  expectedRefs.delete(expected)
  actualRefs.delete(actual)

  return { type: 'array', items, same: allSame }
}

function diffObjects(expected: Record<string, any>, actual: Record<string, any>, expectedRefs: Map<any, string>, actualRefs: Map<any, string>, path: string): DiffResult {
  // Check for circular references
  if (expectedRefs.has(expected) || actualRefs.has(actual)) {
    const expectedPath = expectedRefs.get(expected)
    const actualPath = actualRefs.get(actual)
    return {
      type: 'circular',
      path: expectedPath || actualPath || path,
      same: expectedPath === actualPath
    }
  }

  // Add to reference maps
  expectedRefs.set(expected, path)
  actualRefs.set(actual, path)

  const allKeys = new Set<string>([...Object.keys(expected), ...Object.keys(actual)])
  const keys: Record<string, DiffResult> = {}
  let allSame = true // Start with true and set to false if any differences found

  for (const key of allKeys) {
    const keyPath = path ? `${path}.${key}` : key

    if (!(key in expected)) {
      // Extra key in actual (added)
      keys[key] = { type: 'added', value: actual[key], same: false }
      allSame = false
    } else if (!(key in actual)) {
      // Missing key in actual (removed)
      keys[key] = { type: 'removed', value: expected[key], same: false }
      allSame = false
    } else {
      // Compare both values
      const keyResult = diffInternal(expected[key], actual[key], expectedRefs, actualRefs, keyPath)
      keys[key] = keyResult
      if (!keyResult.same) {
        allSame = false
      }
    }
  }

  // Remove from reference maps before returning
  expectedRefs.delete(expected)
  actualRefs.delete(actual)

  return { type: 'object', keys, same: allSame }
}
