# STEP 08

## Deploy on slot

be sure to have [slot properly installed on your machine.](https://github.com/cartridge-gg/slot?tab=readme-ov-file#installation)

```bash
slot --version
```

```bash
slot auth login
```
you should see something like: `You are now logged in!`

### Choose your path

You can now go to different paths, either deploy on a katana (that will be accessible), sepolia or mainnet.
- If you want to have a usable demo, go for katana
- Go for sepolia, if you need to have it onchain
- Mainnet if you know what you are doing.

#### Katana
You will have to create a katana instance to deploy your contracts to.
```bash
slot deployments create wordle-game katana
slot deployments describe wordle-game katana
```
you should have a Url displayed. use it to configure `dojo_slot.toml`
```toml
[env]
rpc_url = https://you-slot-katana-deployement.gg
```
update `Scarb.toml` to add profile~
```toml
[profile.slot]
```

deploy your world to slot
```bash
sozo build --profile slot
sozo migrate --profile slot
```

once deployed, you can start a torii instance :

```bash
slot deployments create wordle-game torii --world 0x44f8f7ca8e34c235e56f6f6f1ee8407353a704c572ae2e36b8c02fe40ba72aa --rpc https://api.cartridge.gg/x/wordle-game/katana
```

Now you can update `client/dojoConfig.ts`. Also create a `.env` file that you will have to update accordingly in target deployment envs.
```ts
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
```

#### Sepolia

Just do the same as above, but instead of deploying a katana instance, you can use a RPC for sepolia e.g: https://api.cartridge.gg/x/starknet/sepolia

To deploy your world : 

```bash
sozo build --profile sepolia
sozo migrate --profile sepolia --slot.controller
```
Then deploy a torii instance using sepolia rpc.

#### Mainnet

⚠️ Deploying to mainnet involves actual cost. If you deploy there, you know what you are doing.