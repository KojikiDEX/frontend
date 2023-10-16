import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import { getContract, formatNumber } from "../../../hooks/contractHelper";
import { CHAIN_ID, getWeb3 } from "../../../hooks/connectors";

import { contracts } from "../../../config/contracts";

import LPABI from "../../../assets/abi/LP.json";
import ROUTERABI from "../../../assets/abi/KojikiSwapRouter.json";

export default function RemoveLPModal(props) {
  const { account, library } = useWeb3React();

  const { openModal, handleModal, choosenLiquidity, setChoosenLiquidity } =
    props;

  const [confirming, setConfirming] = useState(false);

  const [amount, setAmount] = useState(100);
  const [allowance, setAllowance] = useState(0);

  const onChangeAmount = async (v) => {
    setAmount(v);
  };

  const approveLiquidity = async () => {
    if (choosenLiquidity.address == undefined || amount == 0) return;

    setConfirming(true);
    try {
      let lpContract = getContract(LPABI, choosenLiquidity.address, library);
      let tx = await lpContract.approve(
        contracts[CHAIN_ID].ROUTER,
        formatNumber((choosenLiquidity.balance * amount) / 100),
        {
          from: account,
        }
      );
      const resolveAfter3Sec = new Promise((resolve) =>
        setTimeout(resolve, 20000)
      );

      toast.promise(resolveAfter3Sec, {
        pending: "waiting for confirmation...",
      });

      var interval = setInterval(async function () {
        let web3 = getWeb3();
        var response = await web3.eth.getTransactionReceipt(tx.hash);
        if (response !== null) {
          if (response.status === true) {
            clearInterval(interval);
            toast.success("success! your transaction is success.");

            setAllowance((choosenLiquidity.balance * amount) / 100);
            setConfirming(false);
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");

            setConfirming(false);
          } else {
          }
        }
      }, 5000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setConfirming(false);
    }
  };

  const removeLiquidity = async () => {
    if (choosenLiquidity.address == undefined || amount == 0) return;

    setConfirming(true);
    try {
      let routerContract = getContract(
        ROUTERABI,
        contracts[CHAIN_ID].ROUTER,
        library
      );

      let tx;
      if (
        choosenLiquidity.token1.address == contracts[CHAIN_ID].WETH ||
        choosenLiquidity.token2.address == contracts[CHAIN_ID].WETH
      ) {
        tx = await routerContract.removeLiquidityETH(
          choosenLiquidity.token1.address == contracts[CHAIN_ID].WETH
            ? choosenLiquidity.token2.address
            : choosenLiquidity.token1.address,
          formatNumber((choosenLiquidity.balance * amount) / 100),
          0,
          0,
          account,
          Date.now() + 3000,
          {
            from: account,
          }
        );
      } else {
        tx = await routerContract.removeLiquidityETH(
          choosenLiquidity.token1.address,
          choosenLiquidity.token2.address,
          formatNumber((choosenLiquidity.balance * amount) / 100),
          0,
          0,
          account,
          Date.now() + 3000,
          {
            from: account,
          }
        );
      }
      const resolveAfter3Sec = new Promise((resolve) =>
        setTimeout(resolve, 20000)
      );

      toast.promise(resolveAfter3Sec, {
        pending: "waiting for confirmation...",
      });

      var interval = setInterval(async function () {
        let web3 = getWeb3();
        var response = await web3.eth.getTransactionReceipt(tx.hash);
        if (response !== null) {
          if (response.status === true) {
            clearInterval(interval);
            toast.success("success! your transaction is success.");

            setChoosenLiquidity({
              ...choosenLiquidity,
              balance: formatNumber(
                (choosenLiquidity.balance * (100 - amount)) / 100
              ),
            });

            setConfirming(false);
            handleModal(false);
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");

            setConfirming(false);
          } else {
          }
        }
      }, 5000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setConfirming(false);
    }
  };

  useEffect(() => {
    if (choosenLiquidity.allowance != undefined)
      setAllowance(choosenLiquidity.allowance);
  }, [choosenLiquidity]);

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
            <span className="text-kojiki-blue font-normal">
              Remove Liquidity
            </span>
          </DialogHeader>
          <DialogBody>
            <div className="ml-2 mr-2 my-3 p-4  border-kojiki-blue">
              <h1 className=" mb-3">You will receive</h1>
              <div className="flex justify-between">
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
                      (((choosenLiquidity.reserves[0] *
                        choosenLiquidity.balance) /
                        choosenLiquidity.supply) *
                        amount) /
                        100
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
                      (((choosenLiquidity.reserves[1] *
                        choosenLiquidity.balance) /
                        choosenLiquidity.supply) *
                        amount) /
                        100
                    )}
                  </p>
                  <p>pooled amount</p>
                </div>
              </div>
            </div>
            <div className="mx-4">
              <div className=" w-full  ">
                <div className="flex justify-between">
                  <h1>amount</h1>
                  <h1>{amount}%</h1>
                </div>
                <div>
                  <input
                    id="default-range"
                    type="range"
                    value={amount}
                    onChange={(e) => onChangeAmount(e.target.value)}
                    className="w-full h-2 bg-kojiki-blue  appearance-none cursor-pointer dark:bg-kojiki-blue"
                  />
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter className="flex gap-1">
            <div className="flex-1">
              {allowance < (choosenLiquidity.balance * amount) / 100 ? (
                <button
                  className="w-full primary"
                  onClick={() => approveLiquidity()}
                >
                  {confirming ? "confirming..." : `approve`}
                </button>
              ) : (
                <button
                  className="w-full primary"
                  onClick={() => removeLiquidity()}
                >
                  {confirming ? "confirming..." : `Remove`}
                </button>
              )}
            </div>
            <div className="flex-1">
              <button className="w-full primary" onClick={() => handleModal()}>
                cancel
              </button>
            </div>
          </DialogFooter>
        </Dialog>
      )}
    </React.Fragment>
  );
}
