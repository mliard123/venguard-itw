# Scoring Rubric

Score the submission out of 20.

## 1. Architecture and Scope Control — 4 points

4 points:
The solution stays flat, keeps helpers separate from specs, avoids unnecessary abstractions, and solves exactly the requested flows.

2 points:
The solution works but includes some avoidable structure or duplicates small pieces of logic.

0 points:
The solution is difficult to review because of poor structure, significant duplication, or major deviation from the exercise shape.

## 2. Async and Reliability — 4 points

4 points:
Network-triggering UI actions are paired correctly, there are no arbitrary sleeps, and the suite looks stable.

2 points:
Minor race-risk patterns exist, but the approach is mostly sound.

0 points:
The suite relies on brittle timing or obvious race conditions.

## 3. Locator Quality — 3 points

3 points:
Locators are semantic and intentional.

1 point:
Locators are mixed quality but still understandable.

0 points:
Locators are mostly brittle, CSS-heavy, or hard to maintain.

## 4. API Helper Quality — 3 points

3 points:
Issue creation, fetching, updating, comment retrieval, and cleanup are implemented cleanly in helpers.

1 point:
Helpers exist but are inconsistent or partially duplicated in tests.

0 points:
Most API logic is inline in the spec files or poorly separated.

## 5. Assertions and Test Value — 4 points

4 points:
Assertions prove persisted state through GitHub APIs and clearly validate the requested flows.

2 points:
Assertions are partially correct but lean too much on UI-only checks.

0 points:
Assertions are weak or do not prove the flow actually worked.

## 6. Debuggability and Communication — 2 points

2 points:
The submission is easy to review, includes clear naming, and the notes on assumptions and tradeoffs are useful.

1 point:
The code is understandable but missing some explanation.

0 points:
The submission is hard to reason about and lacks useful explanation.

## Interpreting the Score

18 to 20:
Strong signal. Candidate understands practical UI automation and verification strategy.

14 to 17:
Good signal. Candidate is capable, with some rough edges.

10 to 13:
Mixed signal. Candidate may need closer guidance.

Below 10:
Weak signal for this style of automation work.

## Immediate Red Flags

Any of the following should materially reduce confidence even if parts of the suite work:

1. Arbitrary `waitForTimeout()` usage.
2. No API assertions.
3. No cleanup strategy.
4. Heavy Page Object Model or framework overhead for a tiny exercise.
5. Inability to complete the basic create, edit, close, and comment flows.
6. Inability to self-provision a minimal GitHub repo and scoped token despite clear instructions.