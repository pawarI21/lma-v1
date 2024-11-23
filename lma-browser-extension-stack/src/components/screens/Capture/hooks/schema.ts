import gql from 'graphql-tag';

export const subscriptionQuery = gql`
	subscription Subscription($callId: ID) {
		onAddTranscriptSegment(CallId: $callId) {
			PK
			SK
			CreatedAt
			CallId
			SegmentId
			StartTime
			EndTime
			Speaker
			Transcript
			IsPartial
			Channel
			Owner
			SharedWith
			Sentiment
			SentimentScore {
				Positive
				Negative
				Neutral
				Mixed
			}
			SentimentWeighted
		}
	}
`;

export type ITranscriptSegment = {
	PK: string;
	SK: string;
	CreatedAt: string;
	CallId: string;
	SegmentId: string;
	StartTime: string;
	EndTime: string;
	Speaker: string;
	Transcript: string;
	IsPartial: boolean;
	Channel: string;
	Owner?: string;
	SharedWith?: string[];
	Sentiment?: string;
	SentimentScore?: {
		Positive: number;
		Negative: number;
		Neutral: number;
		Mixed: number;
	};
	SentimentWeighted?: number;
};
export interface ITranscript {
	onAddTranscriptSegment: ITranscriptSegment;
}
