import { MoneyMaker } from '../../generated/schema'
import { MoneyMaker as MoneyMakerContract } from '../../generated/MoneyMaker/MoneyMaker'
import { ethereum, Address, BigInt } from '@graphprotocol/graph-ts'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, ADDRESS_ZERO } from 'const'
import { ERC20 } from '../../generated/MoneyMaker/ERC20'

export function getMoneyMaker(address: Address, block: ethereum.Block): MoneyMaker {
  const id = address.toHex()
  let maker = MoneyMaker.load(id)

  if (maker === null) {
    maker = new MoneyMaker(id)

    const moneyMakerContract = MoneyMakerContract.bind(address)
    const tokenToResult = moneyMakerContract.try_tokenTo()
    const tokenToAddress = tokenToResult.reverted ? ADDRESS_ZERO : tokenToResult.value
    const tokenToContract = ERC20.bind(tokenToAddress)
    const tokenToDecimals = getDecimals(tokenToContract)

    maker.tokenRemittedAddress = tokenToAddress.toHex()
    maker.tokenRemittedDecimals = tokenToDecimals
    maker.tokenRemitted = BIG_DECIMAL_ZERO
    maker.usdRemitted = BIG_DECIMAL_ZERO
    maker.totalRemits = BIG_INT_ZERO
  }
  maker.timestamp = block.timestamp
  maker.block = block.number

  maker.save()
  return maker as MoneyMaker
}

export function getDecimals(contract: ERC20): BigInt {
  // try types uint8 for decimals
  let decimalValue = null

  const decimalResult = contract.try_decimals()

  if (!decimalResult.reverted) {
    decimalValue = decimalResult.value
  }

  return BigInt.fromI32(decimalValue as i32)
}
