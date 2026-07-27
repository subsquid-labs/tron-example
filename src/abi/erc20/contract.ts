import { ContractBase } from '../abi.support.js'
import { MAX_UINT, _totalSupply, allowance, approve, balanceOf, basisPointsRate, calcFee, decimals, decreaseApproval, deprecated, getBlackListStatus, increaseApproval, isBlackListed, maximumFee, name, oldBalanceOf, owner, paused, symbol, totalSupply, transfer, transferFrom, upgradedAddress } from './functions.js'
import type { AllowanceParams, ApproveParams, BalanceOfParams, CalcFeeParams, DecreaseApprovalParams, GetBlackListStatusParams, IncreaseApprovalParams, IsBlackListedParams, OldBalanceOfParams, TransferFromParams, TransferParams } from './functions.js'

export class Contract extends ContractBase {
    name() {
        return this.eth_call(name, {})
    }

    approve(_spender: ApproveParams["_spender"], _value: ApproveParams["_value"]) {
        return this.eth_call(approve, {_spender, _value})
    }

    deprecated() {
        return this.eth_call(deprecated, {})
    }

    totalSupply() {
        return this.eth_call(totalSupply, {})
    }

    transferFrom(_from: TransferFromParams["_from"], _to: TransferFromParams["_to"], _value: TransferFromParams["_value"]) {
        return this.eth_call(transferFrom, {_from, _to, _value})
    }

    upgradedAddress() {
        return this.eth_call(upgradedAddress, {})
    }

    decimals() {
        return this.eth_call(decimals, {})
    }

    maximumFee() {
        return this.eth_call(maximumFee, {})
    }

    _totalSupply() {
        return this.eth_call(_totalSupply, {})
    }

    getBlackListStatus(_maker: GetBlackListStatusParams["_maker"]) {
        return this.eth_call(getBlackListStatus, {_maker})
    }

    paused() {
        return this.eth_call(paused, {})
    }

    decreaseApproval(_spender: DecreaseApprovalParams["_spender"], _subtractedValue: DecreaseApprovalParams["_subtractedValue"]) {
        return this.eth_call(decreaseApproval, {_spender, _subtractedValue})
    }

    balanceOf(who: BalanceOfParams["who"]) {
        return this.eth_call(balanceOf, {who})
    }

    calcFee(_value: CalcFeeParams["_value"]) {
        return this.eth_call(calcFee, {_value})
    }

    owner() {
        return this.eth_call(owner, {})
    }

    symbol() {
        return this.eth_call(symbol, {})
    }

    transfer(_to: TransferParams["_to"], _value: TransferParams["_value"]) {
        return this.eth_call(transfer, {_to, _value})
    }

    oldBalanceOf(who: OldBalanceOfParams["who"]) {
        return this.eth_call(oldBalanceOf, {who})
    }

    increaseApproval(_spender: IncreaseApprovalParams["_spender"], _addedValue: IncreaseApprovalParams["_addedValue"]) {
        return this.eth_call(increaseApproval, {_spender, _addedValue})
    }

    allowance(_owner: AllowanceParams["_owner"], _spender: AllowanceParams["_spender"]) {
        return this.eth_call(allowance, {_owner, _spender})
    }

    basisPointsRate() {
        return this.eth_call(basisPointsRate, {})
    }

    isBlackListed(_0: IsBlackListedParams["_0"]) {
        return this.eth_call(isBlackListed, {_0})
    }

    MAX_UINT() {
        return this.eth_call(MAX_UINT, {})
    }
}
