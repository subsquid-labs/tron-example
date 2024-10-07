# tron-example

This project shows how one can index TRC-20 transfers using Subsquid SDK.

## Getting started

### Prerequisites

* Node.js (version 20.x and above)
* Docker

### Run indexer

```bash
# Install dependencies
npm ci

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
