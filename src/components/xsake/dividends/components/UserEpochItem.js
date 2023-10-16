import React from "react";
import { Typography } from "@material-tailwind/react";
import xSakeIcon from "../../../../assets/img/token/xSAKE.png";
import { toast } from "react-toastify";
import { getContract } from "../../../../hooks/contractHelper";
import { contracts } from "../../../../config/contracts";
import { CHAIN_ID, getWeb3 } from "../../../../hooks/connectors";
import { useWeb3React } from "@web3-react/core";
import DividendsABI from "../../../../assets/abi/Dividends.json";

export default function UserEpochItem(props) {
  // const [isNavOpen, setIsNavOpen] = React.useState(false);
  const { account, library } = useWeb3React();
  const { symbol, token, amount, amountInUsd } = props;
  const [confirming, setConfirming] = React.useState(false);

  const harvestDividends = async () => {
    setConfirming(true);
    try {
      const dividendsContract = getContract(
        DividendsABI,
        contracts[CHAIN_ID].DIVIDENDS,
        library
      );

      const tx = await dividendsContract.harvestDividends(token, {
        from: account,
      });

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
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");
          } else {
            toast.error("error! something went wrong.");
          }
          setConfirming(false);
        }
      }, 20000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setConfirming(false);
    }
  };

  return (
    <>
      <div className="w-full flex ">
        {symbol !== undefined && (
          <>
            <div className="w-full flex justify-between items-center mt-4 lg:flex-row">
              <div className="px-2 flex flex-col lg:flex-row lg:justify-start items-center">
                <div className="px-2 flex justify-start">
                  <img src={xSakeIcon} width="48px" alt={symbol} />
                </div>
                <div className="px-3 flex flex-col items-center">
                  <span>{symbol}</span>
                  <div className="flex flex-row items-center">
                    <span>{`${amount ? amount.toFixed(2) : 0}`}</span>
                    <span>
                      {`($${amountInUsd ? amountInUsd.toFixed(2) : 0})`}
                    </span>
                  </div>
                </div>
              </div>
              <button
                className="default-outline"
                type="button"
                disabled={confirming}
                onClick={(e) => {
                  if (!confirming) harvestDividends();
                }}
              >
                {confirming ? "claiming..." : "claim"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
