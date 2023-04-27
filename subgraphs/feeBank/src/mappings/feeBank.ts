import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts'
import { Swap as SwapEvent } from '../../generated/FeeConverter/FeeConverter'
import { Swap } from '../../generated/schema'
import { loadDayData, loadFeeBank } from '../entities'
import { getUSDRate } from 'pricing'
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

function getSymbol(address: Address): string {
  const contract = ERC20.bind(address)
  let symbol = ''

  const symbolResult = contract.try_symbol()
  if (!symbolResult.reverted) {
    symbol = symbolResult.value
  }

  return symbol
}

export function handleSwap(event: SwapEvent): void {
  const feeBank = loadFeeBank(event.address, event.block)
  if (!feeBank) {
    return
  }

  const tokenIn = event.params.srcToken
  const tokenOut = event.params.dstToken

  const tokenInDecimals = getDecimals(tokenIn)
  const tokenOutDecimals = getDecimals(tokenOut)

  const tokenInSymbol = getSymbol(tokenIn)
  const tokenOutSymbol = getSymbol(tokenOut)

  const amountIn = event.params.amountIn.toBigDecimal().div(BigDecimal.fromString('1e' + tokenInDecimals.toString()))
  const amountOut = event.params.amountOut.toBigDecimal().div(BigDecimal.fromString('1e' + tokenOutDecimals.toString()))

  const amountInUsd = amountIn
    .times(getUSDRate(tokenIn, event.block))
    .div(BigDecimal.fromString('1e' + BigInt.fromString('18').minus(tokenInDecimals).toString()))
  const amountOutUsd = amountOut
    .times(getUSDRate(tokenOut, event.block))
    .div(BigDecimal.fromString('1e' + BigInt.fromString('18').minus(tokenOutDecimals).toString()))

  const swapId = tokenIn.toHex() + '-' + tokenOut.toHex() + '-' + event.block.number.toString()
  const swap = new Swap(swapId)
  swap.feeBank = feeBank.id
  swap.tokenIn = tokenIn
  swap.tokenOut = tokenOut
  swap.tokenInSymbol = tokenInSymbol
  swap.tokenOutSymbol = tokenOutSymbol
  swap.amountIn = amountIn
  swap.amountOut = amountOut
  swap.amountInUsd = amountInUsd
  swap.amountOutUsd = amountOutUsd
  swap.timestamp = event.block.timestamp
  swap.block = event.block.number
  swap.tx = event.transaction.hash

  const dayData = loadDayData(event.block)
  dayData.usdRemitted = dayData.usdRemitted.plus(amountOutUsd)
  dayData.save()

  swap.dayData = dayData.id
  swap.save()

  feeBank.usdRemitted = feeBank.usdRemitted.plus(amountOutUsd)
  feeBank.save()
}
