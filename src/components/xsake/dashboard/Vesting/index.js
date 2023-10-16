import React, { useContext } from "react";

import { Typography } from "@material-tailwind/react";
import { BiRefresh } from "react-icons/bi";
import { IconContext } from "react-icons";
import RedeemItem from "./components/RedeemItem";
import { useWeb3React } from "@web3-react/core";
import { TokenContext } from "../../../../context/context";
import { contracts } from "../../../../config/contracts";
import { CHAIN_ID } from "../../../../hooks/connectors";
import RedeemDlg from "./components/RedeemDlg";
import { formatUnits, formatValue } from "../../../../hooks/contractHelper";
import { useSakeState } from "../../../../hooks/useSakeState";

export default function Vesting(props) {
  // const [isNavOpen, setIsNavOpen] = React.useState(false);
  const { redeems, xSakeDecimals } = props;
  const { sakeDecimals, blockTimestamp } = useSakeState(false);
  const { account } = useWeb3React();
  const { tokens } = useContext(TokenContext);
  const xSakeToken = tokens[contracts[CHAIN_ID].XSakeTOKEN.toLowerCase()];

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(!open);

  return (
    <React.Fragment>
      <div className="mb-1">
        <div className="flex flex-col justify-between lg:flex-row">
          <p className="my-auto text-center lg:text-left">vesting</p>
          {!account ? (
            <button className="min-w-[180px] default-outline items-center flex items-center justify-center mx-auto lg:mx-0">
              <span>not connected</span>
            </button>
          ) : xSakeToken.balance === undefined ||
            xSakeToken.balance <= formatValue(0, 1) ? (
            <button
              className="min-w-[180px] default-outline flex items-center justify-center mx-auto lg:mx-0"
              disabled
            >
              redeem xSAKE
            </button>
          ) : (
            <button
              className="min-w-[180px] default-outline flex items-center justify-center mx-auto lg:mx-0"
              onClick={(e) => {
                setOpen(true);
              }}
            >
              redeem xSAKE
            </button>
          )}
        </div>
        <div className="border p-3 flex flex-col justify-between lg:items-center mt-4 lg:flex-row">
          <div className="flex flex-row lg:flex-col justify-between">
            <span>min. vesting</span>
            <span className="text-kojiki-blue">15 days</span>
          </div>
          <div className="flex flex-row lg:flex-col justify-between">
            <span>max. vesting</span>
            <span className="text-kojiki-blue">6 months</span>
          </div>
          <div className="flex flex-row lg:flex-col justify-between">
            <span>min. vesting</span>
            <span className="text-kojiki-blue">1:0.5</span>
          </div>
          <div className="flex flex-row lg:flex-col justify-between">
            <span>max. ratio</span>
            <span className="text-kojiki-blue">1:1</span>
          </div>
        </div>
        {redeems && redeems.length > 0 && (
          <div className="border mt-5 p-3">
            <div className="w-full flex ">
              <div className="w-full flex justify-between items-center lg:gap-2">
                <span>xSAKE input</span>
                <span>sAKE output</span>
                <span>time left</span>
                <span className="my-auto flex flex-col lg:flex-row items-center text-transparent">
                  transparent
                </span>
              </div>
            </div>
            {redeems.map((item, i) => (
              <RedeemItem
                key={i}
                redeemIndex={i}
                sakeAmount={formatUnits(item[0], sakeDecimals).toFixed(2)}
                xSakeAmount={formatUnits(item[1], xSakeDecimals).toFixed(2)}
                coolDown={parseInt(item[2]) - parseInt(blockTimestamp)}
                dividendsAddress={item[3]}
                allocatedOfDividends={formatUnits(
                  item[4],
                  xSakeDecimals
                ).toFixed(2)}
              />
            ))}
          </div>
        )}
        <RedeemDlg open={open} handleOpen={handleOpen} />
      </div>
    </React.Fragment>
  );
}
