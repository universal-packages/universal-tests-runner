import { AsymmetricAssertion } from '../AsymmetricAssertion'

export class MatchAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'Match'
  private readonly expected: RegExp

  constructor(expected: RegExp, notToExpect = false) {
    super(notToExpect)
    this.expected = expected
  }

  public override assert(value: any): boolean {
    if (typeof value !== 'string') {
      return this.notToExpect ? true : false
    }

    const result = this.expected.test(value)
    return this.notToExpect ? !result : result
  }
}
