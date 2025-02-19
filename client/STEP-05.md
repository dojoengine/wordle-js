# STEP 05

## Attempts
Now that we can create game we a user connects his wallet, we can start playing around.

When we access UI, we will fetch user attempts to display previous tries.

When a user submits an attempt, we will apply logic to display hints and adds to attempts list.

- start by creating action in `useSystemCalls.ts`
- bind action in `components/wordle.tsx` on form submit

## Display attempts in UI

- add `lib/parseModels.ts`
    - parse models to decode felt252 to utf8
    - unpack hint to display hints to user
- replace logic in `wordle.tsx` to use chain data instead of state naive implementation

