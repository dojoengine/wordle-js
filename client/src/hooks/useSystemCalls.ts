import { ToriiQueryBuilder } from "@dojoengine/sdk";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import { BigNumberish } from "starknet";
import { v4 as uuidv4 } from "uuid";

function createDefaultGame() {
	return {
		player: "",
		attempts: [],
	};
}

export function useSystemCalls(entityId: BigNumberish) {
	const { account } = useAccount();
	const { useDojoStore, client } = useDojoSDK();
	const state = useDojoStore((s) => s);

	const start = useCallback(
		async (address: string) => {
			const txId = uuidv4();
			const game = createDefaultGame();

			state.applyOptimisticUpdate(txId, (draft) => {
				if (!draft.entities[entityId.toString()]) {
					draft.entities = {
						...draft.entities,
						[entityId.toString()]: {
							entityId: entityId.toString(),
							models: { wordle: { Game: game } },
						},
					};
				}
			});

			try {
				await client.actions.start(account!);

				state.waitForEntityChange(entityId.toString(), (entity) => {
					return entity?.models?.wordle?.Game?.player === address;
				});
			} catch (err) {
				state.revertOptimisticUpdate(txId);
				console.error("Failed to start game", err);
			} finally {
				state.confirmTransaction(txId);
			}
		},
		[account, state, entityId, client],
	);

	return { start };
}
