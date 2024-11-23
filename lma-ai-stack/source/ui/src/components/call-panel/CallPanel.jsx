import React, { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Box,
  ButtonDropdown,
  ColumnLayout,
  Container,
  Grid,
  Header,
  Icon,
  Link,
  Popover,
  SpaceBetween,
  TextContent,
  Toggle,
} from '@awsui/components-react';
import rehypeRaw from 'rehype-raw';
import ReactMarkdown from 'react-markdown';
import { TranslateTextCommand } from '@aws-sdk/client-translate';
import { Logger } from 'aws-amplify';
import { COMPREHEND_PII_TYPES, DEFAULT_OTHER_SPEAKER_NAME, LANGUAGE_CODES } from '../common/constants';

import useSettingsContext from '../../contexts/settings';

import { DONE_STATUS, IN_PROGRESS_STATUS } from '../common/get-recording-status';
import { InfoLink } from '../common/info-link';
import { getWeightedSentimentLabel } from '../common/sentiment';

import './CallPanel.css';
import { SentimentIcon } from '../sentiment-icon/SentimentIcon';
import { downloadTranscriptAsExcel, downloadTranscriptAsText } from '../common/download-func';

const logger = new Logger('CallPanel');

// comprehend PII types
const piiTypesSplitRegEx = new RegExp(`\\[(${COMPREHEND_PII_TYPES.join('|')})\\]`);

const PAUSE_TO_MERGE_IN_SECONDS = 1;

const getSentimentImage = (segment, enableSentimentAnalysis) => {
  const { sentiment, sentimentScore, sentimentWeighted } = segment;
  if (!sentiment || !enableSentimentAnalysis) {
    // returns an empty div to maintain spacing
    return <div className="sentiment-image" />;
  }
  const weightedSentimentLabel = getWeightedSentimentLabel(sentimentWeighted);
  return (
    <Popover
      dismissAriaLabel="Close"
      header="Sentiment"
      size="medium"
      triggerType="custom"
      content={
        <SpaceBetween size="s">
          <div>
            <Box margin={{ bottom: 'xxxs' }} color="text-label">
              Sentiment
            </Box>
            <div>{sentiment}</div>
          </div>
          <div>
            <Box margin={{ bottom: 'xxxs' }} color="text-label">
              Sentiment Scores
            </Box>
            <div>{JSON.stringify(sentimentScore)}</div>
          </div>
          <div>
            <Box margin={{ bottom: 'xxxs' }} color="text-label">
              Weighted Sentiment
            </Box>
            <div>{sentimentWeighted}</div>
          </div>
        </SpaceBetween>
      }
    >
      <div className="sentiment-image-popover">
        <SentimentIcon sentiment={weightedSentimentLabel} />
      </div>
    </Popover>
  );
};

const getTimestampFromSeconds = (secs) => {
  if (!secs || Number.isNaN(secs)) {
    return '00:00.0';
  }
  return new Date(secs * 1000).toISOString().substr(14, 7);
};

const TranscriptContent = ({ segment, translateCache }) => {
  const { settings } = useSettingsContext();
  const regex = settings?.CategoryAlertRegex ?? '.*';

  const { transcript, segmentId, channel, targetLanguage, translateOn } = segment;

  const k = segmentId.concat('-', targetLanguage);

  // prettier-ignore
  const currTranslated = translateOn
    && targetLanguage !== ''
    && translateCache[k] !== undefined
    && translateCache[k].translated !== undefined
    ? translateCache[k].translated
    : '';

  const result = currTranslated !== undefined ? currTranslated : '';

  const transcriptPiiSplit = transcript.split(piiTypesSplitRegEx);

  const transcriptComponents = transcriptPiiSplit.map((t, i) => {
    if (COMPREHEND_PII_TYPES.includes(t)) {
      // eslint-disable-next-line react/no-array-index-key
      return <Badge key={`${segmentId}-pii-${i}`} color="red">{`${t}`}</Badge>;
    }

    let className = '';
    let text = t;
    let translatedText = result;

    switch (channel) {
      case 'AGENT_ASSISTANT':
      case 'MEETING_ASSISTANT':
        className = 'transcript-segment-agent-assist';
        break;
      case 'AGENT':
      case 'CALLER':
        text = text.substring(text.indexOf(':') + 1).trim();
        translatedText = translatedText.substring(translatedText.indexOf(':') + 1).trim();
        break;
      case 'CATEGORY_MATCH':
        if (text.match(regex)) {
          className = 'transcript-segment-category-match-alert';
          text = `Alert: ${text}`;
        } else {
          className = 'transcript-segment-category-match';
          text = `Category: ${text}`;
        }
        break;
      default:
        break;
    }

    return (
      // prettier-ignore
      // eslint-disable-next-line react/no-array-index-key
      <TextContent key={`${segmentId}-text-${i}`} color="red" className={className}>
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{text.trim()}</ReactMarkdown>
        <ReactMarkdown className="translated-text" rehypePlugins={[rehypeRaw]}>{translatedText.trim()}</ReactMarkdown>
      </TextContent>
    );
  });

  return (
    <SpaceBetween direction="horizontal" size="xxs">
      {transcriptComponents}
    </SpaceBetween>
  );
};

const TranscriptSegment = ({ segment, translateCache, enableSentimentAnalysis }) => {
  const { channel } = segment;

  if (channel === 'CATEGORY_MATCH') {
    const categoryText = `${segment.transcript}`;
    const newSegment = segment;
    newSegment.transcript = categoryText;
    // We will return a special version of the grid that's specifically only for category.
    return (
      <Grid className="transcript-segment" disableGutters gridDefinition={[{ colspan: 1 }, { colspan: 10 }]}>
        {getSentimentImage(segment, enableSentimentAnalysis)}
        <SpaceBetween direction="vertical" size="xxs">
          <TranscriptContent segment={newSegment} translateCache={translateCache} />
        </SpaceBetween>
      </Grid>
    );
  }

  let displayChannel = `${segment.channel}`;
  let channelClass = '';

  if (channel === 'AGENT' || channel === 'CALLER') {
    displayChannel = `${segment.speaker}`.trim();
  } else if (channel === 'AGENT_ASSISTANT' || channel === 'MEETING_ASSISTANT') {
    displayChannel = 'MEETING_ASSISTANT';
    channelClass = 'transcript-segment-agent-assist';
  }

  return (
    <Grid className="transcript-segment" disableGutters gridDefinition={[{ colspan: 1 }, { colspan: 10 }]}>
      {getSentimentImage(segment, enableSentimentAnalysis)}
      <SpaceBetween direction="vertical" size="xxs" className={channelClass}>
        <SpaceBetween direction="horizontal" size="xs">
          <TextContent>
            <strong>{displayChannel}</strong>
          </TextContent>
          <TextContent>
            {`${getTimestampFromSeconds(segment.startTime)} -
              ${getTimestampFromSeconds(segment.endTime)}`}
          </TextContent>
        </SpaceBetween>
        <TranscriptContent segment={segment} translateCache={translateCache} />
      </SpaceBetween>
    </Grid>
  );
};

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
const shouldAppendToPreviousSegment = ({ previous, current }) =>
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
const appendToPreviousSegment = ({ previous, current }) => {
  /* eslint-disable no-param-reassign */
  previous.transcript += ` ${current.transcript}`;
  previous.endTime = current.endTime;
  previous.isPartial = current.isPartial;
};

const CallInProgressTranscript = ({
  item,
  callTranscriptPerCallId,
  autoScroll,
  translateClient,
  targetLanguage,
  agentTranscript,
  translateOn,
  collapseSentiment,
  enableSentimentAnalysis,
}) => {
  const bottomRef = useRef();
  const [turnByTurnSegments, setTurnByTurnSegments] = useState([]);
  const [translateCache, setTranslateCache] = useState({});
  const [cacheSeen, setCacheSeen] = useState({});
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [updateFlag, setUpdateFlag] = useState(false);

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
      .map((c) => {
        const t = c;
        return t;
      });

    return currentTurnByTurnSegments;
  };

  const updateTranslateCache = (seg) => {
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
            (data) => {
              const n = {};
              logger.debug('Translate API response:', seg[i].transcript, targetLanguage, data.TranslatedText);
              n[k] = { cacheId: k, transcript: seg[i].transcript, translated: data.TranslatedText };
              return n;
            },
            (error) => {
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
          setTranslateCache((state) => ({
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
        const n = {};
        if (c[c.length - 1].isPartial === false && cacheSeen[k] === undefined) {
          n[k] = { seen: true };
          setCacheSeen((state) => ({
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
  
            logger.debug('Translate API being invoked for:', c[c.length - 1].transcript, targetLanguage);
  
            try {
              const data = await translateClient.send(command);
              const o = {};
              logger.debug('Translate API response:', c[c.length - 1].transcript, data.TranslatedText);
              o[k] = {
                cacheId: k,
                transcript: c[c.length - 1].transcript,
                translated: data.TranslatedText,
              };
              setTranslateCache((state) => ({
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
          logger.debug('Updating turn by turn with latest cache');
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
      .reduce((accumulator, current) => {
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
      .map((c) => {
        const t = c;
        t.agentTranscript = agentTranscript;
        t.targetLanguage = targetLanguage;
        t.translateOn = translateOn;
        // In streaming audio the speaker will just be "Other participant", override this with the
        // name the user chose if needed
        if (t.speaker === DEFAULT_OTHER_SPEAKER_NAME || t.speaker === '') {
          t.speaker = item.callerPhoneNumber || DEFAULT_OTHER_SPEAKER_NAME;
        }

        return t;
      })
      .map(
        // prettier-ignore
        (s) => (
          s?.segmentId
          && s?.createdAt
          && (s.agentTranscript === undefined
            || s.agentTranscript || s.channel !== 'AGENT')
          && (s.channel !== 'AGENT_VOICETONE')
          && (s.channel !== 'CALLER_VOICETONE')
          && <TranscriptSegment
            key={`${s.segmentId}-${s.createdAt}`}
            segment={s}
            translateCache={translateCache}
            enableSentimentAnalysis={enableSentimentAnalysis}
            participantName={item.callerPhoneNumber}
          />
        ),
      );

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

  return (
    <div
      style={{
        overflowY: 'auto',
        maxHeight: collapseSentiment ? '34vh' : '68vh',
        paddingLeft: '10px',
        paddingTop: '5px',
        paddingRight: '10px',
      }}
    >
      <ColumnLayout borders="horizontal" columns={1}>
        {turnByTurnSegments}
      </ColumnLayout>
    </div>
  );
};

export const getAgentAssistPanel = (item, collapseSentiment) => {
  if (process.env.REACT_APP_ENABLE_LEX_AGENT_ASSIST === 'true') {
    return (
      <Container
        disableContentPaddings
        header={
          <Header
            variant="h4"
            info={
              <Link variant="info" target="_blank" href="https://amazon.com/live-meeting-assistant">
                Info
              </Link>
            }
          >
            Meeting Assist Bot
          </Header>
        }
      >
        <Box style={{ height: collapseSentiment ? '34vh' : '68vh' }}>
          <iframe
            style={{ border: '0px', height: collapseSentiment ? '34vh' : '68vh', margin: '0' }}
            title="Meeting Assist"
            src={`/index-lexwebui.html?callId=${item.callId}`}
            width="100%"
          />
        </Box>
      </Container>
    );
  }
  return null;
};
const getTranscriptContent = ({
  item,
  callTranscriptPerCallId,
  autoScroll,
  translateClient,
  targetLanguage,
  agentTranscript,
  translateOn,
  collapseSentiment,
  enableSentimentAnalysis,
}) => {
  switch (item.recordingStatusLabel) {
    case DONE_STATUS:
    case IN_PROGRESS_STATUS:
    default:
      return (
        <CallInProgressTranscript
          item={item}
          callTranscriptPerCallId={callTranscriptPerCallId}
          autoScroll={autoScroll}
          translateClient={translateClient}
          targetLanguage={targetLanguage}
          agentTranscript={agentTranscript}
          translateOn={translateOn}
          collapseSentiment={collapseSentiment}
          enableSentimentAnalysis={enableSentimentAnalysis}
        />
      );
  }
};

export const CallTranscriptContainer = ({
  setToolsOpen,
  item,
  callTranscriptPerCallId,
  translateClient,
  collapseSentiment,
  enableSentimentAnalysis,
}) => {
  // defaults to auto scroll when call is in progress
  const [autoScroll, setAutoScroll] = useState(item.recordingStatusLabel === IN_PROGRESS_STATUS);
  const [autoScrollDisabled, setAutoScrollDisabled] = useState(item.recordingStatusLabel !== IN_PROGRESS_STATUS);
  const [showDownloadTranscript, setShowDownloadTranscripts] = useState(item.recordingStatusLabel === DONE_STATUS);

  const [translateOn, setTranslateOn] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(localStorage.getItem('targetLanguage') || '');
  const [agentTranscript] = useState(true);

  const handleLanguageSelect = (event) => {
    setTargetLanguage(event.target.value);
    localStorage.setItem('targetLanguage', event.target.value);
  };

  useEffect(() => {
    setAutoScrollDisabled(item.recordingStatusLabel !== IN_PROGRESS_STATUS);
    setAutoScroll(item.recordingStatusLabel === IN_PROGRESS_STATUS);
    setShowDownloadTranscripts(item.recordingStatusLabel === DONE_STATUS);
  }, [item.recordingStatusLabel]);

  const languageChoices = () => {
    if (translateOn) {
      return (
        // prettier-ignore
        // eslint-disable-jsx-a11y/control-has-associated-label
        <div>
          <select value={targetLanguage} onChange={handleLanguageSelect}>
            {LANGUAGE_CODES.map(({ value, label }) => <option value={value}>{label}</option>)}
          </select>
        </div>
      );
    }
    return translateOn;
  };

  const downloadTranscript = (option) => {
    console.log('option', option);
    if (option.detail.id === 'text') {
      downloadTranscriptAsText(callTranscriptPerCallId, item);
    } else if (option.detail.id === 'excel') {
      downloadTranscriptAsExcel(callTranscriptPerCallId, item);
    }
  };

  return (
    <Container
      fitHeight="true"
      disableContentPaddings
      header={
        <Header
          variant="h4"
          info={<InfoLink onFollow={() => setToolsOpen(true)} />}
          actions={
            <SpaceBetween direction="vertical" size="xs">
              <SpaceBetween direction="horizontal" size="xs">
                <Toggle onChange={({ detail }) => setAutoScroll(detail.checked)} checked={autoScroll} disabled={autoScrollDisabled} />
                <span>Auto Scroll</span>
                <Toggle onChange={({ detail }) => setTranslateOn(detail.checked)} checked={translateOn} />
                <span>Enable Translation</span>
                {languageChoices()}
                {showDownloadTranscript && (
                  <SpaceBetween direction="horizontal" size="xs">
                    <ButtonDropdown
                      items={[
                        {
                          text: 'Download as',
                          iconName: 'download',
                          items: [
                            { text: 'Excel', id: 'excel', disabled: false },
                            { text: 'Text', id: 'text' },
                          ],
                        },
                      ]}
                      variant="normal"
                      onItemClick={(option) => downloadTranscript(option)}
                    >
                      <Icon name="download" variant="primary" />
                    </ButtonDropdown>
                  </SpaceBetween>
                )}
              </SpaceBetween>
            </SpaceBetween>
          }
        >
          Meeting Transcript
        </Header>
      }
    >
      {getTranscriptContent({
        item,
        callTranscriptPerCallId,
        autoScroll,
        translateClient,
        targetLanguage,
        agentTranscript,
        translateOn,
        collapseSentiment,
        enableSentimentAnalysis,
      })}
    </Container>
  );
};
