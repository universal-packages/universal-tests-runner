import { AsymmetricAssertion } from '../AsymmetricAssertion'

export class FalsyAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'Falsy'

  public override assert(value: any): boolean {
    const result = !value
    return this.notToExpect ? !result : result
  }
}
