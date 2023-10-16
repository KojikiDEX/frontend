import React from "react";
import {
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { contracts } from "../../../../../config/contracts";
import { CHAIN_ID, getWeb3 } from "../../../../../hooks/connectors";
import { getContract } from "../../../../../hooks/contractHelper";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import XSakeABI from "../../../../../assets/abi/KojikiStakeToken.json";
import { IconContext } from "react-icons";
import { ImWarning } from "react-icons/im";

export default function CancelRedeemDlg(props) {
  const { account, library } = useWeb3React();
  const [confirming, setConfirming] = React.useState(false);

  const { open, handleOpen, xSakeAmount, redeemIndex } = props;

  const cancel = async () => {
    if (!xSakeAmount || !account || !library) {
      toast.error(
        "Please check your xSAKE canceling amount and network status"
      );
      return;
    }

    const xSakeTokenAddress = contracts[CHAIN_ID].XSakeTOKEN;
    const xSakeContract = getContract(XSakeABI, xSakeTokenAddress, library);

    setConfirming(true);
    try {
      const tx = await xSakeContract.cancelRedeem(redeemIndex, {
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
    <Dialog
      className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
      open={open}
      handler={handleOpen}
      size={"lg"}
    >
      <DialogHeader className="border-b border-kojiki-blue">
        <span className="text-kojiki-blue font-normal">cancel redeem</span>
      </DialogHeader>
      <DialogBody className="pr-2 ">
        <span>xSAKE allocation</span>
        <div className="w-full mt-3 flex flex-row">
          <div className="m-2 bg-kojiki-blue p-3 border-0  flex lg:flex-row">
            <IconContext.Provider value={{ className: "my-auto w-20" }}>
              <ImWarning />
            </IconContext.Provider>
            <Typography variant="h6" className=" mx-2">
              {`By canceling an active redeem, you will reset the whole process: you will get back your currently redeeming ${xSakeAmount} xSAKE, but won't receive any SAKE.`}
            </Typography>
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className="w-full flex flex-row p-2">
          {!account ||
          xSakeAmount === undefined ||
          parseFloat(xSakeAmount) <= 0 ? (
            <button className="w-1/2 p-2 mx-2   " disabled>
              cancel
            </button>
          ) : (
            <button
              className="w-full primary"
              disabled={confirming}
              onClick={(e) => {
                if (!confirming) cancel();
              }}
            >
              {confirming
                ? "confirming..."
                : xSakeAmount && parseFloat(xSakeAmount) > 0
                ? "cancel"
                : "zero amount"}
            </button>
          )}
          <button className="w-full primary" onClick={handleOpen}>
            close
          </button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
