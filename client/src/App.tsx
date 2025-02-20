import { useAccount, useDisconnect } from "@starknet-react/core";
import { Wordle } from "./components/wordle";
import { Wallet } from "./components/wallet";
import { useEffect, useMemo, useState } from "react";
import { useDojoSDK, useModel } from "@dojoengine/sdk/react";
import { KeysClause, ToriiQueryBuilder } from "@dojoengine/sdk";
import { ModelsMapping } from "./typescript/models.gen";
import { addAddressPadding } from "starknet";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { useSystemCalls } from "./hooks/useSystemCalls";
import type { Subscription } from "@dojoengine/torii-client";
import { parseModels } from "./lib/parseModels";
import { shortAddress } from "./lib/utils";

function App() {
	const { address } = useAccount();
	const { disconnect } = useDisconnect();
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
	const configId = getEntityIdFromKeys([BigInt(9898998)]);
	const config = useModel(configId, ModelsMapping.Config);

	useEffect(() => {
		if (config && address) {
			const now = new Date();
			const expiresAt = new Date(config.expires_at * 1000);
			if (now > expiresAt) {
				start(address);
			}
		}
	}, [config, address]);

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
					.includeHashedKeys(),
				callback: ({ data, error }) => {
					if (data) {
						state.setEntities(parseModels(data));
					}
					if (error) {
						console.error(error);
					}
				},
			});
			state.setEntities(parseModels(game));
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
				<h1 className="cursor-pointer" onClick={() => disconnect()}>
					{shortAddress(address)}
				</h1>
			</div>
			<Wordle />
		</>
	);
}

export default App;
