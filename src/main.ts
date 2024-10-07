import {TronBatchProcessor} from '@subsquid/tron-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import assert from 'assert'
import * as erc20 from './abi/erc20'
import {Transfer} from './model'


const USDT_ADDRESS = 'a614f803b6fd780986a42c78ec9c7f77e6ded13c'
const TRANSFER_TOPIC = 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'


const processor = new TronBatchProcessor()
    // Provide Subsquid Network Gateway URL.
    .setGateway('https://v2.archive.subsquid.io/network/tron-mainnet')
    // Subsquid Network is always about N blocks behind the head.
    // We must use regular HTTP API endpoint to get through the last mile
    // and stay on top of the chain.
    // This is a limitation, and we promise to lift it in the future!
    .setHttpApi({
        // ankr public endpoint is heavily rate-limited so expect many 429 errors
        url: 'https://rpc.ankr.com/http/tron',
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
            address: [USDT_ADDRESS],
            topic0: [TRANSFER_TOPIC]
        },
        // for each log selected above
        // make processor to load related transactions
        include: {
            transaction: true
        }
    })


processor.run(new TypeormDatabase(), async ctx => {
    let transfers: Transfer[] = []

    for (let block of ctx.blocks) {
        for (let log of block.logs) {
            if (log.address == USDT_ADDRESS && log.topics?.[0] === TRANSFER_TOPIC) {
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
                    from,
                    to,
                    amount: value
                }))
            }
        }
    }

    await ctx.store.insert(transfers)
})
