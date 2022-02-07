# Trader Joe Subgraphs

Subgraph for Trader Joe on AVAX chain. 

Forked from `sushiswap-subgraph`. 

### Subgraph Status

| subgraph   | rinkeby | avalanche | 
|------------| :---:   | :---:     |
| exchange   |   [x]   |    [x]    |
| masterchef |   [x]   |    [x]    |
| bar        |   [x]   |    [x]    |


### Deploy

```` 
# authenticate api key
$ graph auth https://api.thegraph.com/deploy/ <API_KEY>

# build constants
$ cd packages/constants
$ yarn prepare:avax

# build subgraph
$ cd subgraphs/exchange
$ yarn prepare:avax
$ yarn codegen:avax
$ yarn build:avax

# deploy subgraph
$ yarn deploy:avax
````


### (TRADERJOE-SUBGRAPH README)
Aims to deliver analytics & historical data for Trader Joe. Still a work in progress. Feel free to contribute!

The Graph exposes a GraphQL endpoint to query the events and entities within the SushiSwap ecosytem.

Current subgraph locations:

1. **Exchange**: Includes all SushiSwap Exchange data with Price Data, Volume, Users, etc: https://thegraph.com/hosted-service/subgraph/traderjoe-xyz/exchange

2. **Master Chef Joe V2**: Indexes all MasterChef v2 staking data: https://thegraph.com/hosted-service/subgraph/traderjoe-xyz/masterchefv2

3. **Master Chef Joe V3**: Indexes all MasterChef v3 staking data: https://thegraph.com/hosted-service/subgraph/traderjoe-xyz/masterchefv3

4. **Joe Maker**: Indexes the JoeMaker contract, that handles the serving of exchange fees to the JoeBar: https://thegraph.com/hosted-service/subgraph/traderjoe-xyz/maker

5. **Joe Bar**: Indexes the SushiBar, includes data related to the bar: https://thegraph.com/hosted-service/subgraph/traderjoe-xyz/bar

6. **Dexcandles**: https://thegraph.com/hosted-service/subgraph/traderjoe-xyz/dexcandles

## To setup and deploy

For any of the subgraphs:

1. Run the `yarn run codegen:[subgraph]` command to prepare the TypeScript sources for the GraphQL (generated/schema) and the ABIs (generated/[ABI]/\*)
2. [Optional] run the `yarn run build:[subgraph]` command to build the subgraph. Can be used to check compile errors before deploying.
3. Run `graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>`
4. Deploy via `yarn run deploy:[subgraph]`.



