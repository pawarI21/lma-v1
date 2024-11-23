import { COMPREHEND_PII_TYPES } from 'components/common/constants';

// comprehend PII types
export const piiTypesSplitRegEx = new RegExp(`\\[(${COMPREHEND_PII_TYPES.join('|')})\\]`);

export const PAUSE_TO_MERGE_IN_SECONDS = 1;

/**
 * Check whether the current segment should be merged to the previous segment to get better
 * user experience. The conditions for merge are:
 * - Same speaker
 * - Same channel
 * - The gap between two segments is less than PAUSE_TO_MERGE_IN_SECONDS second
 * - Add language code check if available
 * TODO: Check language code once it is returned
 * @param previous previous segment
 * @param current current segment
 * @returns {boolean} indicates whether to merge or not
 */
export const shouldAppendToPreviousSegment = ({ previous, current }: any) =>
  // prettier-ignore
  // eslint-disable-next-line implicit-arrow-linebreak
  previous.speaker === current.speaker
    && previous.channel === current.channel
    && current.startTime - previous.endTime < PAUSE_TO_MERGE_IN_SECONDS;

/**
 * Append current segment to its previous segment
 * @param previous previous segment
 * @param current current segment
 */
export const appendToPreviousSegment = ({ previous, current }: any) => {
  /* eslint-disable no-param-reassign */
  previous.transcript += ` ${current.transcript}`;
  previous.endTime = current.endTime;
  previous.isPartial = current.isPartial;
};

export const getTimestampFromSeconds = (secs: any) => {
  if (!secs || Number.isNaN(secs)) {
    return '';
  }
  return new Date(secs * 1000).toISOString().substr(14, 7);
};
