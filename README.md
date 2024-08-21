# @lightlink-network/ll-sdk

> [!NOTE]
> The SDK was originally forked from the [Optimism SDK](https://www.npmjs.com/package/@eth-optimism/sdk) and has been modified to work with the LightLink network.

The LightLink SDK provides a simple interface to interact with the LightLink Native Bridge and Cross Chain Messenger.

## Installation

```bash
npm install @lightlink-network/ll-sdk
```

## Usage

The SDK can be used to interact with the LightLink network Native Bridge in a few simple steps.

```typescript
import {
  CrossChainMessenger,
  L1ChainID,
  L2ChainID,
  MessageStatus,
} from '@lightlink-network/ll-sdk'
import { ethers } from 'ethers'

const l1Provider = new ethers.providers.StaticJsonRpcProvider(
  process.env.L1_RPC_URL!
)
const l2Provider = new ethers.providers.StaticJsonRpcProvider(
  process.env.L2_RPC_URL!
)
const l1Wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, l1Provider)
const l2Wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, l2Provider)

const messenger = new CrossChainMessenger({
  l1SignerOrProvider: l1Wallet,
  l2SignerOrProvider: l2Wallet,
  l1ChainId: L1ChainID.SEPOLIA,
  l2ChainId: L2ChainID.LIGHTLINK_PEGASUS,
  lightlink: true,
})

async function main() {
  // DepositETH is a simple one step process.
  let tx = await messenger.depositETH(ethers.utils.parseEther('0.001'))
  await tx.wait()

  // WithdrawETH is a three step process over a period of at least 7 days.

  // Step 1: Withdraw ETH from L2 to L1
  let tx = await messenger.withdrawETH(ethers.utils.parseEther('0.001'))
  await tx.wait()

  // Step 2: Prove the withdrawal on L1
  tx = await messenger.proveMessage(tx.hash)
  await tx.wait()

  // Step 3: Finalize the withdrawal on L1
  tx = await messenger.finalizeMessage(tx.hash)
  await tx.wait()

  // A message status can be checked. This can be useful for checking if
  // the next step in the withdrawal process is ready. i.e. READY_TO_PROVE
  let status = await messenger.getMessageStatus(tx.hash)
  if (status === MessageStatus.READY_TO_PROVE) {
    console.log('Withdrawal is ready to be proven!')
  }

  // Optionally, you can wait for a message to reach a certain status.
  // This can be useful for waiting for a deposit to be relayed by the
  // sequencer (12 confirmations).
  await messenger.waitForMessageStatus(tx.hash, MessageStatus.RELAYED)
}
```
