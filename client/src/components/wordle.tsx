import { useDojoSDK, useModel } from "@dojoengine/sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSystemCalls } from "../hooks/useSystemCalls";
import { useAccount } from "@starknet-react/core";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { ModelsMapping } from "../typescript/models.gen";

export function Wordle() {
	const inputRef = useRef<HTMLInputElement>(null);
	const submitRef = useRef<HTMLButtonElement>(null);
	const { address } = useAccount();

	const entityId = useMemo(() => {
		if (address) {
			return getEntityIdFromKeys([BigInt(address)]);
		}
		return BigInt(0);
	}, [address]);

	const { attempt } = useSystemCalls(entityId);
	const game = useModel(entityId, ModelsMapping.Game);

	const [guesses, setGuesses] = useState<string[]>(Array(6).fill(""));
	const [currentGuess, setCurrentGuess] = useState("");
	const [currentRow, setCurrentRow] = useState(0);
	console.log(game);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (currentGuess.length !== 5) return;
		if (currentRow >= 6) return;

		await attempt(currentGuess);
		setGuesses((prev) => {
			const newGuesses = [...prev];
			newGuesses[currentRow] = currentGuess;
			return newGuesses;
		});
		setCurrentRow((prev) => prev + 1);
		setCurrentGuess("");
	};

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [inputRef, submitRef]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.toUpperCase();
		if (value.length <= 5 && value.match(/^[A-Z]*$/)) {
			setCurrentGuess(value);
		}
	};

	return (
		<div className="flex flex-col items-center p-4">
			<h1 className="text-2xl font-bold mb-4">Wordle</h1>

			<form onSubmit={handleSubmit} className="mb-4">
				<input
					ref={inputRef}
					type="text"
					value={currentGuess}
					onChange={handleChange}
					maxLength={5}
					className="border-2 p-2 mr-2"
					placeholder="Enter 5-letter word"
					disabled={currentRow >= 6}
				/>
				<button
					ref={submitRef}
					type="submit"
					disabled={currentGuess.length !== 5 || currentRow >= 6}
					className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
				>
					Guess
				</button>
			</form>

			<div className="grid grid-rows-6 gap-2">
				{guesses.map((guess, rowIndex) => (
					<div key={rowIndex} className="grid grid-cols-5 gap-2">
						{Array(5)
							.fill(null)
							.map((_, colIndex) => {
								const letter =
									rowIndex === currentRow
										? currentGuess[colIndex]
										: guess[colIndex];

								return (
									<Letter
										key={colIndex}
										letter={letter}
										currentRow={currentRow}
										colIndex={colIndex}
										rowIndex={rowIndex}
									/>
								);
							})}
					</div>
				))}
			</div>
		</div>
	);
}

function Letter({ letter, currentRow, colIndex, rowIndex }) {
	const targetWord = "REACT";
	const getLetterColor = (letter: string, index: number, row: number) => {
		if (!letter) return "bg-gray-200";
		if (row >= currentRow) return "bg-gray-200";

		if (targetWord[index] === letter) {
			return "bg-green-500";
		}
		if (targetWord.includes(letter)) {
			return "bg-yellow-500";
		}
		return "bg-gray-400";
	};

	return (
		<div
			className={`w-14 h-14 border-2 flex items-center justify-center font-bold text-xl
                            ${getLetterColor(letter, colIndex, rowIndex)}`}
		>
			{letter && letter.toUpperCase()}
		</div>
	);
}
