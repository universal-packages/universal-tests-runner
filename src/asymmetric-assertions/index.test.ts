import { anythingAssertionTest } from './AnythingAssertion.test'
import { closeToAssertionTest } from './CloseToAssertion.test'
import { containAssertionTest } from './ContainAssertion.test'
import { containEqualAssertionTest } from './ContainEqualAssertion.test'
import { falsyAssertionTest } from './FalsyAssertion.test'
import { greaterThanAssertionTest } from './GreaterThanAssertion.test'
import { greaterThanOrEqualAssertionTest } from './GreaterThanOrEqualAssertion.test'
import { haveLengthAssertionTest } from './HaveLengthAssertion.test'
import { havePropertyAssertionTest } from './HavePropertyAssertion.test'
import { instanceOfAssertionTest } from './InstanceOfAssertion.test'
import { lessThanAssertionTest } from './LessThanAssertion.test'
import { lessThanOrEqualAssertionTest } from './LessThanOrEqualAssertion.test'
import { matchAssertionTest } from './MatchAssertion.test'
import { matchObjectAssertionTest } from './MatchObjectAssertion.test'
import { truthyAssertionTest } from './TruthyAssertion.test'

export async function asymmetricAssertionsTest() {
  await anythingAssertionTest()
  await closeToAssertionTest()
  await containAssertionTest()
  await containEqualAssertionTest()
  await falsyAssertionTest()
  await greaterThanAssertionTest()
  await greaterThanOrEqualAssertionTest()
  await haveLengthAssertionTest()
  await havePropertyAssertionTest()
  await instanceOfAssertionTest()
  await lessThanAssertionTest()
  await lessThanOrEqualAssertionTest()
  await matchAssertionTest()
  await matchObjectAssertionTest()
  await truthyAssertionTest()
}
