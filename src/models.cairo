use starknet::{ContractAddress};

pub const CONFIG_ID: u32 = 9898998;
pub const MAX_ATTEMPTS: usize = 6;
pub const WORD_CHAR_COUNT: usize = 5;

#[derive(Drop, Serde, Debug)]
#[dojo::model]
pub struct Config {
    #[key]
    pub config_id: u32,
    pub expires_at: u64,
    pub word: felt252,
}

#[derive(Drop, Serde, Debug)]
#[dojo::model]
pub struct Game {
    #[key]
    pub player: ContractAddress,
    pub attempts: Array<Attempt>,
}


#[derive(Introspect, Drop, Serde, Debug)]
pub struct Attempt {
    pub word: felt252,
    pub hint: u16,
}
