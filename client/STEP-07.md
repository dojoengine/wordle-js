# STEP 07

## Prepare game for release

- add wallet connector for real use (we'll install cartridge/controller here)

```bash
pnpm add @cartridge/connector @cartridge/controller
```

update `src/starknet-provider.tsx` accordingly
```ts

import { ControllerConnector } from "@cartridge/connector";
import { constants } from "starknet";
import type { SessionPolicies } from "@cartridge/controller";
import { getContractByName } from "@dojoengine/core";

const policies: SessionPolicies = {
	contracts: {
		[getContractByName(dojoConfig.manifest, "wordle", "actions")]: {
			name: "Actions",
			description: "Actions to operate on wordle system",
			methods: [
				{
					name: "Start",
					description: "Start a new wordle game.",
					entrypoint: "start",
				},
				{
					name: "Attempt",
					description: "Submit an attempt on finding secret word",
					entrypoint: "attempt",
				},
			],			
		},
	},
};
const controller = new ControllerConnector({
	chains: [
		{
			rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
		},
		{
			rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet",
		},
	],
	defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
	policies,
});

export default function StarknetProvider({ children }: PropsWithChildren) {
	return (
		<StarknetConfig
            // Update this line to add controller to connectors list
			connectors={[...connectors, controller]}
		>
			{children}
		</StarknetConfig>
	);
}
```

Once this is set up, hit http://localhost:5173, you should see controller appearing in controller list