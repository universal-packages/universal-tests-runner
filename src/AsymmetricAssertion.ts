export class AsymmetricAssertion {
  protected static readonly iAmAnAsymmetricAssertion: boolean = true
  protected readonly notToExpect: boolean = false

  protected readonly assertionName: string = 'AsymmetricAssertion'

  public get name() {
    return this.assertionName
  }

  public constructor(notToExpect: boolean = false) {
    this.notToExpect = notToExpect
  }

  public assert(_value: any): boolean {
    throw new Error('Not implemented')
  }

  public static isAsymmetricAssertion(value: any): value is AsymmetricAssertion {
    return value?.constructor?.iAmAnAsymmetricAssertion === true
  }
}
