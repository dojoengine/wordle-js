import type { SchemaType as ISchemaType } from "@dojoengine/sdk";

import { BigNumberish } from "starknet";

// Type definition for `wordle::models::Attempt` struct
export interface Attempt {
	word: BigNumberish;
	hint: BigNumberish;
}

// Type definition for `wordle::models::Config` struct
export interface Config {
	config_id: BigNumberish;
	expires_at: BigNumberish;
	word: BigNumberish;
}

// Type definition for `wordle::models::ConfigValue` struct
export interface ConfigValue {
	expires_at: BigNumberish;
	word: BigNumberish;
}

// Type definition for `wordle::models::Game` struct
export interface Game {
	player: string;
	attempts: Array<Attempt>;
}

// Type definition for `wordle::models::GameValue` struct
export interface GameValue {
	attempts: Array<Attempt>;
}

export interface SchemaType extends ISchemaType {
	wordle: {
		Attempt: Attempt;
		Config: Config;
		ConfigValue: ConfigValue;
		Game: Game;
		GameValue: GameValue;
	};
}
export const schema: SchemaType = {
	wordle: {
		Attempt: {
			word: 0,
			hint: 0,
		},
		Config: {
			config_id: 0,
			expires_at: 0,
			word: 0,
		},
		ConfigValue: {
			expires_at: 0,
			word: 0,
		},
		Game: {
			player: "",
			attempts: [{ word: 0, hint: 0 }],
		},
		GameValue: {
			attempts: [{ word: 0, hint: 0 }],
		},
	},
};
export enum ModelsMapping {
	Attempt = "wordle-Attempt",
	Config = "wordle-Config",
	ConfigValue = "wordle-ConfigValue",
	Game = "wordle-Game",
	GameValue = "wordle-GameValue",
}
