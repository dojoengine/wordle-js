import { useAccount } from "@starknet-react/core";
import { Wordle } from "./components/wordle";
import { Wallet } from "./components/wallet";

function App() {
	const { address } = useAccount();
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
