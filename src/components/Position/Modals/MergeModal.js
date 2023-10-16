import React, { useState, useEffect } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import LoadingIcon from "../../Icons/LoadingIcon";
import ThumbUpIcon from "../../Icons/ThumbUpIcon";
import LockIcon from "../../Icons/LockIcon";
import RocketIcon from "../../Icons/RocketIcon";
import FireIcon from "../../Icons/FireIcon";
import CheckIcon from "../../Icons/CheckIcon";

import { useWeb3React } from "@web3-react/core";
import { useAssetsPricesInLP } from "../../../hooks/useKojikiContext";
import { BigNumber } from "ethers";
import { formatUnits } from "../../../hooks/contractHelper";

import {
  getWeb3Contract,
  MulticallContractWeb3,
} from "../../../hooks/contractHelper";

import { CHAIN_ID } from "../../../hooks/connectors";
import nftPoolABI from "../../../assets/abi/NFTPool.json";
import IKojikiPairABI from "../../../assets/abi/IKojikiSwapPair.json";

export default function MergeModal(props) {
  const { openModal, handleModal, positionData, mergePositions } = props;

  const [loading, setLoading] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const [checkStatus, setCheckStatus] = useState([]);
  const [positions, setPositions] = useState([]);
  const checkPosition = (index, tokenID) => {
    if (index === -1) {
      setCheckStatus([]);
      setPositions([]);
      return;
    }

    let tStatus = [...checkStatus];
    let tPositions = [...positions];
    if (tStatus[index] === undefined || tStatus[index] === false) {
      tStatus[index] = true;
      tPositions[index] = tokenID;
    } else {
      tStatus[index] = false;
      tPositions.splice(index, 1);
    }
    setCheckStatus(tStatus);
    setPositions(tPositions);
  };

  const { account } = useWeb3React();
  const [tokenIDs, setTokenIDs] = useState([]);
  const [tokenIDsForData, setTokenIDsForData] = useState([]);

  const priceOfLPs = useAssetsPricesInLP();

  useEffect(() => {
    if (!account) {
      return;
    }

    (async () => {
      const nftPoolContract = getWeb3Contract(
        nftPoolABI,
        positionData.poolAddr,
        CHAIN_ID
      );
      const userNFTBalance = await nftPoolContract.methods
        .balanceOf(account)
        .call();

      const tokenIDs = [];

      for (let i = 0; i < userNFTBalance; i++) {
        const tokenId = await nftPoolContract.methods
          .tokenOfOwnerByIndex(account, i)
          .call();
        tokenIDs.push(tokenId);
      }
      setTokenIDs(tokenIDs);
    })();
  }, [account]);

  useEffect(() => {
    if (tokenIDs.length === 0) {
      return;
    }
    if (!account) {
      return;
    }
    if (
      Object.values(priceOfLPs).length === 0 &&
      priceOfLPs.constructor === Object
    ) {
      return;
    }

    (async () => {
      const mc = MulticallContractWeb3(CHAIN_ID);

      const nftPoolContract = getWeb3Contract(
        nftPoolABI,
        positionData.poolAddr,
        CHAIN_ID
      );
      const lpPair = getWeb3Contract(
        IKojikiPairABI,
        positionData.lpToken,
        CHAIN_ID
      );
      const poolRows = [];
      poolRows.push(lpPair.methods.totalSupply());
      for (let id of tokenIDs) {
        poolRows.push(nftPoolContract.methods.getStakingPosition(id));
      }

      const poolInfo = await mc.aggregate(poolRows);
      const tokenIDsForData = [];
      for (let i = 0; i < tokenIDs.length; i++) {
        tokenIDsForData.push({
          tokenID: tokenIDs[i],
          amount: poolInfo[i + 1][0],
          amountInUSD: BigNumber.from(poolInfo[i + 1][0])
            .mul(priceOfLPs[positionData.poolAddr])
            .div(poolInfo[0]),
        });
      }

      setTokenIDsForData(tokenIDsForData);
    })();
  }, [account, tokenIDs, priceOfLPs]);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={() => handleModal(!openModal)}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">merge positions</span>
        </DialogHeader>
        <DialogBody>
          {loading != 0 && (
            <div className="absolute flex justify-center items-center w-full h-full -ml-4">
              <div role="status">
                <LoadingIcon />
              </div>
              <p>loading ...</p>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <div>
              <p>select positions</p>
              <p>{positionData.symbol}</p>
            </div>
            <button
              className="default-outline"
              onClick={(e) => checkPosition(-1)}
            >
              unselect all
            </button>
          </div>
          <div className="grid gap-1">
            {tokenIDsForData.map((value, index) => (
              <div
                className="flex justify-between items-center border p-2 hover:cursor-pointer"
                key={index}
                onClick={(e) => checkPosition(index, value.tokenID)}
              >
                <div>
                  <p>#id-{value.tokenID}</p>
                </div>
                <div>
                  <p>{formatUnits(value.amount, 18).toFixed(3)}</p>
                  <p className="text-sm">
                    ${formatUnits(value.amountInUSD, 6).toFixed(3)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <ThumbUpIcon color="#4f8fea" />
                  <LockIcon />
                  <RocketIcon color="#4f8fea" />
                  <FireIcon />
                </div>
                <div className="min-w-[20px]">
                  {checkStatus[index] === true && <CheckIcon />}
                </div>
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() => {
                if (!confirming) {
                  mergePositions(
                    positionData.poolAddr,
                    positions,
                    0,
                    setConfirming
                  );
                }
              }}
            >
              {confirming ? "confirming..." : "merge"}
            </button>
          </div>
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() => handleModal(false)}
            >
              cancel
            </button>
          </div>
        </DialogFooter>
      </Dialog>
    </React.Fragment>
  );
}
