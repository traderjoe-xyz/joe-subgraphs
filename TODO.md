### TODO
- [x] update `constants` 
    + update contract addresses for `contants/config/mainnet.json`
    + update `index.ts`
- [x] update `pricing`
    + add `pandaswap_wavax_usdt_pair_address` in `constants/config/mainnet.json`
    + update the starting block for pandaswap
- [ ] update `exchange` and remove/rename constants
    + [x] update `config/mainnet.json`
    + [x] add `pandaswap-sdk` and update ABIs
    + [x] update `exchange.template.yaml`
    + [x] refactor ETH to AVAX basis `exchange.graphql`
    + [x] refactor/pull `pricing.ts`
    + [x] update `mappings/pair.ts`
        - [x] add whitelist of tokens
    + [x] update `entities`: 
        - [x] `token.ts`
        - [x] `token-day-data.ts`
        - [x] `pair.ts`
        - [x] `liquidity-position-snapshot.ts`
        - [x] `factory.ts`
        - [x] `bundle.ts`

