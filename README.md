# Etherlink Token Deployer

A simple application to deploy tokens on the Etherlink Mainnet and Testnet.

## App

[https://etherlink-token-deployer.onrender.com/](https://etherlink-token-deployer.onrender.com/)

## Features

- Connect your wallet.
- Deploy standard ERC20 tokens.
- Support for Etherlink Mainnet and Testnet.

## Development

This project is split into two main parts:

- `contracts/`: The Hardhat project for the smart contracts.
- `frontend/`: The React application for the user interface.

To run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

To work with the contracts:

```bash
cd contracts
npm install
npx hardhat --help
```
