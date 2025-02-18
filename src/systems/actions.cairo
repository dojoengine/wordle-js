#[starknet::interface]
pub trait WordleGame<T> {
    fn start(ref self: T);
    fn attempt(ref self: T, word: felt252);
}

#[dojo::contract]
pub mod actions {
    use super::WordleGame;

    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use core::starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use core::num::traits::Zero;

    use wordle::models::{CONFIG_ID, MAX_ATTEMPTS, WORD_CHAR_COUNT, Config, Game, Attempt};
    use wordle::systems::word::{WordSelectorDispatcherTrait, WordSelectorLibraryDispatcher};
    use wordle::mocks::vrf_provider_mock::{
        IVrfProviderDispatcher, IVrfProviderDispatcherTrait, Source,
    };

    use dojo::world::{WorldStorage, WorldStorageTrait};
    use dojo::model::{ModelStorage};

    #[storage]
    pub struct Storage {
        vrf_addr: ContractAddress,
    }

    fn dojo_init(ref self: ContractState, vrf_addr: ContractAddress) {
        let world = self.world_default();
        let vrf_address = if vrf_addr.is_zero() {
            let (vrf_mock_address, _) = world.dns(@"vrf_provider_mock").unwrap();
            vrf_mock_address
        } else {
            vrf_addr
        };

        self.vrf_addr.write(vrf_address);
    }

    #[generate_trait]
    impl WorldDefaultImpl of WorldDefaultTrait {
        fn world_default(self: @ContractState) -> WorldStorage {
            self.world(@"wordle")
        }

        fn wordlib_dispatcher(
            self: @ContractState, world: @WorldStorage,
        ) -> WordSelectorLibraryDispatcher {
            let (_, class_hash) = world.dns(@"word_v0_1_0").expect('wordlib not found');

            WordSelectorLibraryDispatcher { class_hash }
        }
        fn vrf_provider(ref self: ContractState, world: @WorldStorage) -> IVrfProviderDispatcher {
            IVrfProviderDispatcher { contract_address: self.vrf_addr.read() }
        }
    }


    #[abi(embed_v0)]
    impl ImplWordleGame of WordleGame<ContractState> {
        fn start(ref self: ContractState) {
            let player = get_caller_address();

            let mut world = self.world_default();

            let rand = self.vrf_provider(@world).consume_random(Source::Nonce(player));
            let rand_u256: u256 = rand.into();
            let index: felt252 = (rand_u256 % 2315_u256).try_into().unwrap();

            let current_time = get_block_timestamp();

            let mut config: Config = world.read_model(CONFIG_ID);

            if config.expires_at == 0 || current_time > config.expires_at {
                config.expires_at = wordle::get_next_day(current_time);
                config.word = index;

                world.write_model(@config);
            }
            println!("{:?}", config);
            let mut game: Game = world.read_model(player);
            if game.attempts.len() == 0 {
                world.write_model(@game);
            }
            println!("{:?}", game);
        }

        fn attempt(ref self: ContractState, word: felt252) {
            let mut world = self.world_default();
            let mut game: Game = world.read_model(get_caller_address());
            let mut config: Config = world.read_model(CONFIG_ID);
            let random_word = self.wordlib_dispatcher(@world).get_word(config.word);

            assert(
                wordle::ascii_to_string(word).len() == WORD_CHAR_COUNT,
                'word must be 5 char length',
            );
            assert(
                game.attempts.len().try_into().unwrap() < MAX_ATTEMPTS, 'too many attempts today',
            );

            let hint = wordle::get_hint_for_attempt(random_word, word);
            let packed = wordle::pack_attempt(hint.span());

            game.attempts.append(Attempt { word: word, hint: packed });
            world.write_model(@game);
        }
    }
}

#[cfg(test)]
mod tests {
    use dojo_cairo_test::WorldStorageTestTrait;
    use dojo::model::{ModelStorage};
    use dojo::world::{WorldStorageTrait};


    use dojo_cairo_test::{
        spawn_test_world, NamespaceDef, TestResource, ContractDefTrait, ContractDef,
    };

    use starknet::testing;
    use wordle::systems::word::{word};
    use wordle::systems::actions::{actions, WordleGameDispatcher, WordleGameDispatcherTrait};
    use wordle::models::{Config, m_Config, Game, m_Game, CONFIG_ID};

    use wordle::mocks::vrf_provider_mock::vrf_provider_mock;

    fn namespace_def() -> NamespaceDef {
        let ndef = NamespaceDef {
            namespace: "wordle",
            resources: [
                TestResource::Model(m_Config::TEST_CLASS_HASH),
                TestResource::Model(m_Game::TEST_CLASS_HASH),
                TestResource::Contract(actions::TEST_CLASS_HASH),
                TestResource::Contract(vrf_provider_mock::TEST_CLASS_HASH),
                TestResource::Library((word::TEST_CLASS_HASH, @"word", @"0_1_0")),
            ]
                .span(),
        };

        ndef
    }

    fn contract_defs() -> Span<ContractDef> {
        [
            ContractDefTrait::new(@"wordle", @"vrf_provider_mock")
                .with_writer_of([dojo::utils::bytearray_hash(@"wordle")].span()),
            ContractDefTrait::new(@"wordle", @"actions")
                .with_writer_of([dojo::utils::bytearray_hash(@"wordle")].span())
                .with_init_calldata([0x0].span()),
        ]
            .span()
    }

    #[test]
    fn test_start() {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = WordleGameDispatcher { contract_address };

        let caller = starknet::contract_address_const::<'caller1'>();
        testing::set_contract_address(caller);
        testing::set_block_timestamp(1739318400);

        // calling start
        actions_system.start();

        // checking config has properly been initiated;
        let config: Config = world.read_model(CONFIG_ID);
        assert(1739404800 == config.expires_at, 'expires_at incorrect');

        // checking game has properly been initiated;
        let game: Game = world.read_model(caller);
        assert(game.player == caller, 'incorrect caller');

        // calling first attempt
        actions_system.attempt('hello');

        let game: Game = world.read_model(caller);
        assert(game.attempts.len() == 1, 'incorrect attempts length');
    }

    #[test]
    #[should_panic]
    fn test_attempt_fails_when_max_attempts() {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = WordleGameDispatcher { contract_address };

        let caller = starknet::contract_address_const::<'caller1'>();
        testing::set_contract_address(caller);
        testing::set_block_timestamp(1739318400);

        // starting game
        actions_system.start();

        // calling first attempt
        actions_system.attempt('house');
        actions_system.attempt('plane');
        actions_system.attempt('brain');
        actions_system.attempt('steam');
        actions_system.attempt('world');
        actions_system.attempt('glide');
        actions_system.attempt('faill');
    }

    #[test]
    #[should_panic]
    fn test_attempt_fails_when_word_is_too_long() {
        let ndef = namespace_def();
        let mut world = spawn_test_world([ndef].span());
        world.sync_perms_and_inits(contract_defs());

        let (contract_address, _) = world.dns(@"actions").unwrap();
        let actions_system = WordleGameDispatcher { contract_address };

        let caller = starknet::contract_address_const::<'caller1'>();
        testing::set_contract_address(caller);
        testing::set_block_timestamp(1739318400);

        // starting game
        actions_system.start();

        // calling first attempt
        actions_system.attempt('invalid');
    }

    #[test]
    fn test_attempt_finishes_game_when_word_is_found() {}
}
