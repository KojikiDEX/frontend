import React from "react";
import { Typography } from "@material-tailwind/react";
import xsakeSymbol from "../../assets/img/icon/sake.png";
import fundsSymbol from "../../assets/img/icon/funds.png";
import fdvSymbol from "../../assets/img/icon/fdv.png";

export default function LaunchpadDetailFooter(props) {
  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between gap-5 my-10">
        <div className="w-full lg:w-1/3 flex flex-col border p-5 ">
          <div className="w-full flex flex-row mb-3 items-center mx-auto justify-start">
            {/* <img
              className="flex-none w-8 h-15 mr-2"
              src={xsakeSymbol}
              alt="chain"
            /> */}
            <span className="text-kojiki-blue">how pricing is established</span>
          </div>
          <p className="text-sm text-left mt-2">
            You can contribute ETH in exchange for SAKE tokens, which must be
            claimed within 24 hours of the sale's conclusion.
          </p>
          <p className="text-sm text-left mt-2">
            The tokens you receive will have the same monetary value as your
            original contribution.
          </p>
          <p className="text-sm text-left mt-2">
            13,000 SAKE (out of a total supply of 80,000) will be allocated for
            sale. Therefore, the final price will be:
          </p>
          <p className="text-center mt-4">{`Total $ raised / 13,000`}</p>
        </div>
        <div className="w-full lg:w-1/3 flex flex-col border p-5 ">
          <div className="w-full flex flex-row mb-3 items-center mx-auto justify-start">
            {/* <img
              className="flex-none w-8 h-15 mr-2"
              src={fundsSymbol}
              alt="chain"
            /> */}
            <span className="text-kojiki-blue">refer to acquire</span>
          </div>
          <p className="text-sm text-left mt-2">
            Every user has access to a referral link that he can share publicly
            and earn 3% (in ETH) of all investments referred via that link.
          </p>
          <p className="text-sm text-left mt-2">
            This 3% commission will be transferred directly to his pocketbook as
            soon as the referred player makes a deposit.
          </p>
          <p className="text-sm text-left mt-2">
            This will have no effect on the referred user's contribution, who
            will receive the same number of SAKE tokens regardless of whether
            they used a referral link.
          </p>
        </div>
        <div className="w-full lg:w-1/3 flex flex-col border p-5 ">
          <div className="w-full flex flex-row mb-3 items-center mx-auto justify-start">
            {/* <img
              className="flex-none w-8 h-15 mr-2"
              src={fdvSymbol}
              alt="chain"
            /> */}
            <span className="text-kojiki-blue">claiming procedure</span>
          </div>
          <p className="text-sm text-left mt-2">
            The public sale will start on August 1 at 9:00 pm UTC and conclude
            on August 2 at 9:00 pm UTC.
          </p>
          <p className="text-sm text-left mt-2">
            The purchased tokens will be wholly and directly claimable from this
            page beginning on August 2 at 9:00 PM UTC, simultaneously with the
            start of trading.
          </p>
          <p className="text-sm text-left mt-2">
            In order to achieve Kojiki's long-term goals, 40% of the sale will
            be distributed in xSAKE and 60% in SAKE.
          </p>
        </div>
      </div>
      {/* <div className="w-full mb-10">
                <Typography as="p" variant="small" className="text-left mt-2">
                    {`Kojiki is a suite of decentralized contracts built to support BASE native builders. As a permissionless protocol, Kojiki bears no responsibility for any tokens purchased using its contracts.
                    All users are taking full responsibility that they are aware of the relevant risks involved, and that they are participating for a token that is completely independent and not associated with Kojiki in
                    any way. Social media posts and visible information on the Kojiki app in no way counts as an endorsement of a protocol by the Kojiki team, and nothing posted or shared in any Kojiki media is
                    a recommendation or financial advice.`}
                </Typography>
            </div> */}
    </>
  );
}
