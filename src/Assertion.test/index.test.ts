import { toBeTest } from './toBe.test'
import { toBeCloseToTest } from './toBeCloseTo.test'
import { toBeDefinedTest } from './toBeDefined.test'
import { toBeFalsyTest } from './toBeFalsy.test'
import { toBeGreaterThanTest } from './toBeGreaterThan.test'
import { toBeGreaterThanOrEqualTest } from './toBeGreaterThanOrEqual.test'
import { toBeInstanceOfTest } from './toBeInstanceOf.test'
import { toBeLessThanTest } from './toBeLessThan.test'
import { toBeLessThanOrEqualTest } from './toBeLessThanOrEqual.test'
import { toBeNaNTest } from './toBeNaN.test'
import { toBeNullTest } from './toBeNull.test'
import { toBeTruthyTest } from './toBeTruthy.test'
import { toBeUndefinedTest } from './toBeUndefined.test'
import { toContainTest } from './toContain.test'
import { toContainEqualTest } from './toContainEqual.test'
import { toEqualTest } from './toEqual.test'
import { toHaveBeenCalledTest } from './toHaveBeenCalled.test'
import { toHaveBeenCalledTimesTest } from './toHaveBeenCalledTimes.test'
import { toHaveBeenCalledTimesWithTest } from './toHaveBeenCalledTimesWith.test'
import { toHaveBeenCalledWithTest } from './toHaveBeenCalledWith.test'
import { toHaveBeenLastCalledWithTest } from './toHaveBeenLastCalledWith.test'
import { toHaveBeenNthCalledWithTest } from './toHaveBeenNthCalledWith.test'
import { toHaveLengthTest } from './toHaveLength.test'
import { toHavePropertyTest } from './toHaveProperty.test'
import { toMatchTest } from './toMatch.test'
import { toMatchObjectTest } from './toMatchObject.test'
import { toRejectTest } from './toReject.test'
import { toResolveTest } from './toResolve.test'
import { toThrowTest } from './toThrow.test'

export async function assertionTest() {
  await toBeTest()
  await toEqualTest()
  await toBeNullTest()
  await toBeUndefinedTest()
  await toBeDefinedTest()
  await toBeTruthyTest()
  await toBeFalsyTest()
  await toContainTest()
  await toContainEqualTest()
  await toHaveLengthTest()
  await toHavePropertyTest()
  await toBeGreaterThanTest()
  await toBeGreaterThanOrEqualTest()
  await toBeLessThanTest()
  await toBeLessThanOrEqualTest()
  await toBeNaNTest()
  await toMatchTest()
  await toMatchObjectTest()
  await toThrowTest()
  await toBeInstanceOfTest()
  await toBeCloseToTest()
  await toResolveTest()
  await toRejectTest()
  await toHaveBeenCalledTest()
  await toHaveBeenCalledWithTest()
  await toHaveBeenCalledTimesTest()
  await toHaveBeenCalledTimesWithTest()
  await toHaveBeenLastCalledWithTest()
  await toHaveBeenNthCalledWithTest()
}
