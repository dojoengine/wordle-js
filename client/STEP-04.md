# STEP 04

## Create game

When a user connects his wallet, we want to automatically start a wordle game.

To do so, just as user is connected we need to check if a game exists on `<App />` component mount.
Logic is simple, on component mount, if we have a user address, check if we have a game for that address. We'll re-render component each time address changes.

- Add useEffect in App.tsx
    - sdk.subscribeEntityQuery (use `.includeHashedKeys()` so that we can properly subscribe to entity updates);
    - onEntityUpdate: apply entity to state using `state.setEntities(data)` it will broadcast update to store so that we can `state.confirmTransaction()`
- Create `hooks/useSystemCalls.ts`
    - add `start` function with all optimistic update logic. This really speeds up UI.


Because we properly set up the `DojoSdkProvider` in `main.tsx` we can use `useDojoSDK()` everywhere in app. It gives us easy access to :
- sdk
- useDojoStore (zustand store underneath)
- client (which are client functions aka. actions defined in your system)