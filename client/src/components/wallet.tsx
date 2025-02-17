import {
	Connector,
	useAccount,
	useConnect,
	useDisconnect,
} from "@starknet-react/core";
import { useCallback, useState } from "react";
import { shortAddress } from "../lib/utils";

export function Wallet() {
	const { address } = useAccount();
	const { connectAsync, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const [pendingConnectorId, setPendingConnectorId] = useState<
		string | undefined
	>(undefined);

	const connect = useCallback(
		async (connector: Connector) => {
			setPendingConnectorId(connector.id);
			try {
				await connectAsync({ connector });
			} catch (error) {
				console.error(error);
			}
			setPendingConnectorId(undefined);
		},
		[connectAsync],
	);

	function isWalletConnecting(connectorId: string) {
		return pendingConnectorId === connectorId;
	}

	if (address) {
		return (
			<>
				<button onClick={() => disconnect}>{shortAddress(address)}</button>
			</>
		);
	}

	return (
		<>
			<div>
				{connectors.map((connector) => {
					return (
						<button
							key={connector.id}
							onClick={() => connect(connector)}
							className="relative pl-12 flex w-full mb-3"
						>
							<div className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-xs bg-background">
								<img
									// @ts-expect-error it's ok
									src={connector.icon.dark}
									className="size-5"
									alt={`${connector.name}`}
								/>
							</div>
							{connector.name}
							{isWalletConnecting(connector.id) && "Loading ..."}
						</button>
					);
				})}
			</div>
		</>
	);
}
