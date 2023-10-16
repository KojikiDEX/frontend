import React, { useContext, useState } from "react";
import {
  Input,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatUnits } from "../../../../hooks/contractHelper";
import { contracts } from "../../../../config/contracts";
import { CHAIN_ID, USDC_DECIMALS } from "../../../../hooks/connectors";
import { TokenContext } from "../../../../context/context";
import { useXSakeState } from "../../../../hooks/useXSakeState";
import { useSakeprice } from "../../../../hooks/useKojikiContext";
import { IconContext } from "react-icons";
import { ImWarning } from "react-icons/im";

export default function DividendsCalculatorDialog(props) {
  const { open, handleOpen, totalAllocation, curAPR } = props;

  const { xSakeDecimals, allocatedOfDividends } = useXSakeState();
  const sakeprice = useSakeprice();

  const [amount, setAmount] = useState(0);
  const { tokens } = useContext(TokenContext);
  const xSakeToken = tokens[contracts[CHAIN_ID].XSakeTOKEN.toLowerCase()];

  return (
    <Dialog
      size="xs"
      open={open}
      handler={handleOpen}
      className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
    >
      <DialogHeader className="border-b border-kojiki-blue">
        <span className="text-kojiki-blue font-normal">
          dividends calculator
        </span>
      </DialogHeader>
      <DialogBody className="pr-2 ">
        <span>xSAKE allocation</span>
        <div className="flex w-full justify-between min-w-full md:min-w-[100px] p-1 border">
          <input
            type="number"
            min="0"
            value={amount}
            className="w-full text-sm leading-none"
            onChange={(e) => setAmount(e.target.value)}
            containerProps={{
              className: "min-w-0",
            }}
          />
          <button
            className="primary !py-0"
            onClick={(e) => {
              if (xSakeToken) {
                setAmount(formatUnits(xSakeToken.balance, xSakeToken.decimals));
              }
            }}
          >
            max
          </button>
        </div>
        <p className="text-right text-sm">
          bal :{" "}
          {xSakeToken
            ? formatUnits(xSakeToken.balance, xSakeToken.decimals).toFixed(2)
            : 0}{" "}
          {xSakeToken ? xSakeToken.symbol : ""}
        </p>
        {amount && amount > 0 && (
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-row justify-between">
              <p className="mb-2">estimates</p>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                total allocated amount
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                {parseFloat(amount) +
                  formatUnits(allocatedOfDividends, xSakeDecimals)}{" "}
                xSAKE
              </Typography>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                total allocation share
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                {(
                  ((parseFloat(amount) +
                    formatUnits(allocatedOfDividends, xSakeDecimals)) /
                    (parseFloat(amount) + parseFloat(totalAllocation))) *
                  100
                ).toFixed(2)}{" "}
                %
              </Typography>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                daily returns / xSAKE
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                ${" "}
                {(
                  (formatUnits(sakeprice, USDC_DECIMALS) * curAPR) /
                  365
                ).toFixed(6)}
              </Typography>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                total daily returns
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                ${" "}
                {(
                  ((parseFloat(amount) +
                    formatUnits(allocatedOfDividends, xSakeDecimals)) *
                    formatUnits(sakeprice, USDC_DECIMALS) *
                    curAPR) /
                  365
                ).toFixed(4)}
              </Typography>
            </div>
            <div className="w-full mt-3 border border-kojiki-blue p-2">
              <span className="text-kojiki-blue text-sm">
                {`Those numbers are estimates based on the current daily dividends distribution.`}
              </span>
            </div>
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
}
