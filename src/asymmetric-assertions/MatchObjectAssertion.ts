import { AsymmetricAssertion } from '../AsymmetricAssertion'
import { diff } from '../diff'
import { DiffResult } from '../diff.types'

export class MatchObjectAssertion extends AsymmetricAssertion {
  protected override readonly assertionName: string = 'MatchObject'
  private readonly expected: Record<string, any>

  constructor(expected: Record<string, any>, notToExpect = false) {
    super(notToExpect)
    this.expected = expected
  }

  public override assert(value: any): boolean {
    if (typeof value !== 'object' || value === null) {
      return this.notToExpect ? true : false
    }

    const difference = diff(this.expected, value)
    const matches = difference.same || this.isOnlyAdded(difference)

    return this.notToExpect ? !matches : matches
  }

  // Returns true if all differences are only 'added' (i.e., actual has extra keys, but all expected keys match)
  private isOnlyAdded(diff: DiffResult): boolean {
    if (diff.type === 'object') {
      return Object.values(diff.keys).every((child) => {
        if (child.type === 'added') return true
        if (child.type === 'object' || child.type === 'array') return this.isOnlyAdded(child)
        return child.same
      })
    }
    if (diff.type === 'array') {
      return diff.items.every((child) => {
        if (child.type === 'added') return true
        if (child.type === 'object' || child.type === 'array') return this.isOnlyAdded(child)
        return child.same
      })
    }
    // For primitives, only 'added' or 'same' are allowed
    return diff.type === 'added' || diff.same
  }
}
