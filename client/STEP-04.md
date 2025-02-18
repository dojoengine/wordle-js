# STEP 04

## Create game

When a user connects his wallet, we want to automatically start a wordle game.

To do so, just as user is connected we need to check if a game exists on `<App />` component mount.
Logic is simple, on component mount, if we have a user address, check if we have a game for that address. We'll re-render component each time address changes.