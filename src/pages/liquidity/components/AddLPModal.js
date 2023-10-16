import React, { useState, useContext, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { Dialog, DialogHeader, DialogBody } from "@material-tailwind/react";

import { getWeb3, CHAIN_ID, SCAN_URL } from "../../../hooks/connectors";
import {
  getWeb3Contract,
  MulticallContractWeb3,
  trimAddress,
} from "../../../hooks/contractHelper";
import { getLpTokens } from "../../../hooks/lpTokenHelper";

import { zeroAddress } from "../../../config/tokens";
import { contracts } from "../../../config/contracts";

import { TokenContext } from "../../../context/context";

import ERC20ABI from "../../../assets/abi/ERC20.json";
import LPABI from "../../../assets/abi/LP.json";
import FactoryABI from "../../../assets/abi/KojikiSwapFactory.json";

export default function AddLPModal(props) {
  const { openModal, handleModal } = props;

  const { account } = useWeb3React();

  const { tokens, setLpTokens } = useContext(TokenContext);

  const [tokenAddr1, setTokenAddr1] = useState("");
  const [tokenAddr2, setTokenAddr2] = useState("");

  const [tokenInfo1, setTokenInfo1] = useState({});
  const [tokenInfo2, setTokenInfo2] = useState({});

  const [lpTokenInfo, setLpTokenInfo] = useState({});

  const [importing, setImporting] = useState(false);

  const getTokenInfo = async (tokenAddr, setTokenInfo) => {
    let found = false;
    Object.keys(tokens).map((addr, i) => {
      if (addr.toLowerCase() === tokenAddr.toLowerCase()) {
        tokens[addr].unlisted = false;
        setTokenInfo(tokens[addr]);
        found = true;
      }
    });

    if (found) return true;

    try {
      const web3 = getWeb3();
      const checkSum = web3.utils.toChecksumAddress(tokenAddr);
      const addressCode = await web3.eth.getCode(tokenAddr);
      if (!checkSum || addressCode === "0x") {
        setTokenInfo({});
      } else {
        const tokenContract = getWeb3Contract(ERC20ABI, tokenAddr);

        const mc = MulticallContractWeb3();
        const tokendata = await mc.aggregate([
          tokenContract.methods.name(),
          tokenContract.methods.symbol(),
          tokenContract.methods.decimals(),
        ]);

        let accBalance = 0;
        if (account !== undefined)
          accBalance = await tokenContract.methods.balanceOf(account).call();

        setTokenInfo({
          name: tokendata[0],
          symbol: tokendata[1],
          address: tokenAddr,
          decimals: tokendata[2],
          balance: accBalance,
          image: "unlisted.png",
          unlisted: true,
        });
      }
      return true;
    } catch (error) {
      return false;
    }
  };

  const getLpTokenInfo = async () => {
    const factoryContract = getWeb3Contract(
      FactoryABI,
      contracts[CHAIN_ID].FACTORY
    );

    const pairAddress = await factoryContract.methods
      .getPair(tokenAddr1, tokenAddr2)
      .call();

    if (pairAddress === zeroAddress) {
      setLpTokenInfo({});
    } else {
      const mc = MulticallContractWeb3();
      const lpContract = await getWeb3Contract(LPABI, pairAddress);
      const lpData = await mc.aggregate([
        lpContract.methods.name(),
        lpContract.methods.symbol(),
        lpContract.methods.decimals(),
        lpContract.methods.balanceOf(account),
      ]);

      setLpTokenInfo({
        address: pairAddress,
        name: lpData[0],
        symbol: lpData[1],
        decimals: lpData[2],
        balance: lpData[3],
      });
    }
  };

  const findLpToken = async () => {
    const web3 = getWeb3();

    const isValid1 = await web3.utils.isAddress(tokenAddr1);
    const isValid2 = await web3.utils.isAddress(tokenAddr2);

    let ret1 = false;
    let ret2 = false;

    if (isValid1) {
      ret1 = await getTokenInfo(tokenAddr1, setTokenInfo1);
    } else {
      setTokenInfo1({});
    }

    if (isValid2 && tokenAddr1 !== tokenAddr2) {
      ret2 = await getTokenInfo(tokenAddr2, setTokenInfo2);
    } else {
      setTokenInfo2({});
    }

    if (ret1 && ret2) {
      getLpTokenInfo();
    } else {
      setLpTokenInfo({});
    }
  };

  const importLpToken = async () => {
    setImporting(true);
    let lpTokenList =
      JSON.parse(localStorage.getItem("lpTokenList" + CHAIN_ID)) ?? [];

    for (let i = 0; i < lpTokenList.length; i++) {
      if (lpTokenList[i].address === lpTokenInfo.address) {
        setImporting(false);
        handleModal();
        return;
      }
    }

    lpTokenList.push({
      symbol: `${tokenInfo1.symbol}-${tokenInfo2.symbol}`,
      address: lpTokenInfo.address,
      token1: {
        symbol: tokenInfo1.symbol,
        address: tokenInfo1.address,
        image: tokenInfo1.image,
      },
      token2: {
        symbol: tokenInfo2.symbol,
        address: tokenInfo2.address,
        image: tokenInfo2.image,
      },
    });

    localStorage.setItem("lpTokenList" + CHAIN_ID, JSON.stringify(lpTokenList));

    setLpTokens(await getLpTokens());
    setImporting(false);
    handleModal();
  };

  useEffect(() => {
    findLpToken();
  }, [tokenAddr1, tokenAddr2]);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={handleModal}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">add lp token</span>
        </DialogHeader>
        <DialogBody>
          {importing && (
            <div className="absolute flex justify-center items-center w-full h-full -ml-4">
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="inline w-8 h-8 mr-2  animate-spin dark: fill-red-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
              <p>importing ...</p>
            </div>
          )}
          <div className="mb-5">
            <label className="mb-2">first token</label>
            <input
              className="border text-sm"
              type="text"
              placeholder="input token address"
              value={tokenAddr1}
              onChange={(e) => setTokenAddr1(e.target.value)}
            />
            {Object.keys(tokenInfo1).length > 0 && (
              <div className="flex justify-center items-center mt-1 mb-5 px-3 py-4 ">
                <div className=" w-full flex flex-col md:flex-row justify-between items-center">
                  <span className=" whitespace-nowrap">
                    {tokenInfo1.name} / {tokenInfo1.symbol}
                  </span>
                  <hr className="w-full mx-3" />
                  <a
                    href={`${SCAN_URL[CHAIN_ID]}address/${tokenInfo1.address}`}
                    target="_blank"
                  >
                    {trimAddress(tokenInfo1.address)}
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="mb-5">
            <label className="mb-2">second token</label>
            <input
              className="border text-sm"
              type="text"
              placeholder="Input token address"
              value={tokenAddr2}
              onChange={(e) => setTokenAddr2(e.target.value)}
            />
            {Object.keys(tokenInfo2).length > 0 && (
              <div className="flex justify-center items-center mt-1 mb-5 px-3 py-4 ">
                <div className=" w-full flex flex-col md:flex-row justify-between items-center">
                  <span className=" whitespace-nowrap">
                    {tokenInfo2.name} / {tokenInfo2.symbol}
                  </span>
                  <hr className="w-full mx-3" />
                  <a
                    href={`${SCAN_URL[CHAIN_ID]}address/${tokenInfo2.address}`}
                    target="_blank"
                  >
                    {trimAddress(tokenInfo2.address)}
                  </a>
                </div>
              </div>
            )}
          </div>
          {Object.keys(lpTokenInfo).length > 0 && (
            <>
              <h3>Search Result</h3>
              <div className="flex justify-center items-center mt-2 mb-5 px-3 py-4 ">
                <div className=" w-full flex flex-col md:flex-row justify-between items-center">
                  <span className=" whitespace-nowrap">
                    {lpTokenInfo.name} / {lpTokenInfo.symbol}
                  </span>
                  <hr className="w-full mx-3" />
                  <a
                    href={`${SCAN_URL[CHAIN_ID]}address/${lpTokenInfo.address}`}
                    target="_blank"
                  >
                    {trimAddress(lpTokenInfo.address)}
                  </a>
                </div>
              </div>
              <div className="flex justify-center items-center mb-5">
                <button
                  className="min-w-[200px] hover:bg-kojiki-blue py-1  "
                  onClick={(e) => importLpToken()}
                >
                  Import
                </button>
              </div>
            </>
          )}
        </DialogBody>
      </Dialog>
    </React.Fragment>
  );
}
