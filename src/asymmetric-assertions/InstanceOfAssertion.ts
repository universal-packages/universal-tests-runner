import { AsymmetricAssertion } from '../AsymmetricAssertion'

export class InstanceOfAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'InstanceOf'
  private readonly expected: Function

  constructor(expected: Function, notToExpect = false) {
    super(notToExpect)
    this.expected = expected
  }

  public override assert(value: any): boolean {
    const result = value instanceof this.expected
    return this.notToExpect ? !result : result
  }
}
