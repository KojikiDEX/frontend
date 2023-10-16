import React, { useEffect, useState } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import { NoEthereumProviderError } from "@web3-react/injected-connector";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  IconButton,
  Typography,
  MenuItem,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import {
  injected,
  walletconnect,
  coinbaseWallet,
  CHAIN_ID,
} from "../hooks/connectors";
import { trimAddress } from "../hooks/contractHelper";
import useEagerConnect from "../hooks/useWeb3";

import ic_base from "../assets/img/networks/base.png";
import ic_wrong from "../assets/img/networks/wrong.png";
import ic_metamask from "../assets/img/wallets/metamask-svg.png";
import ic_coinbase from "../assets/img/wallets/coinbase.png";
import ic_walletConnect from "../assets/img/wallets/walletconnect-svg.png";

export const Connect = function () {
  const context = useWeb3React();
  const { connector, account, chainId, activate, deactivate, error } = context;

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(!open);

  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = useState();
  useEagerConnect();
  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [activatingConnector, connector]);

  function getErrorMessage(error) {
    if (error instanceof NoEthereumProviderError) {
      return "Metamask not deteced";
    }

    deactivate(injected);
  }

  const activating = (connection) => connection === activatingConnector;
  const connected = (connection) => connection === connector;

  const switchNetwork = (networkid) => {
    try {
      // @ts-ignore
      window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${networkid.toString(16)}` }],
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <React.Fragment>
      <>
        {CHAIN_ID != chainId && chainId != undefined ? (
          <button
            type="button"
            className="danger-outline"
            onClick={() => {
              setActivatingConnector();
              switchNetwork(CHAIN_ID);
            }}
          >
            Wrong Network
          </button>
        ) : error ? (
          <button
            type="button"
            className="danger-outline"
            onClick={() => {
              setActivatingConnector();
            }}
          >
            {getErrorMessage(error)}
          </button>
        ) : (
          <>
            {connected(injected) ||
            connected(walletconnect) ||
            connected(coinbaseWallet) ? (
              <button
                type="button"
                className="primary-outline"
                onClick={() => {
                  setActivatingConnector();
                  deactivate(injected);
                  deactivate(walletconnect);
                  deactivate(coinbaseWallet);
                }}
              >
                {account && trimAddress(account)}
              </button>
            ) : (
              (!connected(injected) ||
                !connected(walletconnect) ||
                !connected(coinbaseWallet)) && (
                <button
                  type="button"
                  className="primary-outline interact-button"
                  // onClick={() => {
                  //   setOpen(!open);d
                  // }}
                >
                  {(activating(injected) ||
                    activating(walletconnect) ||
                    activating(coinbaseWallet)) && <>connecting...</>}
                  {(!activating(injected) ||
                    !activating(walletconnect) ||
                    !activating(coinbaseWallet)) && <>connect</>}
                </button>
              )
            )}
          </>
        )}
      </>

      <Dialog
        className="w-full max-w-[310px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={open}
        handler={handleOpen}
      >
        <DialogHeader className="justify-between pt-3 pb-2">
          <span className="text-kojiki-blue">connect wallet</span>
          <IconButton size="sm" variant="text" onClick={handleOpen}>
            <XMarkIcon strokeWidth={2} stroke="#80beff" className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="flex flex-col gap-3 p-3">
          <MenuItem
            className="flex items-center justify-center gap-3 border rounded-none  hover:border-kojiki-blue"
            onClick={() => {
              activate(injected);
              setOpen(false);
            }}
          >
            <img src={ic_metamask} alt="metamask" className="h-6 w-6" />
            <span>metamask</span>
          </MenuItem>
          <MenuItem
            className="flex items-center justify-center gap-3 border rounded-none  hover:border-kojiki-blue"
            onClick={() => {
              activate(coinbaseWallet);
              setOpen(false);
            }}
          >
            <img src={ic_coinbase} alt="coinbase" className="h-6 w-6" />
            <span>coinbase wallet</span>
          </MenuItem>
          <MenuItem
            className="flex items-center justify-center gap-3 border rounded-none hover:border-kojiki-blue"
            onClick={() => {
              activate(walletconnect);
              setOpen(false);
            }}
          >
            <img src={ic_walletConnect} alt="metamast" className="h-6 w-6" />
            <span>wallet connect</span>
          </MenuItem>
        </DialogBody>
      </Dialog>
    </React.Fragment>
  );
};

export default Connect;
