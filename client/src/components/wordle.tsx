import { useModel } from "@dojoengine/sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSystemCalls } from "../hooks/useSystemCalls";
import { useAccount } from "@starknet-react/core";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { type Attempt, ModelsMapping } from "../typescript/models.gen";

const TARGET_HINT = [2, 2, 2, 2, 2];

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
	const gameIsFinished = game?.attempts.reduce(
		(acc: boolean, curr: Attempt) => {
			return (
				acc ||
				curr.hint.every(
					(value: number, index: number) => value === TARGET_HINT[index],
				)
			);
		},
		false,
	);
	console.log(gameIsFinished);

	const [guesses, setGuesses] = useState<Attempt[]>(
		Array(6).fill({ word: "", hint: 0 }),
	);
	const [currentGuess, setCurrentGuess] = useState("");
	const [currentRow, setCurrentRow] = useState(0);

	useEffect(() => {
		if (game) {
			setCurrentRow(game.attempts.length);
			setGuesses((prevGuesses) => {
				const newGuesses = [...prevGuesses];
				game.attempts.forEach((attempt, idx) => {
					newGuesses[idx] = attempt;
				});
				return newGuesses;
			});
		}
	}, [game]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (currentGuess.length !== 5) return;
		if (currentRow >= 6) return;

		setCurrentGuess("");
		await attempt(currentGuess);
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
										: guess.word[colIndex];
								const hint = guess.hint[colIndex];

								return (
									<Letter
										key={colIndex}
										letter={letter}
										hint={hint}
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

function Letter({
	letter,
	hint,
}: {
	letter: string;
	hint: number;
}) {
	const getLetterColor = (hint: number) => {
		if (0 === hint) return "bg-gray-400";
		if (2 === hint) return "bg-green-500";
		if (1 === hint) return "bg-yellow-500";
		return "bg-gray-200";
	};

	return (
		<div
			className={`w-14 h-14 border-2 flex items-center justify-center font-bold text-xl
                            ${getLetterColor(hint)}`}
		>
			{letter && letter.toUpperCase()}
		</div>
	);
}
