import { expect } from '../test/setup'
import { ethers } from 'hardhat'
import type { CrossChainMessage } from '../src'
import {
  CONTRACT_ADDRESSES,
  CrossChainMessenger,
  ETHBridgeAdapter,
  IGNORABLE_CONTRACTS,
  L1ChainID,
  L2ChainID,
  MessageDirection,
  MessageStatus,
  omit,
  StandardBridgeAdapter,
} from '../src'

describe('TestLiveLLFlow', () => {
  let l1Provider: any
  let l2Provider: any
  let l1Wallet: any
  let l2Wallet: any
  let messenger: CrossChainMessenger
  before(async () => {
    l1Provider = new ethers.providers.StaticJsonRpcProvider(
      process.env.L1_PROVIDER
    )
    l2Provider = new ethers.providers.StaticJsonRpcProvider(
      process.env.L2_PROVIDER
    )
    l1Wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, l1Provider)
    l2Wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, l2Provider)
    messenger = new CrossChainMessenger({
      lightlink: true,
      l1SignerOrProvider: l1Wallet,
      l2SignerOrProvider: l2Wallet,
      l1ChainId: L1ChainID.SEPOLIA,
      l2ChainId: L2ChainID.LIGHTLINK_PEGASUS,
    })
  })

  // Make a deposit and check its status is RELAYED
  it('balance should be incremented on L2', async () => {
    let initialL2Balance = await l2Wallet.getBalance()

    let tx = await messenger.depositETH(ethers.utils.parseEther('0.001'))
    await tx.wait()

    await messenger.waitForMessageStatus(tx.hash, MessageStatus.RELAYED)

    let finalL2Balance = await l2Wallet.getBalance()

    expect(finalL2Balance).to.equal(
      initialL2Balance.add(ethers.utils.parseEther('0.001'))
    )
  })

  // // Make an ETH withdrawal and check its status is STATE_ROOT_NOT_PUBLISHED
  // it('withdrawal should be proven on L1', async () => {
  //   let initialL2Balance = await l2Wallet.getBalance()

  //   let tx = await messenger.withdrawETH(ethers.utils.parseEther('0.0001'))
  //   await tx.wait()

  //   let finalL2Balance = await l2Wallet.getBalance()

  //   expect(finalL2Balance).to.equal(
  //     initialL2Balance.sub(ethers.utils.parseEther('0.0001'))
  //   )

  //   const depositStatus = await messenger.getMessageStatus(tx.hash, 0)
  //   expect(depositStatus).to.equal(MessageStatus.STATE_ROOT_NOT_PUBLISHED)
  // })

  // // Prove the withdrawal when its status is READY_TO_PROVE
  // it('withdrawal should be proven on L1', async () => {
  //   let withdrawalTx =
  //     '0x359e91617ef861cd05c776e91012c81cda72496082e8fde9ef4b5c13ae67231a'

  //   const withdrawalStatus = await messenger.getMessageStatus(withdrawalTx, 0)
  //   expect(withdrawalStatus).to.equal(MessageStatus.READY_TO_PROVE)

  //   await messenger.proveMessage(withdrawalTx)
  // })

  // // Finalize the withdrawal when its status is READY_FOR_RELAY
  // it('withdrawal should be proven on L1', async () => {
  //   let withdrawalTx =
  //     '0xf6fe62940f6d262c81cc21abbe03ff44e1c1bfe31da91a0d80298fb8ca32bb88'

  //   const withdrawalStatus = await messenger.getMessageStatus(withdrawalTx, 0)
  //   expect(withdrawalStatus).to.equal(MessageStatus.READY_FOR_RELAY)

  //   await messenger.finalizeMessage(withdrawalTx)
  // })
})
