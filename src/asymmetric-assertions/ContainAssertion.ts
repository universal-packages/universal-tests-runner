import { AsymmetricAssertion } from '../AsymmetricAssertion'

export class ContainAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'Contain'
  private readonly expected: any

  constructor(expected: any, notToExpect = false) {
    super(notToExpect)
    this.expected = expected
  }

  public override assert(value: any): boolean {
    const isString = typeof value === 'string'
    const isArray = Array.isArray(value)

    if (!isString && !isArray) {
      return false
    }

    const result = isString ? value.includes(this.expected) : value.some((v: any) => v === this.expected)

    return this.notToExpect ? !result : result
  }
}
