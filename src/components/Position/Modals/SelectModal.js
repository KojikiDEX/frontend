import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import { Dialog, DialogHeader, DialogBody } from "@material-tailwind/react";

import { formatUnits } from "../../../hooks/contractHelper";

import { getSupportedPools } from "../../../hooks/poolHelper";

export default function SelectModal(props) {
  const { openModal, handleModal, setPosition } = props;
  const { chainId, account } = useWeb3React();

  const [poolList, setPoolList] = useState([]);
  const [poolLength, setPoolLength] = useState(-1);

  const choosePosition = (addr) => {
    setPosition(poolList[addr]);
    handleModal();
  };

  useEffect(() => {
    (async () => {
      const pools = await getSupportedPools(account);
      setPoolList(pools);
      setPoolLength(Object.keys(pools).length);
    })();

    return () => {};
  }, [chainId, account]);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={() => handleModal}
        size={"lg"}
      >
        <DialogHeader className="border-b borderkojiki-blue">
          <span className="text-kojiki-blue font-normal">select a token</span>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col justify-start gap-4 min-h-[30vh] max-h-[40vh] overflow-y-auto">
            {poolLength > 0 ? (
              Object.keys(poolList).map((addr, i) => {
                return (
                  <button
                    className="flex justify-between items-center gap-1 p-1 hover:bg-kojiki-gray/10"
                    key={addr}
                    onClick={() => choosePosition(addr)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className="border-kojiki-blue "
                        src={require(`../../../assets/img/token/${poolList[addr].token1.image}`)}
                        width="20px"
                      />
                      <img
                        className="border-kojiki-blue "
                        src={require(`../../../assets/img/token/${poolList[addr].token2.image}`)}
                        width="20px"
                      />
                      <div className="text-left">
                        <p>{poolList[addr].symbol}</p>
                        <p className="  ">{poolList[addr].name}</p>
                      </div>
                    </div>
                    <div>
                      <span>
                        {formatUnits(
                          poolList[addr].balance,
                          poolList[addr].decimals
                        ).toFixed(3)}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center">
                {poolLength == -1 ? "loading pools ..." : "No pools found"}
              </div>
            )}
          </div>
        </DialogBody>
      </Dialog>
    </React.Fragment>
  );
}
