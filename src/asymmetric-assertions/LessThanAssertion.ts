import { AsymmetricAssertion } from '../AsymmetricAssertion'

export class LessThanAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'LessThan'
  private readonly expected: number

  constructor(expected: number, notToExpect = false) {
    super(notToExpect)
    this.expected = expected
  }

  public override assert(value: any): boolean {
    if (typeof value !== 'number') {
      return this.notToExpect ? true : false
    }

    const result = value < this.expected
    return this.notToExpect ? !result : result
  }
}
