import React, { useContext } from "react";

import { formatUnits } from "../../hooks/contractHelper";
import { TokenContext } from "../../context/context";
import { CHAIN_ID } from "../../hooks/connectors";
import { contracts } from "../../config/contracts";

export default function Input(props) {
  const { amount, disabled, setAmount } = props;

  const { tokens } = useContext(TokenContext);

  const ethToken = tokens[contracts[CHAIN_ID].ETH];

  const setInputAmount = (value) => {
    if (!value) {
      setAmount(0);
    } else {
      setAmount(value);
    }
  };

  return (
    <React.Fragment>
      {ethToken !== undefined && (
        <div>
          <div className="flex gap-2 flex-col md:flex-row ">
            <div className="flex w-full justify-between min-w-full md:min-w-[100px] p-1 border">
              <input
                type="number"
                min={0}
                className="w-full  text-sm leading-none"
                value={amount}
                disabled={disabled === undefined ? "" : "disabled"}
                onChange={(e) => {
                  setInputAmount(e.target.value);
                }}
              />
              {disabled === undefined && (
                <button
                  className="primary !py-0"
                  onClick={(e) => {
                    if (
                      formatUnits(ethToken.balance, ethToken.decimals) > 0.002
                    ) {
                      setInputAmount(
                        formatUnits(ethToken.balance, ethToken.decimals) - 0.002
                      );
                    }
                  }}
                >
                  max
                </button>
              )}
            </div>
          </div>
          <div className="text-right">
            <span>
              bal :{" "}
              {formatUnits(ethToken.balance, ethToken.decimals).toFixed(2)}{" "}
              {ethToken.symbol}
            </span>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
