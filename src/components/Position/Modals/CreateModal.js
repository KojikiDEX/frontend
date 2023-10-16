import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import {
  getContract,
  getWeb3Contract,
  formatValue,
  formatUnits,
  formatNumber,
} from "../../../hooks/contractHelper";

import { getWeb3 } from "../../../hooks/connectors";

import ArrowDownIcon from "../../Icons/ArrowDownIcon";
import MinusIcon from "../../Icons/MinusIcon";
import PlusIcon from "../../Icons/PlusIcon";

import SelectModal from "./SelectModal";

import LPABI from "../../../assets/abi/LP.json";
import NFTPoolABI from "../../../assets/abi/NFTPool.json";

export default function CreateModal(props) {
  const { account, library } = useWeb3React();

  const [loading, setLoading] = useState(false);

  const { openModal, handleModal } = props;
  const [openSelectModal, setOpenSelectModal] = useState(false);

  const [position, setPosition] = useState({});
  const [amount, setAmount] = useState(0);
  const [lockBonus, setLockBonus] = useState(0);
  const [lockDays, setLockDays] = useState(0);
  const [allowance, setAllowance] = useState(false);

  const handleAmount = (d) => {
    setAmount(d);

    if (position.allowance !== undefined)
      setAllowance(position.allowance > Number(d));
  };

  const handleLockPeriod = async (d) => {
    setLockDays(d);

    if (position.address !== undefined) {
      const positionContract = getWeb3Contract(NFTPoolABI, position.address);

      const bonus = await positionContract.methods
        .getMultiplierByLockDuration(d * 86400)
        .call();

      setLockBonus(bonus / 100);
    }
  };

  const handleSelectModal = () => {
    setOpenSelectModal(!openSelectModal);
  };

  const approveLiquidity = async () => {
    if (position.address == undefined) return;

    setLoading(true);
    try {
      let lpContract = getContract(LPABI, position.lpToken, library);
      let tx = await lpContract.approve(
        position.address,
        formatValue(amount, 18).toString(),
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

            setAllowance(true);
            setLoading(false);
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");

            setLoading(false);
          } else {
          }
        }
      }, 5000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setLoading(false);
    }
  };

  const createPosition = async () => {
    if (position.address == undefined) return;

    setLoading(true);
    try {
      let positionContract = getContract(NFTPoolABI, position.address, library);
      let tx = await positionContract.createPosition(
        formatValue(amount, 18),
        lockDays * 3600 * 24,
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

            setLoading(false);
            handleModal(false);
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");

            setLoading(false);
          } else {
          }
        }
      }, 5000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (position.address !== undefined) {
        const positionContract = getWeb3Contract(NFTPoolABI, position.address);

        const bonus = await positionContract.methods
          .getMultiplierByLockDuration(lockDays)
          .call();
        setLockBonus(bonus);

        setAllowance(position.allowance > Number(amount));
      }
    })();

    return () => {};
  }, [position]);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={() => handleModal(!openModal)}
        size={"lg"}
      >
        <DialogHeader className="border-b borderkojiki-blue">
          <span className="text-kojiki-blue font-normal">create position</span>
        </DialogHeader>
        <DialogBody>
          <div className="mb-5">
            <button
              className="w-full flex items-center justify-between border p-1"
              onClick={() => {
                setOpenSelectModal(true);
              }}
            >
              <div className="flex items-center gap-2">
                {position.address !== undefined ? (
                  <>
                    <div className="flex items-center gap-1">
                      <img
                        className="border-kojiki-blue "
                        src={require(`../../../assets/img/token/${position.token1.image}`)}
                        width="20px"
                      />
                      <img
                        className="border-kojiki-blue "
                        src={require(`../../../assets/img/token/${position.token2.image}`)}
                        width="20px"
                      />
                    </div>
                    <div>
                      <p className="items-center">
                        {position.token1.symbol}-{position.token2.symbol}
                      </p>
                    </div>
                  </>
                ) : (
                  <div>select a pool</div>
                )}
              </div>
              <div>
                <ArrowDownIcon />
              </div>
            </button>
            <SelectModal
              openModal={openSelectModal}
              handleModal={handleSelectModal}
              setPosition={setPosition}
            />
          </div>
          <div className="mb-4">
            <div className="flex justify-between">
              <span>amount</span>
              <span>
                bal:{" "}
                {position.balance == undefined
                  ? 0
                  : formatNumber(formatUnits(position.balance, 18))}
              </span>
            </div>
            <div className="flex w-full justify-between min-w-full md:min-w-[100px] p-1 border">
              <input
                type="number"
                className="w-full text-sm leading-none"
                value={amount}
                onChange={(e) => handleAmount(e.target.value)}
              />
              <button
                className="primary !py-0"
                onClick={(e) =>
                  handleAmount(
                    position.balance == undefined
                      ? 0
                      : formatNumber(formatUnits(position.balance, 18))
                  )
                }
              >
                max
              </button>
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <div>
                <p>lock duration</p>
                <button
                  className="default-outline mt-2 text-sm"
                  onClick={() => handleLockPeriod(183)}
                >
                  set max bonus
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 items-end">
                <div className="flex items-end justify-end">
                  <button
                    className="border-2 !p-[4.6px]"
                    onClick={() => handleLockPeriod(lockDays - 1)}
                  >
                    <MinusIcon />
                  </button>
                </div>
                <div>
                  <p className="text-center mb-1">days</p>
                  <input
                    type="number"
                    className="max-w-[40px] text-center border border-2"
                    value={lockDays}
                    onChange={(e) => handleLockPeriod(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    className="border-2 !p-[4.6px]"
                    onClick={() => handleLockPeriod(lockDays + 1)}
                  >
                    <PlusIcon color="#14a8d4" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-right mr-3 text-sm">{lockBonus}% lock bonus</p>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            {!allowance ? (
              <button
                className="w-full primary"
                onClick={() => approveLiquidity()}
              >
                {loading ? "confirming..." : "approve"}
              </button>
            ) : (
              <button
                className={`w-full ${
                  Number(amount) > 0 &&
                  Number(amount) <= formatUnits(position.balance)
                    ? "primary"
                    : "danger"
                }`}
                disabled={
                  Number(amount) > 0 &&
                  Number(amount) <= formatUnits(position.balance)
                    ? ""
                    : "disabled"
                }
                onClick={() => createPosition()}
              >
                {Number(amount) <= 0
                  ? "input amount"
                  : Number(amount) > formatUnits(position.balance)
                  ? "incorrect amount"
                  : loading
                  ? "confirming..."
                  : "create"}
              </button>
            )}
          </div>
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() => handleModal(false)}
            >
              cancel
            </button>
          </div>
        </DialogFooter>
      </Dialog>
    </React.Fragment>
  );
}
