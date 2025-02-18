import { useDojoSDK } from "@dojoengine/sdk/react";
import { useAccount } from "@starknet-react/core";
import { useCallback } from "react";
import { BigNumberish, shortString } from "starknet";
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

	const attempt = useCallback(
		async (word: string) => {
			const txId = uuidv4();
			const attempt = { word, hint: 0 };
			const entity = {
				...state.getEntity(entityId.toString()),
				models: {
					wordle: {
						Game: {
							attempts: [{ word, hint: 0 }],
						},
					},
				},
			};

			state.applyOptimisticUpdate(txId, (draft) => {
				if (draft.entities[entityId.toString()]) {
					draft.entities[
						entityId.toString()
					]?.models?.wordle?.Game?.attempts.push(attempt);
				}
			});
			try {
				await client.actions.attempt(
					account!,
					shortString.encodeShortString(word),
				);
				await state.waitForEntityChange(entityId.toString(), (newEntity) => {
					return (
						newEntity?.models?.wordle?.Game?.attempts.length ===
						entity.models.wordle.Game.attempts.length
					);
				});
			} catch (err) {
				state.revertOptimisticUpdate(txId);
				console.error("failed to verify attempt", err);
			} finally {
				state.confirmTransaction(txId);
			}
		},
		[state],
	);

	return { start, attempt };
}
