import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { WalletLinkConnector } from "@web3-react/walletlink-connector";
import Web3 from "web3";
import { supportNetwork, RPC_URLS } from "./network";

// export const CHAIN_ID = process.env.NODE_ENV === "development" ? 84531 : 8453;
export const CHAIN_ID = 84531;

export const APP_PUBLIC_URL = "https://test.kojiki.exchange";
export const ADMIN_ACCOUNT = "0xAdFd55f485e16D9d4127C8e00a1700B10f10ACf4";
export const ADMIN_ACCOUNT1 = "0xA8B3Ee1B617DfE88DB8819235d9A4c33C0cb3416";

export const MIN_DAYS = 15;
export const MAX_DAYS = 180;

export const XSake_DECIMALS = 18;
export const PAIR_DECIMALS = 18;
export const SAKE_DECIMALS = 18;
export const USDC_DECIMALS = 6;
export const ETH_DECIMALS = 18;
export const LP_DECIMALS = 18;

export const REFETCH_INTERVAL = 30000;

export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

export const SCAN_URL = {
  84531: "https://goerli.basescan.org/",
  8453: "https://basescan.org/",
};
export const INFURA_ID = "46A4NvXzd1HLfXTECJaiNJH1lwudqoPb";

export const getRpcUrl = () => {
  return {
    8453: "https://base-mainnet.blastapi.io/b5a802d8-151d-4443-90a7-699108dc4e01",
    84531:
      "https://base-goerli.blastapi.io/b5a802d8-151d-4443-90a7-699108dc4e01",
  }[CHAIN_ID];
};

export const getWeb3 = () => {
  let setRpc = supportNetwork[CHAIN_ID].rpc;
  return new Web3(setRpc);
};

export const supportChainId = Object.keys(supportNetwork).map(function (key) {
  return parseInt(key);
});

export const injected = new InjectedConnector({
  supportedChainIds: supportChainId,
});

export const walletconnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  qrcode: true,
  infuraId: INFURA_ID,
});

export const coinbaseWallet = new WalletLinkConnector({
  url: getRpcUrl(),
  appName: "Kojiki",
  supportedChainIds: supportChainId,
});
