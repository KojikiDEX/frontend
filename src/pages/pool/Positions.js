import React, { useState, useContext } from "react";
import { useWeb3React } from "@web3-react/core";
import { formatUnits, trimAddress } from "../../hooks/contractHelper";

import { TokenContext } from "../../context/context";

import LoadingIcon from "../../components/Icons/LoadingIcon";

import AddLPModal from "./components/AddLPModal";
import { Link } from "react-router-dom";

export default function Positions() {
  const { account } = useWeb3React();
  const { tokens, lpTokens } = useContext(TokenContext);

  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => {
    setOpenModal(!openModal);
  };

  return (
    <React.Fragment>
      <div className="w-full max-w-[1024px] mx-auto mt-7">
        <div>
          <p className="text-kojiki-blue">position</p>
          <span>
            put your assets to work. deposit to liquidity pools to earn.
          </span>
        </div>
        {Object.keys(tokens).length > 0 && Object.keys(lpTokens).length > 0 ? (
          <div className="lg:pt-10">
            <div className="mt-10">
              <div className="flex justify-between items-center pb-4">
                <h2>your positions</h2>
                <div className="flex gap-2">
                  <Link to="/wizard">
                    <button
                      className="default-outline text-sm"
                      // onClick={(e) => handleModal()}
                    >
                      add
                    </button>
                  </Link>
                  <button
                    className="default-outline text-sm"
                    onClick={(e) => handleModal()}
                  >
                    import
                  </button>
                </div>
              </div>
              <div className="w-full min-h-[300px] border">
                {account !== undefined ? (
                  Object.keys(lpTokens).length > 0 ? (
                    Object.keys(lpTokens).map((addr, i) => {
                      if (lpTokens[addr].balance > 0)
                        return (
                          <Link to={`/pool/overview/${addr}`} key={addr}>
                            <button className="w-full flex flex-col items-start md:flex-row md:justify-between md:items-center gap-1 px-5 py-2 h-fit ">
                              <div className="flex flex-col justify-center md:justify-start md:flex-row w-full items-center gap-2">
                                <div className="flex gap-1">
                                  <img
                                    src={require(`../../assets/img/token/${lpTokens[addr].token1.image}`)}
                                    width="35px"
                                  />
                                  <img
                                    src={require(`../../assets/img/token/${lpTokens[addr].token2.image}`)}
                                    width="35px"
                                  />
                                </div>
                                <div className="text-center md:text-left">
                                  <p>{lpTokens[addr].symbol}</p>
                                  <p>{trimAddress(lpTokens[addr].address)}</p>
                                </div>
                              </div>
                              <div className="w-full md:w-fit text-center md:text-left">
                                <span className=" whitespace-nowrap">
                                  bal :{" "}
                                  {Number(
                                    formatUnits(
                                      lpTokens[addr].balance,
                                      18
                                    ).toFixed(3)
                                  )}
                                </span>
                              </div>
                              <hr className="block md:hidden w-full" />
                            </button>
                          </Link>
                        );
                    })
                  ) : (
                    <div className="flex justify-center items-center h-full min-h-[300px]">
                      <span className="mx-auto my-auto">No Liquidity</span>
                    </div>
                  )
                ) : (
                  <div className="flex justify-center items-center h-full min-h-[300px]">
                    <span className="mx-auto my-auto">not connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-content items-center mt-[200px]">
            <LoadingIcon />
            <h5 className="mt-4">loading ...</h5>
          </div>
        )}
        <AddLPModal openModal={openModal} handleModal={handleModal} />
      </div>
    </React.Fragment>
  );
}
