import { getWeightedSentimentLabel } from 'components/common/sentiment';
import { SentimentIcon } from 'components/sentiment-icon/SentimentIcon';
import { Popover, PopoverArrow, PopoverContent, PopoverTrigger } from 'components/ui/popover';

export const getSentimentImage = (segment: any, enableSentimentAnalysis: any) => {
  const { sentiment, sentimentScore, sentimentWeighted } = segment;
  if (!sentiment || !enableSentimentAnalysis) {
    // returns an empty div to maintain spacing
    return <div className="sentiment-image" />;
  }

  const weightedSentimentLabel = getWeightedSentimentLabel(sentimentWeighted);
  return (
    <Popover>
      <PopoverTrigger>
        <div className="cursor-pointer">
          <SentimentIcon sentiment={weightedSentimentLabel} />
        </div>
      </PopoverTrigger>
      <PopoverContent side="right">
        <div className="text-sm font-normal text-gray-700 mb-3">
          <p className="font-medium">Sentiment</p>
          <p>{sentiment}</p>
        </div>

        <div className="text-sm font-normal text-gray-700 mb-3">
          <p className="font-medium">Sentiment Scores</p>
          <p>{JSON.stringify(sentimentScore)}</p>
        </div>

        <div className="text-sm font-normal text-gray-700">
          <p className="font-medium">Weighted Sentiment</p>
          <p>{sentimentWeighted}</p>
        </div>
        <PopoverArrow className="fill-gray-300" />
      </PopoverContent>
    </Popover>
  );
};
