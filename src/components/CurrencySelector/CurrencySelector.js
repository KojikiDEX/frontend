import React, { useEffect, useState, useContext } from "react";

import { formatUnits, formatNumber } from "../../hooks/contractHelper";
import { TokenContext } from "../../context/context";
import CurrencyModal from "../CurrencyModal/CurrencyModal";
import ArrowDownIcon from "../Icons/ArrowDownIcon";
import LoadingIcon from "../Icons/LoadingIcon";

export default function CurrencySelector(props) {
  const {
    label,
    chosenAddress,
    otherChosenAddress,
    setChosenTokenAddress,
    setOtherChosenTokenAddress,
    findingPair,
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
            <>
              <div>
                <button
                  className="w-full flex gap-1 justify-between items-center border p-1"
                  onClick={() => {
                    handleModal();
                  }}
                >
                  <p className="flex gap-2 items-center">
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
