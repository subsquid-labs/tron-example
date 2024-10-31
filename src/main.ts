import {TronBatchProcessor} from '@subsquid/tron-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import assert from 'assert'
import * as erc20 from './evmAbi/erc20'
import {Transfer} from './model'
import { TronWeb } from 'tronweb'
import * as tfa from 'tron-format-address'
// JSON ABIs of contracts are necessary for querying the contract state
// On Tron, these can be downloaded from Tronscan contract pages ("Contract" tab, scroll to the bottom)
// Just copying the ABI to clipboard and pasting it to a file is the safest way to extract these
import usdtJsonAbi from './tronAbi/usdt.json'

const TRON_HTTP_API_URL = 'https://rpc.ankr.com/http/tron'
// A private key is necessary to instantiate TronWeb and make calls to contracts (inc readonly calls)
const TRON_PRIVATE_KEY = '1'.repeat(64) // if your squid doesn't send txs, almost any 64 hex digits work here


const USDT_ADDRESS_TRON = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
// Similar to the Tron HTTP API, Tron SQD SDK uses hex format without the leading 0x for addresses
const USDT_ADDRESS_HEX = tfa.toHex(USDT_ADDRESS_TRON).slice(2)


// Keccak of 'Transfer(address,address,uint256)' is available from SQD's EVM ERC20 module
// See https://docs.sqd.dev/sdk/resources/tools/typegen/generation/ to learn more
// Removing the leading 0x
const TRANSFER_TOPIC = erc20.events.Transfer.topic.slice(2)


const processor = new TronBatchProcessor()
    // Provide Subsquid Network Gateway URL.
    .setGateway('https://v2.archive.subsquid.io/network/tron-mainnet')
    // Subsquid Network is always about N blocks behind the head.
    // We must use regular HTTP API endpoint to get through the last mile
    // and stay on top of the chain.
    // This is a limitation, and we promise to lift it in the future!
    .setHttpApi({
        // ankr public endpoint is heavily rate-limited so expect many 429 errors
        url: TRON_HTTP_API_URL,
        strideConcurrency: 1,
        strideSize: 1,
    })
    // Block data returned by the data source has the following structure:
    //
    // interface Block {
    //     header: BlockHeader
    //     transactions: Transaction[]
    //     logs: Log[]
    //     internalTransactions: InternalTransaction[]
    // }
    //
    // For each block item we can specify a set of fields we want to fetch via `.setFields()` method.
    // Think about it as of SQL projection.
    //
    // Accurate selection of only required fields can have a notable positive impact
    // on performance when data is sourced from Subsquid Network.
    //
    // We do it below only for illustration as all fields we've selected
    // are fetched by default.
    //
    // It is possible to override default selection by setting undesired fields to `false`.
    .setFields({
        block: {
            timestamp: true,
        },
        transaction: {
            hash: true,
        },
        log: {
            address: true,
            data: true,
            topics: true
        }
    })
    // By default, block can be skipped if it doesn't contain explicitly requested items.
    //
    // We request items via `.addXxx()` methods.
    //
    // Each `.addXxx()` method accepts item selection criteria
    // and also allows to request related items.
    //
    .addLog({
        // select logs
        where: {
            address: [USDT_ADDRESS_HEX],
            topic0: [TRANSFER_TOPIC]
        },
        // for each log selected above
        // make processor to load related transactions
        include: {
            transaction: true
        }
    })
    .setBlockRange({
        from: 8418292
    })


const tronWeb = new TronWeb({
    fullHost: TRON_HTTP_API_URL,
    privateKey: TRON_PRIVATE_KEY
})


processor.run(new TypeormDatabase(), async ctx => {
   let transfers: Transfer[] = []

    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address == USDT_ADDRESS_HEX && log.topics?.[0] === TRANSFER_TOPIC) {
                assert(log.data, 'USDT transfers always carry data')
                let tx = log.getTransaction()
                // `0x` prefixes make log data compatible with evm codec
                let event = {
                    topics: log.topics.map(t => '0x' + t),
                    data: '0x' + log.data
                }
                let {from, to, value} = erc20.events.Transfer.decode(event)

                transfers.push(new Transfer({
                    id: log.id,
                    blockNumber: block.header.height,
                    timestamp: new Date(block.header.timestamp),
                    tx: tx.hash,
                    // EVM decoder returns address strings with 0x, which is the hex format that tron-format-address understands
                    from: tfa.fromHex(from),
                    to: tfa.fromHex(to),
                    amount: value
                }))
            }
        }


        // Suppose we would like to display the most recent balances of all transfer receivers
        // specifically via state calls
        const contract = tronWeb.contract(usdtJsonAbi, USDT_ADDRESS_TRON) // note that the address used here is in base58, not in hex
        for (let { to } of transfers) {
            const balance = await contract.balanceOf(to).call() // again, the "to" address here is in base58
            ctx.log.info(`There were USDT transfers to ${to} at block ${block.header.height} - it's balance _at the chain head_ is ${balance}`)
        }
        // Unfortunately both the HTTP and the EVM-compatible JSON API of Tron
        // do not allow querying the chain at arbitrary height
    }

    await ctx.store.insert(transfers)
})
