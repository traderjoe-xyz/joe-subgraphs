import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Swap as SwapEvent } from '../../generated/FeeConverter/FeeConverter'
import { Swap } from '../../generated/schema'
import { loadDayData, loadFeeConverter } from '../entities'
import { getUSDRate } from 'pricing'
import { BIG_DECIMAL_1E12 } from 'const'
import { ERC20 } from '../../generated/FeeConverter/ERC20'

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

export function handleSwap(event: SwapEvent): void {
  const feeConverter = loadFeeConverter(event.address, event.block)
  if (!feeConverter) {
    return
  }

  const tokenIn = event.params.srcToken
  const tokenOut = event.params.dstToken

  const tokenInDecimals = getDecimals(tokenIn)
  const tokenOutDecimals = getDecimals(tokenOut)

  const amountIn = event.params.amount.toBigDecimal().div(BigDecimal.fromString('1e' + tokenInDecimals.toString()))
  const amountOut = event.params.returnAmount
    .toBigDecimal()
    .div(BigDecimal.fromString('1e' + tokenOutDecimals.toString()))

  const amountInUsd = amountIn.times(getUSDRate(tokenIn, event.block)).div(BIG_DECIMAL_1E12)
  const amountOutUsd = amountOut.times(getUSDRate(tokenOut, event.block)).div(BIG_DECIMAL_1E12)

  const swapId = tokenIn.toHex() + '-' + tokenOut.toHex() + '-' + event.block.number.toString()
  const swap = new Swap(swapId)
  swap.feeConverter = feeConverter.id
  swap.tokenIn = tokenIn
  swap.tokenOut = tokenOut
  swap.amountIn = amountIn
  swap.amountOut = amountOut
  swap.amountInUsd = amountInUsd
  swap.amountOutUsd = amountOutUsd
  swap.timestamp = event.block.timestamp
  swap.block = event.block.number
  swap.tx = event.transaction.hash
  swap.save()

  const dayData = loadDayData(event.block)
  dayData.usdRemitted = dayData.usdRemitted.plus(amountOutUsd)

  feeConverter.save()
}
