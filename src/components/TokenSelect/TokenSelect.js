import React, { useEffect, useState, useContext } from "react";

import { formatUnits, formatNumber } from "../../hooks/contractHelper";
import { TokenContext } from "../../context/context";
import CurrencyModal from "../CurrencyModal/CurrencyModal";
import ArrowDownIcon from "../Icons/ArrowDownIcon";

export default function TokenSelect(props) {
  const {
    label,
    chosenAddress,
    otherChosenAddress,
    setChosenTokenAddress,
    setOtherChosenTokenAddress,
  } = props;

  const { tokens } = useContext(TokenContext);

  const [chosenToken, setChosenToken] = useState(tokens[chosenAddress]);

  const [openModal, setOpenModal] = useState(false);
  const handleModal = () => {
    setOpenModal(!openModal);
  };

  useEffect(() => {
    setChosenToken(tokens[chosenAddress]);
  }, [chosenAddress, tokens]);

  return (
    <React.Fragment>
      {Object.keys(tokens).length !== 0 ? (
        <>
          {chosenToken !== undefined && (
            <div>
              <div className="flex gap-2 flex-col md:flex-row ">
                <button
                  className="flex items-center gap-2 min-w-[150px] px-3 py-1"
                  onClick={() => {
                    handleModal();
                  }}
                >
                  <img
                    className="border-kojiki-blue "
                    src={require(`../../assets/img/token/${chosenToken.image}`)}
                    width="24px"
                    alt="input"
                  />
                  <div className="flex flex-col items-start">
                    <label>{label}</label>
                    <p className="flex  items-center">
                      {chosenToken.symbol}
                      <ArrowDownIcon />
                    </p>
                  </div>
                </button>
              </div>
            </div>
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
