import { DojoProvider, DojoCall } from "@dojoengine/core";
import {
	Account,
	AccountInterface,
	BigNumberish,
	CairoOption,
	CairoCustomEnum,
	ByteArray,
} from "starknet";
import * as models from "./models.gen";

export function setupWorld(provider: DojoProvider) {
	const build_actions_attempt_calldata = (word: BigNumberish): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "attempt",
			calldata: [word],
		};
	};

	const actions_attempt = async (
		snAccount: Account | AccountInterface,
		word: BigNumberish,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_attempt_calldata(word),
				"wordle",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_vrf_provider_mock_consumeRandom_calldata = (
		source: CairoCustomEnum,
	): DojoCall => {
		return {
			contractName: "vrf_provider_mock",
			entrypoint: "consume_random",
			calldata: [source],
		};
	};

	const vrf_provider_mock_consumeRandom = async (
		snAccount: Account | AccountInterface,
		source: CairoCustomEnum,
	) => {
		try {
			return await provider.execute(
				snAccount,
				build_vrf_provider_mock_consumeRandom_calldata(source),
				"wordle",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_vrf_provider_mock_requestRandom_calldata = (
		caller: string,
		source: CairoCustomEnum,
	): DojoCall => {
		return {
			contractName: "vrf_provider_mock",
			entrypoint: "request_random",
			calldata: [caller, source],
		};
	};

	const vrf_provider_mock_requestRandom = async (
		caller: string,
		source: CairoCustomEnum,
	) => {
		try {
			return await provider.call(
				"wordle",
				build_vrf_provider_mock_requestRandom_calldata(caller, source),
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	const build_actions_start_calldata = (): DojoCall => {
		return {
			contractName: "actions",
			entrypoint: "start",
			calldata: [],
		};
	};

	const actions_start = async (snAccount: Account | AccountInterface) => {
		try {
			return await provider.execute(
				snAccount,
				build_actions_start_calldata(),
				"wordle",
			);
		} catch (error) {
			console.error(error);
			throw error;
		}
	};

	return {
		actions: {
			attempt: actions_attempt,
			buildAttemptCalldata: build_actions_attempt_calldata,
			start: actions_start,
			buildStartCalldata: build_actions_start_calldata,
		},
		vrf_provider_mock: {
			consumeRandom: vrf_provider_mock_consumeRandom,
			buildConsumeRandomCalldata:
				build_vrf_provider_mock_consumeRandom_calldata,
			requestRandom: vrf_provider_mock_requestRandom,
			buildRequestRandomCalldata:
				build_vrf_provider_mock_requestRandom_calldata,
		},
	};
}
