# Makefile for BatchTransfer Smart Contract

# Load environment variables
include .env
export

# Default target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  install     - Install dependencies"
	@echo "  build       - Build contracts"
	@echo "  test        - Run tests"
	@echo "  test-gas    - Run tests with gas reporting"
	@echo "  clean       - Clean build artifacts"
	@echo "  deploy-sepolia - Deploy to Sepolia testnet"
	@echo "  deploy-mainnet - Deploy to mainnet"
	@echo "  deploy-tenderly - Deploy to Tenderly virtual network"
	@echo "  verify-sepolia - Verify contract on Sepolia"
	@echo "  verify-mainnet - Verify contract on mainnet"
	@echo "  verify-tenderly - Verify deployment on Tenderly"

# Install dependencies
.PHONY: install
install:
	forge install foundry-rs/forge-std
	forge install OpenZeppelin/openzeppelin-contracts

# Build contracts
.PHONY: build
build:
	forge build

# Run tests
.PHONY: test
test:
	forge test -vvv

# Run tests with gas reporting
.PHONY: test-gas
test-gas:
	forge test --gas-report

# Clean build artifacts
.PHONY: clean
clean:
	forge clean

# Deploy to Sepolia testnet
.PHONY: deploy-sepolia
deploy-sepolia:
	forge script script/Deploy.s.sol:DeployScript --rpc-url $(SEPOLIA_RPC_URL) --broadcast --verify

# Deploy to mainnet
.PHONY: deploy-mainnet
deploy-mainnet:
	forge script script/Deploy.s.sol:DeployScript --rpc-url $(MAINNET_RPC_URL) --broadcast --verify

# Verify contract on Sepolia
.PHONY: verify-sepolia
verify-sepolia:
	forge verify-contract $(BATCH_TRANSFER_ADDRESS_SEPOLIA) src/BatchTransfer.sol:BatchTransfer --chain sepolia

# Verify contract on mainnet
.PHONY: verify-mainnet
verify-mainnet:
	forge verify-contract $(BATCH_TRANSFER_ADDRESS_MAINNET) src/BatchTransfer.sol:BatchTransfer --chain mainnet

# Deploy to Tenderly virtual network
.PHONY: deploy-tenderly
deploy-tenderly:
	forge script script/Deploy.s.sol:DeployScript --rpc-url $(TENDERLY_RPC_URL) --broadcast --private-key $(PRIVATE_KEY)

# Verify deployment on Tenderly
.PHONY: verify-tenderly
verify-tenderly:
	cast call $(BATCH_TRANSFER_ADDRESS_TENDERLY) "MAX_RECIPIENTS()" --rpc-url $(TENDERLY_RPC_URL)
	cast call $(BATCH_TRANSFER_ADDRESS_TENDERLY) "totalTransactions()" --rpc-url $(TENDERLY_RPC_URL)

# Format code
.PHONY: format
format:
	forge fmt

# Check code formatting
.PHONY: format-check
format-check:
	forge fmt --check

# Run static analysis
.PHONY: analyze
analyze:
	forge analyze

# Generate documentation
.PHONY: docs
docs:
	forge doc