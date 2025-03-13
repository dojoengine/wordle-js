import { useEffect, useState, type PropsWithChildren } from "react";
import { mainnet } from "@starknet-react/chains";
import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
import { dojoConfig } from "../dojoConfig";
import {
	predeployedAccounts,
	type PredeployedAccountsConnector,
} from "@dojoengine/predeployed-connector";
import { ControllerConnector } from "@cartridge/connector";
import { shortString, ChainId } from "starknet";
import { type SessionPolicies } from "@cartridge/controller";
import { getContractByName } from "@dojoengine/core";

const policies: SessionPolicies = {
	contracts: {
		[getContractByName(dojoConfig.manifest, "wordle", "actions").address]: {
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
			rpcUrl: "http://localhost:5050",
		},
		{
			rpcUrl: "https://api.cartridge.gg/x/starknet/sepolia",
		},
		{
			rpcUrl: "https://api.cartridge.gg/x/starknet/mainnet",
		},
	],
	defaultChainId: shortString.encodeShortString("KATANA") as ChainId,
	policies,
});

export default function StarknetProvider({ children }: PropsWithChildren) {
	const [connectors, setConnectors] = useState<PredeployedAccountsConnector[]>(
		[],
	);
	const provider = jsonRpcProvider({
		rpc: () => ({ nodeUrl: dojoConfig.rpcUrl as string }),
	});

	useEffect(() => {
		if (connectors.length === 0) {
			predeployedAccounts({
				rpc: dojoConfig.rpcUrl as string,
				id: "katana",
				name: "Katana",
			}).then(setConnectors);
		}
	}, [connectors]);

	return (
		<StarknetConfig
			chains={[mainnet]}
			provider={provider}
			connectors={[...connectors, controller]}
			explorer={voyager}
			autoConnect
		>
			{children}
		</StarknetConfig>
	);
}
