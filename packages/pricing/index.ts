import {
  ADDRESS_ZERO,
  BIG_DECIMAL_1E18,
  BIG_DECIMAL_1E6,
  BIG_DECIMAL_ONE,
  BIG_DECIMAL_ZERO,
  FACTORY_ADDRESS,
  JOE_TOKEN_ADDRESS,
  JOE_USDT_PAIR_ADDRESS,
  TRADERJOE_START_BLOCK, 
  TRADERJOE_WAVAX_USDT_PAIR_ADDRESS,
  USDT_ADDRESS,
  WAVAX_ADDRESS,
} from 'const'
import { Address, BigDecimal, BigInt, ethereum, log } from '@graphprotocol/graph-ts'

import { Factory as FactoryContract } from 'exchange/generated/Factory/Factory'
import { Pair as PairContract } from 'exchange/generated/Factory/Pair'

export function getUSDRate(token: Address, block: ethereum.Block): BigDecimal {
  if (token == USDT_ADDRESS) {
    return BIG_DECIMAL_ONE
  }

  // TODO: add fallback WAVAX_USDT_PAIR_ADDRESS e.g. on pangolin
  //    let address = block.number.le(BigInt.fromI32(10829344))
  //      ? UNISWAP_WETH_USDT_PAIR_ADDRESS
  //      : SUSHISWAP_WETH_USDT_PAIR_ADDRESS
  if (block.number.le(TRADERJOE_START_BLOCK)) {
    return BIG_DECIMAL_ZERO
  }

  let address = TRADERJOE_WAVAX_USDT_PAIR_ADDRESS

  const tokenPriceAVAX = getAvaxRate(token, block)

  const pair = PairContract.bind(address)

  const reserves = pair.getReserves()

  const reserve0 = reserves.value0.toBigDecimal().times(BIG_DECIMAL_1E18)

  const reserve1 = reserves.value1.toBigDecimal().times(BIG_DECIMAL_1E18)

  const avaxPriceUSD = reserve1.div(reserve0).div(BIG_DECIMAL_1E6).times(BIG_DECIMAL_1E18)

  return avaxPriceUSD.times(tokenPriceAVAX)
}

export function getAvaxRate(token: Address, block: ethereum.Block): BigDecimal {
  if (token == WAVAX_ADDRESS) {
    return BIG_DECIMAL_ONE
  }

  // TODO: add fallback, e.g. pangolin
  //    block.number.le(BigInt.fromI32(10829344)) ? UNISWAP_FACTORY_ADDRESS : FACTORY_ADDRESS
  if (block.number.le(TRADERJOE_START_BLOCK)) {
    return BIG_DECIMAL_ZERO
  }
  const factory = FactoryContract.bind(FACTORY_ADDRESS)

  const address = factory.getPair(token, WAVAX_ADDRESS)

  if (address == ADDRESS_ZERO) {
    log.info('Address ZERO...', [])
    return BIG_DECIMAL_ZERO
  }

  const pair = PairContract.bind(address)

  const reserves = pair.getReserves()

  let avax =
    pair.token0() == WAVAX_ADDRESS
      ? reserves.value0.toBigDecimal().times(BIG_DECIMAL_1E18).div(reserves.value1.toBigDecimal())
      : reserves.value1.toBigDecimal().times(BIG_DECIMAL_1E18).div(reserves.value0.toBigDecimal())

  return avax.div(BIG_DECIMAL_1E18)
}

export function getJoePrice(block: ethereum.Block): BigDecimal {

  if (block.number.lt(TRADERJOE_START_BLOCK)) {
    return BIG_DECIMAL_ZERO
  }
  // TODO: fallback on token price
  //    if (block.number.lt(SOME_BLOCK)) {
  //        return getUSDRate(JOE_TOKEN_ADDRESS, block)
  //    } 

  // TODO: fallback on e.g. pangolin
  //    if (block.number.le(SOME_BLOCK)) {
  //        pair = PairContract.bind(SOME_ADDRESS) 
  //    }
  const pair = PairContract.bind(JOE_USDT_PAIR_ADDRESS)

  const reserves = pair.getReserves()
  return reserves.value1
    .toBigDecimal()
    .times(BIG_DECIMAL_1E18)
    .div(reserves.value0.toBigDecimal())
    .div(BIG_DECIMAL_1E6)
}
