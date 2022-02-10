import { Address, BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts'
import { concat } from '@graphprotocol/graph-ts/helper-functions'
import { Swap } from '../generated/templates/Pair/Pair'
import { PairCreated } from '../generated/Factory/Factory'
import { Pair as PairTemplate } from '../generated/templates'
import { Pair, Candle } from '../generated/schema'
import { ERC20 } from '../generated/templates/Pair/ERC20'

function getDecimals(address: Address): BigInt {
  const contract = ERC20.bind(address)

  // try types uint8 for decimals
  let decimalValue = null

  const decimalResult = contract.try_decimals()

  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }

  return BigInt.fromI32(decimalValue as i32)
}

export function handleNewPair(event: PairCreated): void {
  const pair = new Pair(event.params.pair.toHex())
  pair.token0 = event.params.token0
  pair.token1 = event.params.token1
  pair.save()

  PairTemplate.create(event.params.pair)
}

function getTokenAmount(token: string, amountIn: BigInt, amountOut: BigInt): BigInt {
  const decimals = getDecimals(Address.fromString(token))
  const exponent = BigInt.fromI32(18).minus(decimals)
  if (exponent >= BigInt.fromI32(0)) {
    const multiplier = BigInt.fromString(BigDecimal.fromString('1e' + exponent.toString()).toString())
    return amountIn.minus(amountOut).abs().times(multiplier)
  } else {
    const divider = BigInt.fromString(BigDecimal.fromString('1e' + (exponent.times(BigInt.fromI32(-1))).toString()).toString())
    return amountIn.minus(amountOut).abs().div(divider)
  }
}

export function handleSwap(event: Swap): void {
  const pair = Pair.load(event.address.toHex())

  const token0Amount: BigInt = getTokenAmount(pair.token0.toHexString(), event.params.amount0In, event.params.amount0Out)
  const token1Amount: BigInt = getTokenAmount(pair.token1.toHexString(), event.params.amount1In, event.params.amount1Out)

  if (token0Amount.isZero() || token1Amount.isZero()) {
    return
  }

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
