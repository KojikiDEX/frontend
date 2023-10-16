import React, { useState } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import { formatNumber, formatUnits } from "../../../hooks/contractHelper";

import RemoveLPModal from "./RemoveLPModal";

export default function LPDetailModal(props) {
  const { openModal, handleModal, choosenLiquidity, setChoosenLiquidity } =
    props;
  const [openRemoveModal, setOpenRemoveModal] = useState(false);
  const handleRemoveModal = () => {
    setOpenRemoveModal(!openRemoveModal);
    handleModal();
  };
  return (
    <React.Fragment>
      {Object.keys(choosenLiquidity).length > 0 && (
        <Dialog
          className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
          open={openModal}
          handler={() => handleModal()}
          size={"lg"}
        >
          <DialogHeader className="border-b border-kojiki-blue">
            <span className="text-kojiki-blue font-normal">your liquidity</span>
          </DialogHeader>
          <DialogBody>
            <div className="flex justify-between p-2">
              <div className="flex items-center gap-1">
                <img
                  className="border-kojiki-blue "
                  src={require(`../../../assets/img/token/${choosenLiquidity.token1.image}`)}
                  width="35px"
                />
                <img
                  className="border-kojiki-blue "
                  src={require(`../../../assets/img/token/${choosenLiquidity.token2.image}`)}
                  width="35px"
                />
                <label>{choosenLiquidity.symbol}</label>
              </div>
              <div className="text-right">
                <p>{formatNumber(formatUnits(choosenLiquidity.balance, 18))}</p>
                <p>balance in wallet</p>
              </div>
            </div>
            <div className="ml-2 mr-2 my-3 border-kojiki-blue  p-4">
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-1">
                  <img
                    className="border-kojiki-blue "
                    src={require(`../../../assets/img/token/${choosenLiquidity.token1.image}`)}
                    width="30px"
                  />
                  <label>{choosenLiquidity.token1.symbol}</label>
                </div>
                <div className="text-right">
                  <p>
                    {formatNumber(
                      (choosenLiquidity.reserves[0] *
                        choosenLiquidity.balance) /
                        choosenLiquidity.supply
                    )}
                  </p>
                  <p>pooled amount</p>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <img
                    className="border-kojiki-blue "
                    src={require(`../../../assets/img/token/${choosenLiquidity.token2.image}`)}
                    width="30px"
                  />
                  <label>{choosenLiquidity.token2.symbol}</label>
                </div>
                <div className="text-right">
                  <p>
                    {formatNumber(
                      (choosenLiquidity.reserves[1] *
                        choosenLiquidity.balance) /
                        choosenLiquidity.supply
                    )}
                  </p>
                  <p>pooled amount</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between p-2">
              <p>Shared of Pool</p>
              <p>
                {(choosenLiquidity.balance / choosenLiquidity.supply) * 100 <
                0.1
                  ? "< 0.1"
                  : Number(
                      (
                        (choosenLiquidity.balance / choosenLiquidity.supply) *
                        100
                      ).toFixed(2)
                    )}
                %
              </p>
            </div>
          </DialogBody>
          <DialogFooter className="flex gap-1">
            <div className="flex-1">
              <button
                className="w-full primary"
                onClick={() => handleRemoveModal()}
              >
                Remove Liquidity
              </button>
            </div>
            <div className="flex-1">
              <button className="w-full primary" onClick={() => handleModal()}>
                close
              </button>
            </div>
          </DialogFooter>
        </Dialog>
      )}
      <RemoveLPModal
        openModal={openRemoveModal}
        handleModal={handleRemoveModal}
        choosenLiquidity={choosenLiquidity}
        setChoosenLiquidity={setChoosenLiquidity}
      />
    </React.Fragment>
  );
}
