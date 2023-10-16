import React, { useState, useContext, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { Dialog, DialogHeader, DialogBody } from "@material-tailwind/react";

import { CHAIN_ID, getWeb3 } from "../../hooks/connectors";
import {
  getWeb3Contract,
  MulticallContractWeb3,
  formatUnits,
} from "../../hooks/contractHelper";
import { getTokens } from "../../hooks/tokenHelper";

import ERC20ABI from "../../assets/abi/ERC20.json";
import { TokenContext } from "../../context/context";
import LoadingIcon from "../Icons/LoadingIcon";
import { contracts } from "../../config/contracts";

export default function CurrencyModal(props) {
  const {
    openModal,
    handleModal,
    setChosenToken,
    setChosenTokenAddress,
    setOtherChosenTokenAddress,
    chosenAddress,
    otherChosenAddress,
  } = props;

  const { account } = useWeb3React();
  const { tokens, setTokens } = useContext(TokenContext);

  const [tokenList, setTokenList] = useState(tokens);
  const [search, setSearch] = useState("");
  const [finding, setFinding] = useState(false);
  const [importing, setImporting] = useState(false);

  const chooseToken = (tokenAddress) => {
    if (tokenAddress === otherChosenAddress) {
      setOtherChosenTokenAddress(chosenAddress);
    }
    setChosenToken(tokens[tokenAddress]);
    setChosenTokenAddress(tokenAddress);
    setSearch("");
    handleModal();
  };

  const addToken = async (newToken) => {
    setImporting(true);
    let addedTokenList =
      JSON.parse(localStorage.getItem("tokenList" + CHAIN_ID)) ?? [];

    for (let i = 0; i < addedTokenList.length; i++) {
      if (addedTokenList[i].address === newToken.address) return;
    }

    addedTokenList.push({
      symbol: newToken.symbol,
      name: newToken.name,
      address: newToken.address,
      decimals: newToken.decimals,
      image: "unlisted.png",
      common: false,
      native: false,
    });

    localStorage.setItem(
      "tokenList" + CHAIN_ID,
      JSON.stringify(addedTokenList)
    );

    await setTokens(await getTokens(account));

    chooseToken(newToken.address);

    setImporting(false);
  };

  const searchToken = async (e) => {
    setFinding(true);
    const stext = e.target.value.toLowerCase();

    setSearch(e.target.value);

    const web3 = getWeb3();
    const isValidAddress = await web3.utils.isAddress(stext);

    const filterTokenList = {};

    await Object.keys(tokens).map((addr, i) => {
      if (
        (tokens[addr].address.toLowerCase().includes(stext) &&
          isValidAddress) ||
        tokens[addr].name.toLowerCase().includes(stext) ||
        tokens[addr].symbol.toLowerCase().includes(stext)
      ) {
        filterTokenList[addr] = tokens[addr];
      }
    });

    if (Object.keys(filterTokenList).length > 0) {
      setTokenList(filterTokenList);
    } else if (isValidAddress) {
      try {
        const checkSum = web3.utils.toChecksumAddress(stext);
        const addressCode = web3.eth.getCode(stext);
        if (!checkSum || addressCode === "0x") {
          setTokenList({});
        } else {
          const tokenContract = getWeb3Contract(ERC20ABI, stext);

          const mc = MulticallContractWeb3();
          const tokendata = await mc.aggregate([
            tokenContract.methods.name(),
            tokenContract.methods.symbol(),
            tokenContract.methods.decimals(),
          ]);

          let accBalance = 0;
          if (account !== undefined)
            accBalance = await tokenContract.methods.balanceOf(account).call();

          setTokenList({
            stext: {
              name: tokendata[0],
              symbol: tokendata[1],
              address: stext,
              decimals: tokendata[2],
              balance: accBalance,
              image: "unlisted.png",
              unlisted: true,
            },
          });
        }
      } catch (error) {
        setTokenList({});
      }
    } else {
      setTokenList({});
    }

    setFinding(false);
  };

  useEffect(() => {
    (async () => {
      setTokenList(tokens);
    })();

    return () => {};
  }, [account, tokens]);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={handleModal}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">select a token</span>
        </DialogHeader>
        <DialogBody>
          {importing && (
            <div className="absolute flex justify-center items-center w-full h-[calc(100%-15px)] -ml-4">
              <div role="status">
                <LoadingIcon />
              </div>
              <p></p>
            </div>
          )}
          <div>
            <input
              className="w-full p-2 text-sm leading-none border"
              type="text"
              placeholder="search by name or address"
              value={search}
              onChange={(e) => searchToken(e)}
            />
          </div>
          <div className="mt-4">
            <div>
              <span className="text-kojiki-blue text-sm">common bases</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {Object.keys(tokens).map((addr, i) => {
                if (
                  addr.toLowerCase() !=
                    contracts[CHAIN_ID].XSakeTOKEN.toLowerCase() &&
                  tokenList[addr] != undefined &&
                  tokens[addr].common
                )
                  return (
                    <button
                      className="flex items-center gap-1 p-1 hover:bg-kojiki-gray/10"
                      key={addr}
                      onClick={() => {
                        chooseToken(addr);
                      }}
                    >
                      <img
                        className="border-kojiki-blue "
                        src={require(`../../assets/img/token/${tokens[addr].image}`)}
                        width="20px"
                      />
                      <span>{tokens[addr].symbol}</span>
                    </button>
                  );
              })}
            </div>
          </div>
          <div className="mt-4">
            <div>
              <span className="text-kojiki-blue text-sm">token list</span>
            </div>
            <div className="flex flex-col justify-start gap-1 min-h-[30vh] max-h-[40vh] overflow-y-auto">
              {finding === false ? (
                Object.keys(tokenList).length > 0 ? (
                  Object.keys(tokenList).map((addr, i) => {
                    if (
                      addr.toLowerCase() !=
                        contracts[CHAIN_ID].XSakeTOKEN.toLowerCase() &&
                      tokenList[addr] != undefined
                    )
                      return (
                        <button
                          className="flex justify-between items-center p-1 hover:bg-kojiki-gray/10"
                          key={addr}
                          onClick={() => {
                            if (tokenList[addr]?.unlisted === true)
                              addToken(tokenList[addr]);
                            else chooseToken(addr);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={require(`../../assets/img/token/${tokenList[addr].image}`)}
                              width="20px"
                            />
                            <div className="text-left">
                              <p className="leading-none">
                                {tokenList[addr].symbol}
                              </p>
                              {/* <span className="text-sm">
                                {tokenList[addr].name}
                              </span> */}
                            </div>
                          </div>
                          <div>
                            <span>
                              {formatUnits(
                                tokenList[addr].balance,
                                tokenList[addr].decimals
                              ).toFixed(3)}
                            </span>
                          </div>
                        </button>
                      );
                  })
                ) : (
                  <div className="text-center">No tokens found.</div>
                )
              ) : (
                <div className="text-center">
                  <LoadingIcon />
                </div>
              )}
            </div>
          </div>
        </DialogBody>
      </Dialog>
    </React.Fragment>
  );
}
