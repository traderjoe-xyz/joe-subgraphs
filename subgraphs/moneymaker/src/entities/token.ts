import { Token } from '../../generated/schema'
import { BigInt, Address } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../generated/MoneyMaker/ERC20'

export function getToken(address: Address): Token {
  const id = address.toHex()
  let token = Token.load(id)

  if (token === null) {
    const token = new Token(id)
    const tokenToContract = ERC20.bind(address)
    const symbolResult = tokenToContract.try_symbol()
    token.symbol = symbolResult.reverted ? 'unknown' : symbolResult.value
    token.decimals = getDecimals(tokenToContract)
    token.save()
  }

  token.save()

  return token as Token
}

function getDecimals(contract: ERC20): BigInt {
    // try types uint8 for decimals
    let decimalValue = null
  
    const decimalResult = contract.try_decimals()
  
    if (!decimalResult.reverted) {
      decimalValue = decimalResult.value
    }
  
    return BigInt.fromI32(decimalValue as i32)
  }