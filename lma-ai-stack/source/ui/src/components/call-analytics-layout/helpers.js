import { CALL_LIST_SHARDS_PER_DAY, PERIODS_TO_LOAD_STORAGE_KEY } from '../call-list/config';

export const getInitialPeriodsToLoad = () => {
  // default to 2 hours - half of one (4hr) shard period
  let periods = 0.5;
  try {
    const periodsFromStorage = Math.abs(JSON.parse(localStorage.getItem(PERIODS_TO_LOAD_STORAGE_KEY)));
    // prettier-ignore
    if (
        !Number.isSafeInteger(periodsFromStorage)
        // load max of to 30 days
        || periodsFromStorage > CALL_LIST_SHARDS_PER_DAY * 30
      ) {
        //
      } else {
        periods = (periodsFromStorage > 0) ? periodsFromStorage : periods;
        localStorage.setItem(PERIODS_TO_LOAD_STORAGE_KEY, JSON.stringify(periods));
      }
  } catch {
    //
  }

  return periods;
};
