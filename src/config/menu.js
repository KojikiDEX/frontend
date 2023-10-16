export const menuItems = [
  {
    label: "swap",
    link: "/swap",
  },
  {
    label: "pool",
    subMenu: [
      {
        label: "pools",
        link: "/pools",
      },
      {
        label: "positions",
        link: "/positions",
      },
      {
        label: "wizard",
        link: "/wizard",
      },
    ],
  },
  // {
  //   label: "liquidity",
  //   link: "/liquidity",
  // },
  {
    label: "earn",
    subMenu: [
      {
        label: "my positions",
        link: "/my-positions",
      },
      {
        label: "yield farms",
        link: "/yield-farms",
      },
      {
        label: "raito pools",
        link: "/raito-pools",
      },
      // {
      //   label: "Core farming pools",
      //   link: "/core-pools",
      // },
    ],
  },
  {
    label: "xSAKE",
    subMenu: [
      {
        label: "xSAKE",
        link: "/xsake",
      },
      {
        label: "dividends",
        link: "/xsake/dividends",
      },
      {
        label: "launchpad",
        link: "/xsake/launchpad",
      },
      {
        label: "yield booster",
        link: "/xsake/yieldbooster",
      },
    ],
  },
  {
    label: "launchpad",
    link: "/launchpad",
  },
  {
    label: "bridge",
    link: "https://stargate.finance/transfer",
    target: "_blank",
  },
];
