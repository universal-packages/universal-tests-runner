import { AsymmetricAssertion } from '../AsymmetricAssertion'
import { diff } from '../diff'

export class ContainEqualAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'ContainEqual'
  private readonly expected: any

  constructor(expected: any, notToExpect = false) {
    super(notToExpect)
    this.expected = expected
  }

  public override assert(value: any): boolean {
    if (!Array.isArray(value)) {
      return false
    }

    const result = value.some((v: any) => diff(v, this.expected).same)
    return this.notToExpect ? !result : result
  }
}
