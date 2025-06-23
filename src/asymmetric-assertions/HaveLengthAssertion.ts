import { AsymmetricAssertion } from '../AsymmetricAssertion'

export class HaveLengthAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'HaveLength'
  private readonly expected: number

  constructor(expected: number, notToExpect = false) {
    super(notToExpect)
    this.expected = expected
  }

  public override assert(value: any): boolean {
    if (!value || typeof value.length !== 'number') {
      return this.notToExpect ? true : false
    }

    const result = value.length === this.expected
    return this.notToExpect ? !result : result
  }
}
