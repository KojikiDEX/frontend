import React, { useEffect, useState } from "react";
import Item from "../Item";
import { Typography } from "@material-tailwind/react";
import { displayRemainTime } from "../../utils";

export default function LaunchpadDetailStatus(props) {
  const {
    totalRaisedInETH,
    totalRaisedInUSD,
    tokenPriceInETH,
    tokenPriceInUSD,
    cirMarketcapInUSD,
    fdvInUSD,
    hasStarted,
    hasEnded,
    coolDown,
    symbol,
  } = props;

  const [downTime, setDownTime] = useState(coolDown);
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    setDownTime(coolDown);
  }, [coolDown]);

  useEffect(() => {
    const timerID = setInterval(() => {
      setDownTime((prevData) => {
        if (prevData > 0) {
          return prevData - 1;
        }
        return 0;
      });
    }, 1000);

    return () => {
      clearInterval(timerID);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setTimeString(displayRemainTime(downTime));
  }, [downTime]);

  return (
    <>
      {!hasStarted ? (
        <div className="w-full flex flex-row mt-10 justify-between">
          <p className="text-center">public sale is not started yet</p>
          <p className="text-center lg:text-right my-auto lg:my-0 lg:mt-3">
            {`Left time to start: ${timeString}`}
          </p>
        </div>
      ) : !hasEnded ? (
        <div className="w-full flex flex-row mt-10 justify-between">
          <p className="text-center">remaining time</p>
          <p className="text-kojiki-blue text-center lg:text-right my-auto lg:my-0 lg:mt-3">
            {`${timeString}`}
          </p>
        </div>
      ) : hasEnded ? (
        <div className="w-full flex flex-row mt-10 justify-center">
          <p className="text-kojiki-red text-center">public sale has ended</p>
        </div>
      ) : (
        <></>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 border p-5 mt-5 mb-10 ">
        <Item
          type={"eth"}
          label={"total raised"}
          value={`${totalRaisedInETH.toFixed(2)} ETH`}
          label2={`$${totalRaisedInUSD.toFixed(2)}`}
        />
        <Item
          type={"sakeprice"}
          label={`$${symbol} price`}
          value={`${tokenPriceInETH.toFixed(3)} ETH`}
          label2={`$${tokenPriceInUSD.toFixed(2)}`}
        />
        <Item
          type={"circulate"}
          label={"circ. marketcap"}
          value={`$${cirMarketcapInUSD.toFixed(2)}`}
        />
        <Item type={"fdv"} label={"fdv"} value={`$${fdvInUSD.toFixed(2)}`} />
      </div>
    </>
  );
}
