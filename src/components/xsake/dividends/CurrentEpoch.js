import React, { useEffect, useState } from "react";
import { Typography } from "@material-tailwind/react";
import EpochItem from "./components/EpochItem";
import { displayRemainTime } from "../../../utils";

export default function CurrentEpoch(props) {
  const { open, setOpen, curEpochData, cooldown } = props;

  const [downTime, setDownTime] = useState(cooldown);
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    setDownTime(cooldown);
  }, [cooldown]);

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
    <div className="w-full border mb-3 lg:w-1/2 lg:mb-0 mt-7 p-5">
      <div className="flex flex-col mb-5 lg:flex-row">
        <span className="mb-5 text-center lg:text-left">current epoch</span>
        <button
          className="w-2/3 lg:w-auto mx-auto lg:mx-0 lg:ml-auto default-outline"
          type="button"
          onClick={() => {
            setOpen(!open);
          }}
        >
          calculator
        </button>
      </div>
      {curEpochData.map((item, i) => {
        return (
          <div className="flex flex-col mb-3 lg:flex-row" key={i}>
            <EpochItem
              symbol={item.symbol}
              token={item.token}
              token0={item.token0}
              token1={item.token1}
              amount={item.amount}
              amountInUsd={item.amountInUsd}
            />
          </div>
        );
      })}
      <div className="py-3 mb-3 border-b-2 border-dashed"></div>

      <span>next epoch</span>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="overflow-hidden">
            <table className="min-w-full text-left ">
              <thead>
                <tr>
                  <td scope="col pt-3">min. estimated value</td>
                  <td scope="col pt-3">apy</td>
                  <td scope="col pt-3">remaining time</td>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="whitespace-nowrap ">{"$0"}</td>
                  <td className="whitespace-nowrap ">{`0%`}</td>
                  <td className="whitespace-nowrap ">
                    <Typography variant="h6">{timeString}</Typography>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
