import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

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