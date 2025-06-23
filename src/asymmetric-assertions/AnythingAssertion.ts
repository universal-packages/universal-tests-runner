import { AsymmetricAssertion } from '../AsymmetricAssertion'

export class AnythingAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'Anything'

  public override assert(_value: any) {
    return this.notToExpect ? false : true
  }
}
