import { StandardizedQueryResult } from "@dojoengine/sdk";
import { Attempt, SchemaType } from "../typescript/models.gen";
import { shortString, num } from "starknet";

export function parseModels(models: StandardizedQueryResult<SchemaType>) {
	for (const model of models) {
		for (const m of Object.keys(model.models)) {
			if (model.models[m].hasOwnProperty("Game")) {
				model.models[m].Game.attempts = parseAttempts(
					model.models[m].Game.attempts,
				);
			}
		}
	}
	return models;
}

function parseAttempts(attempts: Attempt[]): Attempt[] {
	for (const attempt of attempts) {
		attempt.word = shortString
			.decodeShortString(num.cleanHex(attempt.word))
			.trim();
		attempt.hint = unpackAttempt(attempt.hint);
	}
	return attempts;
}

function unpackAttempt(packed: number): number[] {
	const result: number[] = [];
	let remaining: number = packed;

	for (let i = 0; i < 5; i++) {
		const state: number = remaining % 3;
		result.push(state);
		remaining = Math.floor(remaining / 3);
	}

	return result;
}
