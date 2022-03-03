import { log, Address, BigInt, BigDecimal } from '@graphprotocol/graph-ts'
import { LogConvert, SetTokenTo } from '../../generated/MoneyMaker/MoneyMaker'
import { Remit } from '../../generated/schema'
import { ERC20 } from '../../generated/MoneyMaker/ERC20'
import { Factory } from '../../generated/MoneyMaker/Factory'
import { getMoneyMaker, getRemitter, getDayData, getDecimals } from '../entities'
import { FACTORY_ADDRESS, BIG_INT_ONE, BIG_INT_ZERO, BIG_DECIMAL_ZERO, BIG_DECIMAL_1E12 } from 'const'
import { getUSDRate } from '../../../../packages/pricing'

export function handleLogConvert(event: LogConvert): void {
  log.info('[MoneyMaker] Log Convert {} {} {} {} {} {}', [
    event.params.server.toHex(),
    event.params.token0.toHex(),
    event.params.token1.toHex(),
    event.params.amount0.toString(),
    event.params.amount1.toString(),
    event.params.amountTOKEN.toString(),
  ])

  const moneyMakerAddress = event.address
  const moneyMaker = getMoneyMaker(moneyMakerAddress, event.block)
  const remitter = getRemitter(moneyMakerAddress, event.params.server, event.block)

  const tokenToAddress = Address.fromString(moneyMaker.tokenRemittedAddress)
  const tokenToDecimals = moneyMaker.tokenRemittedDecimals
  const tokenAmount = event.params.amountTOKEN
    .toBigDecimal()
    .div(BigDecimal.fromString('1e' + tokenToDecimals.toString()))
  const tokenAmountUSD = tokenAmount.times(getUSDRate(tokenToAddress, event.block)).div(BIG_DECIMAL_1E12)

  const token0Contract = ERC20.bind(event.params.token0)
  const token0SymbolResult = token0Contract.try_symbol()
  const token0Symbol = token0SymbolResult.reverted ? '' : token0SymbolResult.value
  const token0DecimalsResult = token0Contract.try_decimals()
  const token0Decimals = token0DecimalsResult.reverted ? 1 : token0DecimalsResult.value

  const token1Contract = ERC20.bind(event.params.token1)
  const token1SymbolResult = token1Contract.try_symbol()
  const token1Symbol = token1SymbolResult.reverted ? '' : token1SymbolResult.value
  const token1DecimalsResult = token1Contract.try_decimals()
  const token1Decimals = token1DecimalsResult.reverted ? 1 : token1DecimalsResult.value

  const factoryContract = Factory.bind(FACTORY_ADDRESS)
  const pair = factoryContract.getPair(event.params.token0, event.params.token1)

  const id = pair.toHex().concat('-').concat(event.block.number.toString())
  let remit = new Remit(id)

  remit.moneyMaker = moneyMaker.id
  remit.remitter = remitter.id
  remit.tx = event.transaction.hash
  remit.token0 = event.params.token0
  remit.token1 = event.params.token1
  remit.token0Symbol = token0Symbol
  remit.token1Symbol = token1Symbol
  remit.amount0 = event.params.amount0.toBigDecimal().div(BigDecimal.fromString('1e' + token0Decimals.toString()))
  remit.amount1 = event.params.amount1.toBigDecimal().div(BigDecimal.fromString('1e' + token1Decimals.toString()))
  remit.tokenRemitted = tokenAmount
  remit.usdRemitted = tokenAmountUSD
  remit.block = event.block.number
  remit.timestamp = event.block.timestamp
  remit.save()

  const dayData = getDayData(event.block)
  dayData.tokenRemitted = dayData.tokenRemitted.plus(tokenAmount)
  dayData.usdRemitted = dayData.usdRemitted.plus(tokenAmountUSD)
  dayData.totalRemits = dayData.totalRemits.plus(BIG_INT_ONE)
  dayData.save()

  remit.dayData = dayData.id
  remit.save()

  moneyMaker.tokenRemitted = moneyMaker.tokenRemitted.plus(tokenAmount)
  moneyMaker.usdRemitted = moneyMaker.usdRemitted.plus(tokenAmountUSD)
  moneyMaker.totalRemits = moneyMaker.totalRemits.plus(BIG_INT_ONE)
  moneyMaker.save()

  remitter.tokenRemitted = remitter.tokenRemitted.plus(tokenAmount)
  remitter.usdRemitted = remitter.usdRemitted.plus(tokenAmountUSD)
  remitter.totalRemits = remitter.totalRemits.plus(BIG_INT_ONE)
  remitter.save()
}

export function handleSetTokenTo(event: SetTokenTo): void {
  const tokenToAddress = event.params._tokenTo
  log.info('handleSetTokenTo {}', [tokenToAddress.toHex()])
  const tokenToContract = ERC20.bind(tokenToAddress)
  const moneyMaker = getMoneyMaker(event.address, event.block)
  moneyMaker.tokenRemittedAddress = tokenToAddress.toHex()
  moneyMaker.tokenRemittedDecimals = getDecimals(tokenToContract)
  moneyMaker.usdRemitted = BIG_DECIMAL_ZERO
  moneyMaker.tokenRemitted = BIG_DECIMAL_ZERO
  moneyMaker.totalRemits = BIG_INT_ZERO
  moneyMaker.save()
}
