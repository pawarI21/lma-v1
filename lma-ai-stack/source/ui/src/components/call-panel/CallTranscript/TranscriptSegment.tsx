import { useMemo } from 'react';
import { getSentimentImage } from './getSentimentImage';
import { TranscriptContent } from './TranscriptContent';
import { getTimestampFromSeconds } from './helpers';
import { Avatar, AvatarFallback } from 'components/ui/avatar';

const getDisplayChannel = (channel: string, speaker?: string) => {
  if (channel === 'AGENT' || channel === 'CALLER') {
    return `${speaker}`.trim();
  } else if (channel === 'AGENT_ASSISTANT' || channel === 'MEETING_ASSISTANT') {
    return 'MEETING_ASSISTANT';
  }

  return `${channel}`;
};

export const TranscriptSegment = ({ segment, translateCache, enableSentimentAnalysis }: any) => {
  const { channel } = segment;

  if (channel === 'CATEGORY_MATCH') {
    const categoryText = `${segment.transcript}`;
    const newSegment = segment;
    newSegment.transcript = categoryText;
    // We will return a special version of the grid that's specifically only for category.
    return (
      <div className="flex flex-row gap-2 md:gap-6">
        <div className="flex flex-col items-center gap-2">{getSentimentImage(segment, enableSentimentAnalysis)}</div>
        <div className="flex-1">
          <div className="flex flex-row flex-wrap gap-1"></div>
          <TranscriptContent segment={newSegment} translateCache={translateCache} />
        </div>
      </div>
    );
  }

  const displayChannel = useMemo(() => getDisplayChannel(channel, segment.speaker), [channel, segment.speaker]);
  const time = useMemo(() => {
    const startTime = getTimestampFromSeconds(segment.startTime);
    // const endTime = getTimestampFromSeconds(segment.endTime);

    return startTime ? `${startTime} ` : '';
  }, [segment.startTime]);

  return (
    <div className="border-b pb-2 mb-5">
      <div className="flex flex-row gap-2 md:gap-6">
        <div className="flex flex-col items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="uppercase text-xs text-gray-800">{displayChannel?.[0]}</AvatarFallback>
          </Avatar>
          <p className="text-[10px] leading-4 font-medium text-gray-400 w-11 text-center">{time}</p>
        </div>
        <div className="flex-1">
          <div className="flex flex-row flex-wrap gap-1">
            <p className="text-sm capitalize font-medium text-gray-700 font-satoshi">{displayChannel}</p>
            {getSentimentImage(segment, enableSentimentAnalysis)}
          </div>
          <TranscriptContent segment={segment} translateCache={translateCache} />
        </div>
      </div>
    </div>
  );
};
