## Why Hardhat?

I chose Hardhat for this project because:

- Developer ergonomics: JavaScript/TypeScript based toolchain that integrates naturally with Node/Next stacks you already use.

- Powerful local network: Built-in Hardhat Network lets you spin up a local chain, debug transactions, and do console logging inside Solidity tests.

- Rich plugin ecosystem: Hardhat Toolbox, Ethers plugin, Waffle/Chai, Etherscan verification, solidity-coverage, gas-reporter, etc.

- Testing & scripting: Easy to write JS/TS deployment scripts and tests; good for CI integration.

- Flexible: Good support for forking mainnet, simulating conditions, and fast iteration.

Alternatives (Foundry, Truffle, Remix) are excellent too (Foundry is extremely fast and great for advanced users), but Hardhat is the sweet spot for an end-to-end JS/TS web3 stack that pairs with your Next.js frontend.

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

## Why not Foundry / Truffle / Remix? (short comparison)

### Foundry

- Pros: Very fast tests, native solidity testing, powerful CLI.

- Cons: Rust-based tooling, learning curve if you are JS-first; integration with some JS frameworks requires extra steps.

- When to pick: If you want maximum speed and love Solidity-first testing.

### Truffle

- Pros: Mature, historically popular.

- Cons: Less modern DX compared to Hardhat, plugin ecosystem not as active.

### Remix

- Pros: Great for quick experiments and small deployments (browser or desktop).

- Cons: Not ideal for production-grade scripting, tests, CI, or automation.

Hardhat sits in the middle: JS-friendly, great plugin system, excellent debugging — perfect for a full-stack web3 app with Next.js.

```shell
/contracts                # Solidity contracts
/scripts                  # Deployment & helper scripts
/test                     # JS/TS tests (mocha + chai)
/hardhat.config.js        # Hardhat configuration
/package.json
/.env                     # Environment variables (not committed)
/frontend                 # Next.js frontend (optional)
/deployments              # Optional: saved deployed addresses
```


### Project start
```shell
# create a file
mkdir file_name

# initialize project if not done
npm init -y

# install hardhat + toolbox + dotenv
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

# create hardhat environment
npx hardhat init

```


## Test
```shell
npx hardhat [file_path]

# for nested file
npx hardhat folder_name --grep "file_name"
```


## Copy this project

```shell
## clone the git project
git clone https://github.com/Omarfaruk05/hardhat-testing.git

# in project root (where package.json is)
npm install

# compile
npx hardhat compile

# run local tests
npx hardhat test --grep "Lock"

```
