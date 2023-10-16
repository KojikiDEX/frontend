import React, { useContext } from "react";

import { formatUnits } from "../../../../hooks/contractHelper";
import { TokenContext } from "../../../../context/context";
import { CHAIN_ID } from "../../../../hooks/connectors";
import { contracts } from "../../../../config/contracts";

export default function Input(props) {
  const { amount, disabled, setAmount } = props;

  const { tokens } = useContext(TokenContext);

  const saketoken = tokens[contracts[CHAIN_ID].saketoken.toLowerCase()];

  const setInputAmount = (value) => {
    if (!value) {
      setAmount(0);
    } else {
      setAmount(value);
    }
  };

  return (
    <React.Fragment>
      {saketoken !== undefined && (
        <div>
          <div className="flex gap-2 flex-col md:flex-row ">
            <div className="flex w-full justify-between min-w-full md:min-w-[100px] border p-2">
              <input
                type="number"
                className="w-full  text-sm leading-none"
                value={amount}
                disabled={disabled === undefined ? "" : "disabled"}
                onChange={(e) => {
                  setInputAmount(e.target.value);
                }}
              />
              {disabled === undefined && (
                <button
                  className="primary"
                  onClick={(e) => {
                    setInputAmount(
                      formatUnits(saketoken.balance, saketoken.decimals)
                    );
                  }}
                >
                  max
                </button>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm">
              bal:{" "}
              {formatUnits(saketoken.balance, saketoken.decimals).toFixed(2)}{" "}
              {saketoken.symbol}
            </span>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
