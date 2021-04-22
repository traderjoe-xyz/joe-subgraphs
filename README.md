# Joe Defi (AVAX) Subgraph

Subgraph for Joe Defi on AVAX chain. Currently only `exchange` subgraph available. 

URL: https://thegraph.com/explorer/subgraph/0xmurloc/joeDefiAvax

Forked from `sushiswap-subgraph`. 

### Subgraph Status

| subgraph   | rinkeby | avalanche | 
|------------| :---:   | :---:     |
| exchange   |   [x]   |           |
| masterchef |   [x]   |           |
| bar        |   [x]   |           |


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


### (SUSHISWAP-SUBGRAPH README)
Aims to deliver analytics & historical data for SushiSwap. Still a work in progress. Feel free to contribute!

The Graph exposes a GraphQL endpoint to query the events and entities within the SushiSwap ecosytem.

Current subgraph locations:

1. **Exchange**: Includes all SushiSwap Exchange data with Price Data, Volume, Users, etc: https://thegraph.com/explorer/subgraph/sushiswap/exchange

2. **Master Chef**: Indexes all MasterChef staking data: https://thegraph.com/explorer/subgraph/sushiswap/master-chef

3. **Sushi Maker**: Indexes the SushiMaker contract, that handles the serving of exchange fees to the SushiBar: https://thegraph.com/explorer/subgraph/sushiswap/sushi-maker

4. **Sushi Timelock**: Includes all of the timelock transactions queued, executed, and cancelled: https://thegraph.com/explorer/subgraph/sushiswap/sushi-timelock

5. **Sushi Bar**: Indexes the SushiBar, includes data related to the bar: https://thegraph.com/explorer/subgraph/sushiswap/sushi-bar

6. **SushiSwap-SubGraph-Fork** (on uniswap-fork branch): Indexes the SushiSwap Factory, includes Price Data, Pricing, etc: https://thegraph.com/explorer/subgraph/jiro-ono/sushiswap-v1-exchange

## To setup and deploy

For any of the subgraphs: `sushiswap` or `bar` as `[subgraph]`

1. Run the `yarn run codegen:[subgraph]` command to prepare the TypeScript sources for the GraphQL (generated/schema) and the ABIs (generated/[ABI]/\*)
2. [Optional] run the `yarn run build:[subgraph]` command to build the subgraph. Can be used to check compile errors before deploying.
3. Run `graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>`
4. Deploy via `yarn run deploy:[subgraph]`.

## To query these subgraphs

Please use our node utility: [sushi-data](https://github.com/sushiswap/sushi-data).

Note: This is in on going development as well.

## Example Queries

We will add to this as development progresses.

### Maker

```graphql
{
  maker(id: "0x6684977bbed67e101bb80fc07fccfba655c0a64f") {
    id
    servings(orderBy: timestamp) {
      id
      server {
        id
      }
      tx
      pair
      token0
      token1
      sushiServed
      block
      timestamp
    }
  }
  servers {
    id
    sushiServed
    servings(orderBy: timestamp) {
      id
      server {
        id
      }
      tx
      pair
      token0
      token1
      sushi
      block
      timestamp
    }
  }
}

