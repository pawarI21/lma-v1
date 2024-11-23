import { useCallback, useEffect, useState } from 'react';
import { generateClient, GraphQLSubscription } from 'aws-amplify/api';
import { ITranscript, ITranscriptSegment, subscriptionQuery } from './schema';
import { cloneDeep } from 'lodash';

// function generateDummyTranscriptSegments(length: number) {
// 	const getRandomString = (prefix: string, length = 6) =>
// 		prefix +
// 		Math.random()
// 			.toString(36)
// 			.substring(2, 2 + length);

// 	const getRandomSentimentScore = () => ({
// 		Positive: Math.random(),
// 		Negative: Math.random(),
// 		Neutral: Math.random(),
// 		Mixed: Math.random(),
// 	});

// 	// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 	const generateWeightedScore = (scores: any) =>
// 		scores.Positive * 0.5 + scores.Negative * -0.5 + scores.Neutral * 0.2 + scores.Mixed * 0.1;

// 	const dummyData: ITranscriptSegment[] = [];

// 	for (let i = 0; i < length; i++) {
// 		const sentimentScores = getRandomSentimentScore();
// 		const sentimentWeighted = generateWeightedScore(sentimentScores);
// 		dummyData.push({
// 			PK: getRandomString('PK_'),
// 			SK: getRandomString('SK_'),
// 			CreatedAt: new Date().toISOString(),
// 			CallId: getRandomString('Call_'),
// 			SegmentId: getRandomString('Seg_'),
// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 			StartTime: (Math.random() * 6000) as any,
// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
// 			EndTime: (Math.random() * 6000) as any,
// 			Speaker: `Speaker_${Math.floor(Math.random() * 10) + 1}`,
// 			Transcript: `This is a sample transcript for segment ${i + 1}`,
// 			IsPartial: Math.random() < 0.5,
// 			Channel: 'AGENT',
// 			Owner: Math.random() < 0.5 ? getRandomString('Owner_') : undefined,
// 			SharedWith: Math.random() < 0.5 ? [`User_${Math.floor(Math.random() * 10) + 1}`] : [],
// 			Sentiment: ['Positive', 'Negative', 'Neutral', 'Mixed'][Math.floor(Math.random() * 4)],
// 			SentimentScore: sentimentScores,
// 			SentimentWeighted: sentimentWeighted,
// 		});
// 	}

// 	return dummyData;
// }

export const useLiveTranscript = (callId?: string) => {
	const [list, setList] = useState<ITranscriptSegment[]>([]);

	const handleCallTranscriptSegmentMessage = useCallback(
		(transcriptSegment: ITranscriptSegment) => {
			setList((previousList) => {
				const newMatchList: ITranscriptSegment[] = [];
				const newUnMatchList: ITranscriptSegment[] = [];

				previousList.forEach((item) => {
					if (item.SegmentId === transcriptSegment.SegmentId) {
						newMatchList.push(item);
					} else {
						newUnMatchList.push(item);
					}
				});

				const lastMatchRecord = newMatchList.pop();
				const shouldReplaceLastItem =
					(lastMatchRecord?.IsPartial === false && transcriptSegment?.IsPartial === true) ||
					(lastMatchRecord?.IsPartial === false && lastMatchRecord?.Sentiment);

				return [
					...cloneDeep(newUnMatchList),
					// avoid overwriting a final segment or one with sentiment with a late arriving segment
					shouldReplaceLastItem ? lastMatchRecord : transcriptSegment,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				].sort((a, b) => (new Date(a.CreatedAt) as any) - (new Date(b.CreatedAt) as any));
			});
		},
		[setList]
	);

	useEffect(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let subscription: any = null;

		if (!callId) {
			// the component should set the live transcript contact id to null to unsubscribe
			if (subscription?.unsubscribe) {
				subscription.unsubscribe();
			}
			return;
		}
		const client = generateClient();

		subscription = client
			.graphql<GraphQLSubscription<ITranscript>>({
				query: subscriptionQuery,
				variables: { callId },
			})
			.subscribe({
				next: async ({ data }) => {
					const transcriptSegmentValue = data?.onAddTranscriptSegment;
					if (!transcriptSegmentValue) {
						return;
					}
					if (callId !== transcriptSegmentValue.CallId) {
						return;
					}
					if (transcriptSegmentValue.Transcript && transcriptSegmentValue.SegmentId) {
						handleCallTranscriptSegmentMessage(transcriptSegmentValue);
					}
				},
				error: (error) => {
					console.log(error);
					// setErrorMessage('transcript update network subscription failed - please reload the page');
				},
			});

		return () => {
			console.log('unsubscribed from transcript segments');
			subscription.unsubscribe();
		};
	}, [callId]);

	return list;
};
