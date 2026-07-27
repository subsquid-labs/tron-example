# tron-example

This project shows how one can index TRC-20 transfers using Subsquid SDK.


## Accessing the SQD Network gateway

This squid sources historical data from the SQD Network v2 gateway
(`https://v2.archive.subsquid.io/network/tron-mainnet`). Since May 19, 2026, **self-hosted** squids need an
API key to access these gateways (see [SQD API keys](https://docs.sqd.dev/en/data/api-keys)):

1. Create a key at [portal.sqd.dev/app](https://portal.sqd.dev/app).
2. Add it to `.env`: `SQD_API_KEY=your_api_key`.
3. Pass it to the `.setGateway(...)` call in `src/main.ts`:

   ```ts
   .setGateway({
       url: 'https://v2.archive.subsquid.io/network/tron-mainnet',
       apiKey: process.env.SQD_API_KEY,
   })
   ```

Squids deployed to [SQD Cloud](https://docs.sqd.dev/en/cloud/overview) don't need this — the
platform provides gateway access.

## Getting started

### Prerequisites

* Node.js (version 20.x and above)
* Docker

### Run indexer

```bash
# Install dependencies
npm i

# Compile the project
npx tsc

# Launch Postgres database to store the data
docker compose up -d

# Apply database migrations to create the target schema
npx squid-typeorm-migration apply

# Run indexer
node -r dotenv/config lib/main.js

# Run the indexer GraphQL API in a separate terminal window
npx squid-graphql-server
```

If the commands from above were successful then http://localhost:4000/graphql will be available for exploration.

For further details, please consult heavily commented [main.ts](./src/main.ts).

## Decoding binary data

`@subsquid/evm-typegen` package allows to easily generate fast and type-safe codec for Tron data.

[abi](./src/abi) module gives an example of how that look like.
