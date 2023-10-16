import React, { useEffect, useState, useContext } from "react";

import { formatUnits, formatNumber } from "../../hooks/contractHelper";
import { TokenContext } from "../../context/context";
import CurrencyModal from "../CurrencyModal/CurrencyModal";
import ArrowDownIcon from "../Icons/ArrowDownIcon";
import LoadingIcon from "../Icons/LoadingIcon";

export default function CurrencyInput(props) {
  const {
    label,
    balPos,
    amount,
    disabled,
    ratio,
    setAmount,
    setOtherAmount,
    chosenAddress,
    otherChosenAddress,
    setChosenTokenAddress,
    setOtherChosenTokenAddress,
    findingPair,
  } = props;

  const { tokens } = useContext(TokenContext);

  const [chosenToken, setChosenToken] = useState(tokens[chosenAddress]);
  const [openModal, setOpenModal] = useState(false);

  const [tAmount, setTAmount] = useState(amount);

  const handleModal = () => {
    setOpenModal(!openModal);
  };

  const setInputAmount = (value) => {
    let valueStrs = value.toString().split(".");
    if (valueStrs.length == 2) {
      value = valueStrs[0].concat(".").concat(valueStrs[1].substr(0, 18));
    }

    setTAmount(value);
    if (Number(value) <= 0) setOtherAmount(0);

    if (ratio !== 0 && value > 0 && tokens[otherChosenAddress] != undefined) {
      setOtherAmount(
        formatNumber(
          value * ratio,
          tokens[otherChosenAddress].decimals
        ).toString()
      );
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAmount(tAmount);
      // if (setOtherAmount != undefined) setOtherAmount(0);
    }, 1000);

    return () => clearTimeout(timer);
  }, [tAmount]);

  useEffect(() => {
    setTAmount(amount);
  }, [amount]);

  useEffect(() => {
    setChosenToken(tokens[chosenAddress]);
  }, [chosenAddress, tokens]);

  return (
    <React.Fragment>
      {Object.keys(tokens).length !== 0 ? (
        <>
          {chosenToken !== undefined && (
            <>
              <div>
                <label>{label}</label>
                <button
                  className="w-full flex gap-1 justify-between items-center border p-1"
                  onClick={() => {
                    handleModal();
                  }}
                >
                  <p className="flex gap-1 items-center">
                    <img
                      src={require(`../../assets/img/token/${chosenToken.image}`)}
                      width="20px"
                      alt="input"
                    />
                    <span>{chosenToken.symbol}</span>
                  </p>
                  <ArrowDownIcon />
                </button>
              </div>
              <div className="mt-2">
                <div className="flex justify-between">
                  <label>amount</label>
                  <span>
                    bal:{" "}
                    {formatUnits(
                      chosenToken.balance,
                      chosenToken.decimals
                    ).toFixed(3)}
                  </span>
                </div>
                <div className="h-[32px] flex justify-betwen items-center p-1 border">
                  <input
                    type="number"
                    className="w-full text-sm leading-none"
                    value={formatNumber(tAmount, 5)}
                    placeholder="tokens to sell"
                    disabled={disabled === undefined ? "" : "disabled"}
                    onChange={(e) => {
                      setInputAmount(e.target.value);
                    }}
                  />
                  <input
                    type="number"
                    className="hidden"
                    value={amount}
                    placeholder="0"
                    disabled="disabled"
                  />
                  {disabled === undefined && (
                    <button
                      className="primary !py-0"
                      onClick={(e) => {
                        setInputAmount(
                          formatUnits(chosenToken.balance, chosenToken.decimals)
                        );
                      }}
                    >
                      max
                    </button>
                  )}
                  {findingPair == true && <LoadingIcon />}
                </div>
              </div>
            </>
          )}
          <CurrencyModal
            openModal={openModal}
            handleModal={handleModal}
            setChosenToken={setChosenToken}
            setChosenTokenAddress={setChosenTokenAddress}
            setOtherChosenTokenAddress={setOtherChosenTokenAddress}
            chosenAddress={chosenAddress}
            otherChosenAddress={otherChosenAddress}
          />
        </>
      ) : (
        <h1>loading</h1>
      )}
    </React.Fragment>
  );
}
