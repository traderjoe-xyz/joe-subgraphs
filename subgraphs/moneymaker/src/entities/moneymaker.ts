import { MoneyMaker } from '../../generated/schema'
import { MoneyMaker as MoneyMakerContract } from '../../generated/MoneyMaker/MoneyMaker'
import { ethereum, Address } from '@graphprotocol/graph-ts'
import { getToken } from '../entities'
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO, ADDRESS_ZERO } from 'const'

export function getMoneyMaker(address: Address, block: ethereum.Block): MoneyMaker {
  const id = address.toHex()
  let maker = MoneyMaker.load(id)

  if (maker === null) {
    maker = new MoneyMaker(id)

    const moneyMakerContract = MoneyMakerContract.bind(address)
    const tokenToResult = moneyMakerContract.try_tokenTo()
    const tokenToAddress = tokenToResult.reverted ? ADDRESS_ZERO : tokenToResult.value
    const tokenTo = getToken(tokenToAddress)

    maker.tokenTo = tokenTo.id
    maker.tokenRemitted = BIG_DECIMAL_ZERO
    maker.usdRemitted = BIG_DECIMAL_ZERO
    maker.totalRemits = BIG_INT_ZERO
  }
  maker.timestamp = block.timestamp
  maker.block = block.number

  maker.save()
  return maker as MoneyMaker
}
