# tron-example

This project shows how one can index TRC-20 transfers using Subsquid SDK.


## Data sources

This squid sources finalized historical data from the public [SQD Portal](https://docs.sqd.dev/en/portal/overview)
(`https://portal.sqd.dev/datasets/tron-mainnet`) and blocks above the Portal's head from a
TRON HTTP API endpoint. Migrating an older squid from the v2 gateway (`.setGateway(...)`)? See the
[Portal migration guide](https://docs.sqd.dev/en/sdk/squid-sdk/tron/guides/migration/gateway-to-portal).

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
