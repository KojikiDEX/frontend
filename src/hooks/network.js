import ic_base from "../assets/img/networks/base.png";

export const supportNetwork = {
  8453: {
    name: "BASE Mainnet",
    chainId: 8453,
    rpc: "https://base-mainnet.blastapi.io/b5a802d8-151d-4443-90a7-699108dc4e01",
    image: ic_base,
    symbol: "ETH",
  },
  84531: {
    name: "BASE Testnet",
    chainId: 84531,
    rpc: "https://base-goerli.blastapi.io/b5a802d8-151d-4443-90a7-699108dc4e01",
    image: ic_base,
    symbol: "ETH",
  },
};

export const RPC_URLS = {
  8453: "https://base-mainnet.blastapi.io/b5a802d8-151d-4443-90a7-699108dc4e01",
  84531: "https://base-goerli.blastapi.io/b5a802d8-151d-4443-90a7-699108dc4e01",
};
