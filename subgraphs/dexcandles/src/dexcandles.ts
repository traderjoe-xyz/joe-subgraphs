import { Address, BigInt, Bytes, log } from '@graphprotocol/graph-ts'
import { concat } from '@graphprotocol/graph-ts/helper-functions'
import { Swap } from '../generated/templates/Pair/Pair'
import { PairCreated } from '../generated/Factory/Factory'
import { Pair as PairTemplate } from '../generated/templates'
import { Pair, Candle } from '../generated/schema'
import { ERC20 } from '../generated/Factory/ERC20'

import {
  BIG_INT_1E12,
  BIG_INT_1E10,
  BIG_INT_1E9,
  BIG_INT_1E6,
  USDT_ADDRESS,
  USDC_ADDRESS,
  WBTC_ADDRESS,
  APEX_ADDRESS,
  TIME_ADDRESS,
  GB_ADDRESS,
  MYAK_ADDRESS,
} from 'const'

let supportedTokensList: String[] = [
  USDT_ADDRESS.toHexString(), 
  USDC_ADDRESS.toHexString(), 
  WBTC_ADDRESS.toHexString(), 
  APEX_ADDRESS.toHexString(),
  TIME_ADDRESS.toHexString(),
  GB_ADDRESS.toHexString(),
  MYAK_ADDRESS.toHexString()
]

function getDecimals(address: Address): BigInt {
  // hardcode overrides NOTE: AAVE
  if (address.toHex() == '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9') {
    return BigInt.fromI32(18)
  }

  const contract = ERC20.bind(address)

  // try types uint8 for decimals
  let decimalValue = null

  const decimalResult = contract.try_decimals()

  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }

  return BigInt.fromI32(decimalValue as i32)
}

function getMultiplier(decimals: i32): BigInt {
  let multiplier: BigInt

  if (decimals === 6) {
    multiplier = BIG_INT_1E12
  } else if (decimals === 8) {
    multiplier = BIG_INT_1E10
  } else if (decimals === 9) {
    multiplier = BIG_INT_1E9
  } else if (decimals === 12) {
    multiplier = BIG_INT_1E6
  }

  return multiplier
}

export function handleNewPair(event: PairCreated): void {
  const pair = new Pair(event.params.pair.toHex())
  pair.token0 = event.params.token0
  pair.token1 = event.params.token1
  pair.save()

  PairTemplate.create(event.params.pair)
}

export function getTokenAmount0(event: Swap): BigInt {
  const pair = Pair.load(event.address.toHex())
  const token0 = pair.token0.toHexString()
  const decimals = getDecimals(Address.fromString(token0))

  if (supportedTokensList.indexOf(token0) > -1) {
    return event.params.amount0In.minus(event.params.amount0Out).abs().times(getMultiplier(decimals as i32))
  }

  //fallback
  return event.params.amount0In.minus(event.params.amount0Out).abs()
}

export function getTokenAmount1(event: Swap): BigInt {
  const pair = Pair.load(event.address.toHex())
  const token1 = pair.token1.toHexString()
  const decimals = getDecimals(Address.fromString(token1))

  if (supportedTokensList.indexOf(token1) > -1) {
    return event.params.amount0In.minus(event.params.amount0Out).abs().times(getMultiplier(decimals as i32))
  }

  //fallback
  return event.params.amount0In.minus(event.params.amount0Out).abs()
}

export function handleSwap(event: Swap): void {
  const pair = Pair.load(event.address.toHex())
  log.error('Swap! {} {} {}', [pair.token0.toHex(), pair.token1.toHex(), USDT_ADDRESS.toHex()])

  const token0Amount: BigInt = getTokenAmount0(event)
  const token1Amount: BigInt = getTokenAmount1(event)

  if (token0Amount.isZero() || token1Amount.isZero()) {
    return
  }

  if (token0Amount.isZero() || token1Amount.isZero()) {
    return
  }

  log.error('token0: {} {}', [
    event.params.amount0In.minus(event.params.amount0Out).abs().times(BIG_INT_1E12).toString(),
    event.params.amount0In.minus(event.params.amount0Out).abs().toString(),
  ])
  log.error('token1: {} {}', [
    event.params.amount1Out.minus(event.params.amount1In).abs().times(BIG_INT_1E12).toString(),
    event.params.amount1Out.minus(event.params.amount1In).abs().toString(),
  ])

  // const price = token0AmountBigDecimal.div(token1AmountBigDecimal)
  const price = token0Amount.divDecimal(token1Amount.toBigDecimal())
  const tokens = concat(pair.token0, pair.token1)
  const timestamp = event.block.timestamp.toI32()

  const periods: i32[] = [5 * 60, 15 * 60, 60 * 60, 4 * 60 * 60, 24 * 60 * 60, 7 * 24 * 60 * 60]
  for (let i = 0; i < periods.length; i++) {
    const time_id = timestamp / periods[i]
    const candle_id = concat(concat(Bytes.fromI32(time_id), Bytes.fromI32(periods[i])), tokens).toHex()
    let candle = Candle.load(candle_id)
    if (candle === null) {
      candle = new Candle(candle_id)
      candle.time = timestamp - (timestamp % periods[i]) // Round to the nearest time period
      candle.period = periods[i]
      candle.token0 = pair.token0
      candle.token1 = pair.token1
      candle.open = price
      candle.low = price
      candle.high = price
      candle.token0TotalAmount = BigInt.fromI32(0)
      candle.token1TotalAmount = BigInt.fromI32(0)
    } else {
      if (price < candle.low) {
        candle.low = price
      }
      if (price > candle.high) {
        candle.high = price
      }
    }

    candle.close = price
    candle.lastBlock = event.block.number.toI32()
    candle.token0TotalAmount = candle.token0TotalAmount.plus(token0Amount)
    candle.token1TotalAmount = candle.token1TotalAmount.plus(token1Amount)
    candle.save()
  }
}
