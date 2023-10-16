import { GET_BLOCK, GET_BLOCKS, SHARE_VALUE } from "../apollo/queries";
import { client, blockClient } from "../apollo/client";
import dayjs from "dayjs";

export const timeframeOptions = {
  WEEK: "1 week",
  MONTH: "1 month",
  // THREE_MONTHS: '3 months',
  // YEAR: '1 year',
  HALF_YEAR: "6 months",
  ALL_TIME: "All time",
};

export const displayRemainTime = (seconds) => {
  if (seconds > 0) {
    // Calculating the days, hours, minutes and seconds left
    const timeDays = Math.floor(seconds / (60 * 60 * 24));
    const timeHours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const timeMinutes = Math.floor((seconds % (60 * 60)) / 60);
    const timeSeconds = Math.floor(seconds % 60);

    if (timeDays > 0) {
      return `${timeDays}d ${timeHours}h ${timeMinutes}m ${timeSeconds}s`;
    } else if (timeHours > 0) {
      return `${timeHours}h ${timeMinutes}m ${timeSeconds}s`;
    } else if (timeMinutes > 0) {
      return `${timeMinutes}m ${timeSeconds}s`;
    } else if (timeSeconds > 0) {
      return `${timeSeconds}s`;
    }
  }

  return `--`;
};

export const displayTimeAmount = (seconds) => {
  let retString = "";
  if (seconds > 0) {
    // Calculating the days, hours, minutes and seconds left
    const timeDays = Math.floor(seconds / (60 * 60 * 24));
    const timeHours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const timeMinutes = Math.floor((seconds % (60 * 60)) / 60);
    const timeSeconds = Math.floor(seconds % 60);

    if (timeDays > 0) {
      retString = `${timeDays} Days`;
    }
    if (timeHours > 0) {
      retString = `${retString} ${timeHours} Hours`;
    }
    if (timeMinutes > 0) {
      retString = `${retString} ${timeMinutes} Minutes`;
    }
    if (timeSeconds > 0) {
      retString = `${retString} ${timeSeconds} Seconds`;
    }
    return retString;
  }

  return `--`;
};

export function boostMultiplier(value) {
  if (value < 0) return "1.00";
  return ((value + 10000) / 10000).toFixed(4);
}

/**
 * get standard percent change between two values
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 */
export const getPercentChange = (valueNow, value24HoursAgo) => {
  const adjustedPercentChange =
    ((parseFloat(valueNow) - parseFloat(value24HoursAgo)) /
      parseFloat(value24HoursAgo)) *
    100;
  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return 0;
  }
  return adjustedPercentChange;
};

/**
 * gets the amoutn difference plus the % change in change itself (second order change)
 * @param {*} valueNow
 * @param {*} value24HoursAgo
 * @param {*} value48HoursAgo
 */
export const get2DayPercentChange = (
  valueNow,
  value24HoursAgo,
  value48HoursAgo
) => {
  // get volume info for both 24 hour periods
  let currentChange = parseFloat(valueNow) - parseFloat(value24HoursAgo);
  let previousChange =
    parseFloat(value24HoursAgo) - parseFloat(value48HoursAgo);

  const adjustedPercentChange =
    (parseFloat(currentChange - previousChange) / parseFloat(previousChange)) *
    100;

  if (isNaN(adjustedPercentChange) || !isFinite(adjustedPercentChange)) {
    return [currentChange, 0];
  }
  return [currentChange, adjustedPercentChange];
};

/**
 * @notice Fetches block objects for an array of timestamps.
 * @dev blocks are returned in chronological order (ASC) regardless of input.
 * @dev blocks are returned at string representations of Int
 * @dev timestamps are returns as they were provided; not the block time.
 * @param {Array} timestamps
 */
export async function getBlocksFromTimestamps(timestamps, skipCount = 500) {
  if (timestamps?.length === 0) {
    return [];
  }

  let fetchedData = await splitQuery(
    GET_BLOCKS,
    blockClient,
    [],
    timestamps,
    skipCount
  );

  let blocks = [];
  if (fetchedData) {
    for (var t in fetchedData) {
      if (fetchedData[t].length > 0) {
        blocks.push({
          timestamp: t.split("t")[1],
          number: fetchedData[t][0]["number"],
        });
      }
    }
  }
  return blocks;
}

/**
 * @notice Fetches first block after a given timestamp
 * @dev Query speed is optimized by limiting to a 600-second period
 * @param {Int} timestamp in seconds
 */
export async function getBlockFromTimestamp(timestamp) {
  let result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600,
    },
    fetchPolicy: "cache-first",
  });
  return result?.data?.blocks?.[0]?.number;
}

export function getTimeframe(timeWindow) {
  const utcEndTime = dayjs.utc();
  // based on window, get starttime
  let utcStartTime;
  switch (timeWindow) {
    case timeframeOptions.WEEK:
      utcStartTime = utcEndTime.subtract(1, "week").endOf("day").unix() - 1;
      break;
    case timeframeOptions.MONTH:
      utcStartTime = utcEndTime.subtract(1, "month").endOf("day").unix() - 1;
      break;
    case timeframeOptions.ALL_TIME:
      utcStartTime = utcEndTime.subtract(1, "year").endOf("day").unix() - 1;
      break;
    default:
      utcStartTime = utcEndTime.subtract(1, "year").startOf("year").unix() - 1;
      break;
  }
  return utcStartTime;
}

export async function splitQuery(
  query,
  localClient,
  vars,
  list,
  skipCount = 100
) {
  let fetchedData = {};
  let allFound = false;
  let skip = 0;

  while (!allFound) {
    let end = list.length;
    if (skip + skipCount < list.length) {
      end = skip + skipCount;
    }
    let sliced = list.slice(skip, end);
    let result = await localClient.query({
      query: query(...vars, sliced),
      fetchPolicy: "cache-first",
    });
    fetchedData = {
      ...fetchedData,
      ...result.data,
    };
    if (
      Object.keys(result.data).length < skipCount ||
      skip + skipCount > list.length
    ) {
      allFound = true;
    } else {
      skip += skipCount;
    }
  }

  return fetchedData;
}
