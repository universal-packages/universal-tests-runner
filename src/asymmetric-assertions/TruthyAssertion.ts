import { AsymmetricAssertion } from '../AsymmetricAssertion'

export class TruthyAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'Truthy'

  public override assert(value: any): boolean {
    const result = !!value
    return this.notToExpect ? !result : result
  }
}
