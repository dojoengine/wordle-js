import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Game, Attempt } from "../typescript/models.gen";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function shortAddress(address: string): string {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

const TARGET_HINT = [2, 2, 2, 2, 2];
export function gameIsFinished(game: Game) {
	return game?.attempts.reduce((acc: boolean, curr: Attempt) => {
		return (
			acc ||
			curr.hint.every(
				(value: number, index: number) => value === TARGET_HINT[index],
			)
		);
	}, false);
}
