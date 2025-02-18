# STEP 03

## Clean up client

Before going further, we will clean out client so that we don't have unecessary files. Be sure that you also remove references in files that you kept.

## Start hacking

We want to build a frontend for our onchain wordle. We'll start simple, then bind onchain data and last add some styling. Those steps will be splitted into different commits. The thing that matters here is how you can use dojo to ease your development process.

## Binding dojo to app

First we'll need to use wallets so that we can sign txs. In dev mode, we'll use katana `@dojoengine/predeployed-connector`, in release mode, we'll use `@cartridge/controller`

```bash
pnpm add @starknet-react/core @starknet-react/chains @dojoengine/predeployed-connector @cartridge/controller
```

Create `starknet-provider.tsx`.
Update `main.tsx` to wrap your app with `<StarknetProvider>`.
In `App.tsx` update component to first connect user to wallet and then display app. Wallet is required to use wordle contracts.
We moved logic to `src/components/wallet.tsx` to encapsulate wallet connection logic.
Run `pnpm add clsx tailwind-merge` to have required lib dependencies.