# STEP 02

## Scaffold dojo : 

Create `dojoConfig.ts` you can place it whereever you want. In this example, we'll assume it's placed in root directory and contracts are in parent directory.
```ts
import { createDojoConfig } from "@dojoengine/core";

import manifest from "../manifest_dev.json";

export const dojoConfig = createDojoConfig({
    manifest,
});
```

Generate bindings, you must first `sozo migrate` to be sure manifest is up to date : 
```bash
cd ..
sozo migrate
sozo build --typescript --bindings-output ./client/src
```

Check that generated content is ok. Here we can see in `src/typescript/models.gen.ts` that `starknet` dependency is missing so we'll add it to package.json
```bash
pnpm add starknet
```

## Init sdk : 

Update `src/main.tsx` to add `DojoSdkProvider` and `init` sdk function. It will bind sdk to react context, so you can easily access data throughout your app.

```ts
import { dojoConfig } from '../dojoConfig.ts';
import { init } from '@dojoengine/sdk';
import { DojoSdkProvider } from '@dojoengine/sdk/react';
import { setupWorld } from './typescript/contracts.gen.ts';
import { SchemaType } from './typescript/models.gen.ts';

async function main() {
  const sdk = await init<SchemaType>({
    client: {
      rpcUrl: dojoConfig.rpcUrl,
      toriiUrl: dojoConfig.toriiUrl,
      relayUrl: dojoConfig.relayUrl,
      worldAddress: dojoConfig.manifest.world.address,
  },
  domain: {
      name: "WORDLE",
      version: "1.0",
      chainId: "KATANA",
      revision: "1",
  },
  });
  
createRoot(document.getElementById('root')!).render(
  <StrictMode>
  <DojoSdkProvider sdk={sdk} dojoConfig={dojoConfig} clientFn={setupWorld}>
    <App />
  </DojoSdkProvider>
  </StrictMode>,
);
}

main().catch(console.error)
```

## Check app is running properly : 

Run dev server and head over http://localhost:5173 to check that there are no errors.
