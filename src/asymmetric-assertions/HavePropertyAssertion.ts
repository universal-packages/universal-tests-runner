import { AsymmetricAssertion } from '../AsymmetricAssertion'
import { diff } from '../diff'

export class HavePropertyAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'HaveProperty'
  private readonly propertyPath: string
  private readonly propertyValue?: any
  private readonly checkValue: boolean

  constructor(propertyPath: string, notToExpect: boolean = false, propertyValue?: any) {
    super(notToExpect)
    this.propertyPath = propertyPath
    this.propertyValue = propertyValue
    this.checkValue = arguments.length > 2
  }

  public override assert(value: any): boolean {
    if (value === null || value === undefined || typeof value !== 'object') {
      return this.notToExpect ? true : false
    }

    const pathParts = this.propertyPath.split('.')
    let current = value
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

    if (!propertyExists) {
      return this.notToExpect ? true : false
    }

    if (this.checkValue) {
      const valueMatches = diff(this.propertyValue, current).same
      return this.notToExpect ? !valueMatches : valueMatches
    }

    return this.notToExpect ? false : true
  }
}
