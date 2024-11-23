import { TranslateTextCommand } from '@aws-sdk/client-translate';
import { Logger } from 'aws-amplify';
import { IN_PROGRESS_STATUS } from 'components/common/get-recording-status';
import { useEffect, useRef, useState } from 'react';
import { appendToPreviousSegment, shouldAppendToPreviousSegment } from './helpers';
import { DEFAULT_OTHER_SPEAKER_NAME } from 'components/common/constants';
import { TranscriptSegment } from './TranscriptSegment';

const logger = new Logger('CallPanel');

export const CallInProgressTranscript = ({
  item,
  callTranscriptPerCallId,
  autoScroll,
  translateClient,
  targetLanguage,
  agentTranscript,
  translateOn,
  enableSentimentAnalysis,
}: any) => {
  const bottomRef = useRef<any>();
  const [turnByTurnSegments, setTurnByTurnSegments] = useState<any>([]);
  const [translateCache, setTranslateCache] = useState<any>({});
  const [cacheSeen, setCacheSeen] = useState<any>({});
  const [lastUpdated, setLastUpdated] = useState<any>(Date.now());
  const [updateFlag, setUpdateFlag] = useState<boolean>(false);

  // channels: AGENT, AGENT_ASSIST, CALLER, CATEGORY_MATCH,
  // AGENT_VOICETONE, CALLER_VOICETONE
  const maxChannels = 6;
  const { callId } = item;
  const transcriptsForThisCallId = callTranscriptPerCallId[callId] || {};
  const transcriptChannels = Object.keys(transcriptsForThisCallId).slice(0, maxChannels);

  const getSegments = () => {
    const currentTurnByTurnSegments = transcriptChannels
      .map((c) => {
        const { segments } = transcriptsForThisCallId[c];
        return segments;
      })
      // sort entries by end time
      .reduce((p, c) => [...p, ...c].sort((a, b) => a.endTime - b.endTime), [])
      .map((c: any) => {
        const t = c;
        return t;
      });

    return currentTurnByTurnSegments;
  };

  const updateTranslateCache = (seg: any) => {
    const promises = [];
    // prettier-ignore
    for (let i = 0; i < seg.length; i += 1) {
        const k = seg[i].segmentId.concat('-', targetLanguage);
  
        // prettier-ignore
        if (translateCache[k] === undefined) {
          // Now call translate API
          const params = {
            Text: seg[i].transcript,
            SourceLanguageCode: 'auto',
            TargetLanguageCode: targetLanguage,
          };
          const command = new TranslateTextCommand(params);
  
          logger.debug('Translate API being invoked for:', seg[i].transcript, targetLanguage);
  
          promises.push(
            translateClient.send(command).then(
              (data:any) => {
                const n:any = {};
                logger.debug('Translate API response:', seg[i].transcript, targetLanguage, data.TranslatedText);
                n[k] = { cacheId: k, transcript: seg[i].transcript, translated: data.TranslatedText };
                return n;
              },
              (error:any) => {
                logger.debug('Error from translate:', error);
              },
            ),
          );
        }
      }
    return promises;
  };

  // Translate all segments when the call is completed.
  useEffect(() => {
    if (translateOn && targetLanguage !== '' && item.recordingStatusLabel !== IN_PROGRESS_STATUS) {
      const promises = updateTranslateCache(getSegments());
      Promise.all(promises).then((results) => {
        // prettier-ignore
        if (results.length > 0) {
            setTranslateCache((state:any) => ({
              ...state,
              ...results.reduce((a, b) => ({ ...a, ...b })),
            }));
            setUpdateFlag((state) => !state);
          }
      });
    }
  }, [targetLanguage, agentTranscript, translateOn, item.recordingStatusLabel]);

  // Translate real-time segments when the call is in progress.
  useEffect(() => {
    const handleTranslate = async () => {
      const c = getSegments();
      // prettier-ignore
      if (
          translateOn
          && targetLanguage !== ''
          && c.length > 0
          && item.recordingStatusLabel === IN_PROGRESS_STATUS
        ) {
          const k = c[c.length - 1].segmentId.concat('-', targetLanguage);
          const n:any = {};
          if (c[c.length - 1].isPartial === false && cacheSeen[k] === undefined) {
            n[k] = { seen: true };
            setCacheSeen((state:any) => ({
              ...state,
              ...n,
            }));
    
            // prettier-ignore
            if (translateCache[k] === undefined) {
              // Now call translate API
              const params = {
                Text: c[c.length - 1].transcript,
                SourceLanguageCode: 'auto',
                TargetLanguageCode: targetLanguage,
              };
              const command = new TranslateTextCommand(params);
    
              // logger.debug('Translate API being invoked for:', c[c.length - 1].transcript, targetLanguage);
    
              try {
                const data = await translateClient.send(command);
                const o:any = {};
                // logger.debug('Translate API response:', c[c.length - 1].transcript, data.TranslatedText);
                o[k] = {
                  cacheId: k,
                  transcript: c[c.length - 1].transcript,
                  translated: data.TranslatedText,
                };
                setTranslateCache((state:any) => ({
                  ...state,
                  ...o,
                }));
              } catch (error) {
                logger.debug('Error from translate:', error);
              }
            }
          }
          if (Date.now() - lastUpdated > 500) {
            setUpdateFlag((state) => !state);
            // logger.debug('Updating turn by turn with latest cache');
          }
        }
      setLastUpdated(Date.now());
    };

    handleTranslate();
  }, [callTranscriptPerCallId]);

  const getTurnByTurnSegments = () => {
    const currentTurnByTurnSegments = transcriptChannels
      .map((c) => {
        const { segments } = transcriptsForThisCallId[c];
        return segments;
      })
      // sort entries by end time
      .reduce((p, c) => [...p, ...c].sort((a, b) => a.endTime - b.endTime), [])
      .reduce((accumulator: any, current: any) => {
        if (
          // prettier-ignore
          !accumulator.length
            || !shouldAppendToPreviousSegment(
              { previous: accumulator[accumulator.length - 1], current },
            )
            // Enable it once it is compatible with translation
            || translateOn
        ) {
          // Get copy of current segment to avoid direct modification
          accumulator.push({ ...current });
        } else {
          appendToPreviousSegment({ previous: accumulator[accumulator.length - 1], current });
        }
        return accumulator;
      }, [])
      .map((c: any) => {
        const t = c;
        t.agentTranscript = agentTranscript;
        t.targetLanguage = targetLanguage;
        t.translateOn = translateOn;
        // In streaming audio the speaker will just be "Other participant", override this with the
        // name the user chose if needed
        if (t.speaker === DEFAULT_OTHER_SPEAKER_NAME || t.speaker === '') {
          t.speaker = item.callerPhoneNumber || DEFAULT_OTHER_SPEAKER_NAME;
        }

        return (
          t?.segmentId &&
          t?.createdAt &&
          (t.agentTranscript === undefined || t.agentTranscript || t.channel !== 'AGENT') &&
          t.channel !== 'AGENT_VOICETONE' &&
          t.channel !== 'CALLER_VOICETONE' && (
            <TranscriptSegment
              key={`${t.segmentId}-${t.createdAt}`}
              segment={t}
              translateCache={translateCache}
              enableSentimentAnalysis={enableSentimentAnalysis}
              participantName={item.callerPhoneNumber}
            />
          )
        );
      });

    // this element is used for scrolling to bottom and to provide padding
    currentTurnByTurnSegments.push(<div key="bottom" ref={bottomRef} />);
    return currentTurnByTurnSegments;
  };

  useEffect(() => {
    setTurnByTurnSegments(getTurnByTurnSegments);
  }, [callTranscriptPerCallId, item.recordingStatusLabel, targetLanguage, agentTranscript, translateOn, updateFlag]);

  useEffect(() => {
    // prettier-ignore
    if (
        item.recordingStatusLabel === IN_PROGRESS_STATUS
        && autoScroll
        && bottomRef.current?.scrollIntoView
      ) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
  }, [turnByTurnSegments, autoScroll, item.recordingStatusLabel, targetLanguage, agentTranscript, translateOn]);

  return <div>{turnByTurnSegments}</div>;
};
