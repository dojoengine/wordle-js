import { useAccount } from "@starknet-react/core";
import { Wordle } from "./components/wordle";
import { Wallet } from "./components/wallet";
import { useEffect, useMemo, useState } from "react";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { KeysClause, ToriiQueryBuilder } from "@dojoengine/sdk";
import { ModelsMapping } from "./typescript/models.gen";
import { addAddressPadding } from "starknet";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useSystemCalls } from "./hooks/useSystemCalls";
import type { Subscription } from "@dojoengine/torii-client";

function App() {
	const { address } = useAccount();
	const { sdk, useDojoStore } = useDojoSDK();
	const state = useDojoStore((s) => s);
	const [sub, setSub] = useState<Subscription | null>(null);
	const entityId = useMemo(() => {
		if (address) {
			return getEntityIdFromKeys([BigInt(address)]);
		}
		return BigInt(0);
	}, [address]);
	const { start } = useSystemCalls(entityId);

	useEffect(() => {
		async function checkGame(addr: string) {
			const [game, subscription] = await sdk.subscribeEntityQuery({
				query: new ToriiQueryBuilder()
					.withClause(
						KeysClause(
							[ModelsMapping.Game],
							[addAddressPadding(addr)],
							"FixedLen",
						).build(),
					)
					.withEntityModels([ModelsMapping.Game])
					.includeHashedKeys(),
				callback: ({ data, error }) => {
					if (data) {
						state.setEntities(data);
					}
					if (error) {
						console.error(error);
					}
				},
			});
			setSub(subscription);
			if (
				game.length === 0 &&
				Object.keys(state.pendingTransactions).length === 0
			) {
				start(addr);
			}
		}
		if (address) {
			checkGame(address).catch(console.error);
		}
		return () => {
			sub?.free();
		};
	}, [address]);

	if (!address) {
		return <Wallet />;
	}

	return (
		<>
			<div>
				<h1>{address}</h1>
			</div>
			<Wordle />
		</>
	);
}

export default App;
