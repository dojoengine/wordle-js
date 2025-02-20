import { createDojoConfig } from "@dojoengine/core";

import manifestDev from "../manifest_dev.json";
import manifestSlot from "../manifest_slot.json";

const manifest = (env: string) => {
	if ("slot" === env) return manifestSlot;
	return manifestDev;
};

export const dojoConfig = createDojoConfig({
	manifest: manifest(import.meta.env.VITE_APP_ENV),
	rpcUrl: import.meta.env.VITE_RPC_URL,
	toriiUrl: import.meta.env.VITE_TORII_URL,
	relayUrl: import.meta.env.VITE_RELAY_URL,
});
