# 🏋️ Gym Coin — Decentralized Gym Credit System

A blockchain-based credit token system for a network of fitness centers, built on Ethereum. Users can buy, sell, and transfer their gym credits across any branch in the network — all secured by smart contracts on the Sepolia test network.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c84819c2-c7a6-488f-82e7-bf01529ba3ce" />
<img width="1920" height="1080" alt="screen" src="https://github.com/user-attachments/assets/097b7784-b468-44e5-9365-928cd3fbb684" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bd193386-9f89-4234-afbf-cb74a5199ee8" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bbb56136-9b6d-407e-84f8-50200ac1167a" />



---

## 📖 Overview

Imagine a fitness network with multiple locations where customers want a unified "Gym Anywhere" experience. Traditional banking infrastructure can be slow, expensive, or unreliable for managing internal credits. **Gym Coin (GC)** solves this by replacing the credit system with a custom ERC-20 token that lives on the blockchain.

The system gives users:
- 🌍 **Freedom** to use credits at any branch in the network kama683
- 🔍 **Transparency** — every transaction is publicly verifiable
- 🔐 **Security** — no one, not even the gym owner, can tamper with balances
- 💱 **Flexibility** — users can buy, sell, or transfer credits anytime

---

## ✨ Features

### Smart Contracts
- ✅ **ERC-20 standard token** (Gym Coin / GC) inheriting from OpenZeppelin
- ✅ **User registration** with username, email, and wallet address
- ✅ **Buy GC** with ETH at a configurable rate
- ✅ **Sell GC** back to the contract for ETH
- ✅ **Transfer GC** between users
- ✅ **Owner-only rate updates** with `onlyOwner` access control
- ✅ Edge-case handling (insufficient balance, unauthorized access, etc.)

### Frontend
- 🎨 Modern dark-themed UI with gradient accents
- 🦊 MetaMask wallet integration
- 👤 User profile view (username, email, wallet address)
- 💰 Live balance display (GC and ETH)
- 📈 Real-time exchange rates
- 🛒 Buy / Sell / Transfer interfaces with input validation
- 🛡️ Owner Panel for managing exchange rates
- 📜 Transaction history with Etherscan links
- 📋 One-click address copy
- 📱 QR code for receiving GC
- 🔔 Toast notifications with transaction links
- 📐 Fully responsive design

---


> 📁 Place all screenshots in the `/screenshots/` folder at the project root.

---

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** `^0.8.20` — smart contract language
- **OpenZeppelin Contracts** — battle-tested ERC-20 and Ownable implementations
- **Hardhat** — development environment for compiling, testing, and deploying

### Frontend
- **React 18** — UI framework
- **Vite** — build tool
- **ethers.js v6** — Ethereum library for blockchain interaction
- **lucide-react** — icon library
- **qrcode.react** — QR code generation

### Infrastructure
- **Sepolia Test Network** — Ethereum test network for deployment
- **MetaMask** — wallet for transaction signing
- **Infura / MetaMask Developer** — RPC provider

---

## 🏗️ Architecture

```
┌──────────────┐         ┌──────────────┐         ┌──────────────────┐
│   Browser    │ ──────► │   MetaMask   │ ──────► │  Sepolia Network │
│ React + UI   │         │    Wallet    │         │                  │
│              │ ◄────── │              │ ◄────── │  Smart Contracts │
└──────────────┘         └──────────────┘         └──────────────────┘
        │                                                   ▲
        └─────────────── ethers.js ─────────────────────────┘
```

The frontend communicates with the deployed smart contracts via `ethers.js`, while MetaMask handles transaction signing and account management.

---

## 📂 Project Structure

```
gym-coin-project/
├── contracts-backend/          # Smart contract project
│   ├── contracts/
│   │   ├── UserProfile.sol     # User registration contract
│   │   └── GymCoin.sol         # ERC-20 Gym Coin token
│   ├── scripts/
│   │   └── deploy.js           # Deployment script
│   ├── test/                   # Automated tests
│   ├── hardhat.config.js
│   └── package.json
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── contracts/          # ABIs and addresses
│   │   ├── hooks/
│   │   │   └── useWallet.js    # MetaMask connection logic
│   │   ├── App.jsx             # Main UI
│   │   └── App.css             # Styles
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/                # README images
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MetaMask** browser extension
- A wallet funded with Sepolia test ETH ([get free ETH](https://sepoliafaucet.com))
- An RPC URL from [Infura](https://infura.io) or [Alchemy](https://alchemy.com)

### 1. Clone the Repository

```bash
git clone https://github.com/kama683/gym-coin-project.git
cd gym-coin-project
```

### 2. Backend Setup (Smart Contracts)

```bash
cd contracts-backend
npm install
```

Create a `.env` file:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_metamask_private_key_without_0x
```

Compile the contracts:

```bash
npx hardhat compile
```

Run tests:

```bash
npx hardhat test
```

Deploy to Sepolia:

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

Save the deployed contract addresses — you'll need them in the next step.

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Update `src/contracts/addresses.js` with your deployed contract addresses:

```javascript
export const GYM_COIN_ADDRESS = "0xYourGymCoinAddress";
export const USER_PROFILE_ADDRESS = "0xYourUserProfileAddress";
```

Copy the compiled ABIs from the backend to the frontend:

```bash
# From the project root
cp contracts-backend/artifacts/contracts/GymCoin.sol/GymCoin.json frontend/src/contracts/
cp contracts-backend/artifacts/contracts/UserProfile.sol/UserProfile.json frontend/src/contracts/
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Connect MetaMask
1. Switch your MetaMask network to **Sepolia**
2. Click **Connect MetaMask** on the website
3. Register your profile
4. Buy, sell, and transfer GC!

---

## 📝 Smart Contract Functions

### `UserProfile.sol`

| Function | Description | Access |
|---|---|---|
| `registerUser(username, email)` | Register a new user profile | Public |
| `getUser(address)` | Retrieve user info by address | Public view |
| `isRegistered(address)` | Check if address is registered | Public view |

### `GymCoin.sol`

| Function | Description | Access |
|---|---|---|
| `buy(gcAmount)` | Buy GC with ETH at the current `sellRate` | Public payable |
| `sell(gcAmount)` | Sell GC back for ETH at the current `buyRate` | Public |
| `transfer(to, amount)` | Transfer GC to another address (ERC-20 standard) | Public |
| `setRates(sellRate, buyRate)` | Update exchange rates | Owner only |
| `balanceOf(address)` | Get GC balance of an address | Public view |
| `sellRate()` | Current rate: GC per 1 ETH (when buying) | Public view |
| `buyRate()` | Current rate: GC needed for 1 ETH (when selling) | Public view |

---

## 🔒 Security Considerations

- ✅ Used **OpenZeppelin's audited ERC-20 implementation** instead of writing from scratch
- ✅ `onlyOwner` modifier protects rate updates from unauthorized access
- ✅ Input validation with `require()` statements throughout the contract
- ✅ Checks for sufficient balances before all operations
- ✅ Rejects invalid ETH amounts during purchases
- ✅ Prevents duplicate user registrations
- ⚠️ **Test network only** — not audited for production use

---

## 🧪 Testing

Run the smart contract test suite:

```bash
cd contracts-backend
npx hardhat test
```

Tests cover:
- Initial token supply allocation
- Successful purchases and sales
- Token transfers between users
- Access control on `setRates`
- Validation of incorrect ETH amounts
- Duplicate registration prevention

---

## 🌐 Deployed Contracts

> Replace these with your actual deployed addresses

- **GymCoin:** [`0xYourAddress`](https://sepolia.etherscan.io/address/0xYourAddress)
- **UserProfile:** [`0xYourAddress`](https://sepolia.etherscan.io/address/0xYourAddress)
- **Network:** Sepolia Testnet (Chain ID: `11155111`)

---

## 🎯 Future Improvements

- 🏅 **Loyalty system** — earn GC for gym check-ins via QR code
- 💎 **Staking** — lock GC to earn rewards over time
- 🎟️ **NFT memberships** — premium tier benefits as ERC-721 tokens
- 📊 **Analytics dashboard** — top holders, transaction volume, price history
- 🌍 **Multi-language support**
- 📱 **Mobile-first PWA**

---

## 🐛 Known Limitations

- The `sell` function only works after the contract has accumulated ETH from purchases
- Transaction history is limited to the last 10,000 blocks for performance
- All amounts are limited to 18 decimal precision (standard ERC-20)

---

## 👥 Authors

This project was developed as a final project for the Blockchain course.

| Name | Student ID |
|---|---|
| **Kamron Yunussaliyev** | 230103293 |
| **Abylkanov Ansat** | 230103172 |

---

## 📜 License

This project is created for educational purposes.

---

## 🙏 Acknowledgments

- [OpenZeppelin](https://www.openzeppelin.com/) — for the audited ERC-20 contract implementation
- [Hardhat](https://hardhat.org/) — for the smart contract development framework
- [MetaMask](https://metamask.io/) — for the wallet integration
- [ethers.js](https://docs.ethers.org/) — for blockchain interaction
- [lucide-react](https://lucide.dev/) — for the icon library

---

<p align="center">Built with ❤️ on Ethereum</p>
