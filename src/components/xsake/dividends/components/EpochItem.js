import React from "react";
import { Typography } from "@material-tailwind/react";
// import { GiTrophyCup } from "react-icons/gi";
// import { IconContext } from "react-icons";
import xSakeIcon from "../../../../assets/img/token/xSAKE.png";

export default function EpochItem(props) {
  // const [isNavOpen, setIsNavOpen] = React.useState(false);

  const { symbol, amount, amountInUsd } = props;

  return (
    <div className="w-full flex flex-row">
      {symbol !== undefined && (
        <>
          <div className="w-full px-2 flex justify-center flex-row items-center gap-2 mt-4">
            <div className="px-2 flex justify-start">
              <img src={xSakeIcon} width="48px" alt={symbol} />
            </div>
            <div className="px-3 flex flex-col items-center">
              <Typography variant="small">{symbol}</Typography>
              <div className="flex flex-row items-center">
                <Typography variant="small">
                  {`${amount.toFixed(2)}`}
                </Typography>
                <Typography variant="small">
                  {`($${amountInUsd.toFixed(2)})`}
                </Typography>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
