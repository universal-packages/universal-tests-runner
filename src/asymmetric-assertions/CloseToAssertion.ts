import { AsymmetricAssertion } from '../AsymmetricAssertion'

export class CloseToAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'CloseTo'
  private readonly expected: number
  private readonly precision: number

  constructor(expected: number, precision: number = 2, notToExpect = false) {
    super(notToExpect)
    this.expected = expected
    this.precision = precision
  }

  public override assert(value: any): boolean {
    if (typeof value !== 'number') {
      return this.notToExpect ? true : false
    }

    const pow = Math.pow(10, this.precision)
    const delta = Math.abs(value - this.expected)
    const maxDelta = 1 / pow

    const result = delta < maxDelta
    return this.notToExpect ? !result : result
  }
}
