// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import React, { useState, useRef, useCallback, useEffect } from 'react';

import { Form, FormField, SpaceBetween, ColumnLayout } from '@awsui/components-react';
import '@awsui/global-styles/index.css';
import useWebSocket from 'react-use-websocket';
import { Button } from 'components/ui/button';

import { DEFAULT_OTHER_SPEAKER_NAME, DEFAULT_LOCAL_SPEAKER_NAME, SYSTEM } from '../common/constants';
import useAppContext from '../../contexts/app';
import useSettingsContext from '../../contexts/settings';
import { getTimestampStr } from '../common/utilities';
import { ExternalLinkIcon, MicIcon, MicOffIcon } from 'lucide-react';
import { Input } from 'components/ui/input';
import { cn } from 'lib/utils';

let SOURCE_SAMPLING_RATE;
const DEFAULT_BLANK_FIELD_MSG = 'This will be set back to the default value if left blank.';

const StreamAudio = () => {
  const { currentSession, user } = useAppContext();
  const { settings } = useSettingsContext();
  const JWT_TOKEN = currentSession.getAccessToken().getJwtToken();

  const userIdentifier = user?.attributes?.email || DEFAULT_LOCAL_SPEAKER_NAME;

  const [meetingTopic, setMeetingTopic] = useState('Stream Audio');
  const [callMetaData, setCallMetaData] = useState({
    callId: `${meetingTopic} - ${getTimestampStr()}`,
    agentId: userIdentifier,
    fromNumber: DEFAULT_OTHER_SPEAKER_NAME,
    toNumber: SYSTEM,
  });

  const [recording, setRecording] = useState(false);
  const [streamingStarted, setStreamingStarted] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [recordedMeetingId, setRecordedMeetingId] = useState('');

  useEffect(() => {
    let interval;
    if (recording) {
      interval = setInterval(() => {
        setIsFlashing((prevState) => !prevState);
      }, 500);
    } else {
      clearInterval(interval);
      setIsFlashing(false);
    }
    return () => clearInterval(interval);
  }, [recording]);

  const getSocketUrl = useCallback(() => {
    console.log(`DEBUG - [${new Date().toISOString()}]: Trying to resolve websocket url...`);
    return new Promise((resolve) => {
      if (settings.WSEndpoint) {
        console.log(`
          DEBUG - [${new Date().toISOString()}]: Resolved Websocket URL to ${settings.WSEndpoint}
        `);
        resolve(settings.WSEndpoint);
      }
    });
  }, [settings.WSEndpoint]);

  const { sendMessage } = useWebSocket(getSocketUrl, {
    queryParams: {
      authorization: `Bearer ${JWT_TOKEN}`,
      id_token: `${currentSession.idToken.jwtToken}`,
      refresh_token: `${currentSession.refreshToken.token}`,
    },
    onOpen: (event) => {
      console.log(`
        DEBUG - [${new Date().toISOString()}]: Websocket onOpen Event: ${JSON.stringify(event)}
      `);
    },
    onClose: (event) => {
      console.log(`
        DEBUG - [${new Date().toISOString()}]: Websocket onClose Event: ${JSON.stringify(event)}
      `);
    },
    onError: (event) => {
      console.log(`
        DEBUG - [${new Date().toISOString()}]: Websocket onError Event: ${JSON.stringify(event)}
      `);
    },
    shouldReconnect: () => true,
  });

  const handleCallIdChange = (e) => {
    setMeetingTopic(e.detail.value);
    setCallMetaData({
      ...callMetaData,
      callId: `${e.detail.value} - ${getTimestampStr()}`,
    });
  };

  const handleAgentIdChange = (e) => {
    setCallMetaData({
      ...callMetaData,
      agentId: e.detail.value,
    });
  };

  const handlefromNumberChange = (e) => {
    setCallMetaData({
      ...callMetaData,
      fromNumber: e.detail.value,
    });
  };

  const audioProcessor = useRef();
  const audioContext = useRef();
  const displayStream = useRef();
  const micStream = useRef();
  const displayAudioSource = useRef();
  const micAudioSource = useRef();
  const channelMerger = useRef();
  const agreeToRecord = useRef();

  const convertToMono = (audioSource) => {
    const splitter = audioContext.current.createChannelSplitter(2);
    const merger = audioContext.current.createChannelMerger(1);
    audioSource.connect(splitter);
    splitter.connect(merger, 0, 0);
    splitter.connect(merger, 1, 0);
    return merger;
  };

  const stopRecording = async () => {
    console.log(`DEBUG - [${new Date().toISOString()}]: Stopping recording...`);
    if (audioProcessor.current) {
      audioProcessor.current.port.postMessage({
        message: 'UPDATE_RECORDING_STATE',
        setRecording: false,
      });
      audioProcessor.current.port.close();
      audioProcessor.current.disconnect();
      setMicMuted(false);
      setRecordedMeetingId(callMetaData.callId);
    } else {
      console.log(`
        DEBUG - [${new Date().toISOString()}]: Error trying to stop recording. AudioWorklet Processor node is not active.
      `);
    }
    if (streamingStarted && !recording) {
      callMetaData.callEvent = 'END';
      // eslint-disable-next-line prettier/prettier
      console.log(`
        DEBUG - [${new Date().toISOString()}]: Send Call END msg: ${JSON.stringify(callMetaData)}
      `);
      sendMessage(JSON.stringify(callMetaData));
      setStreamingStarted(false);
      setCallMetaData({
        ...callMetaData,
        callId: crypto.randomUUID(),
      });
    }
    setRecording(false);
  };

  // Default any missing fields in the call metadata
  // The callMetaData state is updated so onscreen fields are updated, but a copy is returned
  //  to avoid the scenario of the state not updating before it is used
  const getFinalCallMetadata = () => {
    // eslint-disable-next-line no-useless-escape
    const meetingPrefix = meetingTopic.replace(/[\/?#%\+&]/g, '|') || 'Stream Audio';

    setMeetingTopic(meetingPrefix);
    const callMetaDataCopy = {
      ...callMetaData,
      callId: `${meetingPrefix} - ${getTimestampStr()}`,
      agentId: callMetaData.agentId || DEFAULT_LOCAL_SPEAKER_NAME,
      fromNumber: callMetaData.fromNumber || DEFAULT_OTHER_SPEAKER_NAME,
    };
    setCallMetaData(callMetaDataCopy);
    return callMetaDataCopy;
  };

  const startRecording = async () => {
    console.log(`
      DEBUG - [${new Date().toISOString()}]: Start Recording and Streaming Audio to Websocket server.
    `);
    const recordingCallMetaData = getFinalCallMetadata();
    try {
      audioContext.current = new window.AudioContext();
      displayStream.current = await window.navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
        selfBrowserSurface: 'exclude',
      });

      micStream.current = await window.navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });
      SOURCE_SAMPLING_RATE = audioContext.current.sampleRate;

      recordingCallMetaData.samplingRate = SOURCE_SAMPLING_RATE;
      recordingCallMetaData.callEvent = 'START';

      // eslint-disable-next-line prettier/prettier
      console.log(`DEBUG - [${new Date().toISOString()}]: Send Call START msg: ${JSON.stringify(recordingCallMetaData)}`);
      sendMessage(JSON.stringify(recordingCallMetaData));
      setStreamingStarted(true);

      displayAudioSource.current = audioContext.current.createMediaStreamSource(displayStream.current);
      micAudioSource.current = audioContext.current.createMediaStreamSource(micStream.current);

      const monoDisplaySource = convertToMono(displayAudioSource.current);
      const monoMicSource = convertToMono(micAudioSource.current);

      channelMerger.current = audioContext.current.createChannelMerger(2);
      monoMicSource.connect(channelMerger.current, 0, 0);
      monoDisplaySource.connect(channelMerger.current, 0, 1);

      console.log(`
        DEBUG - [${new Date().toISOString()}]: Registering and adding AudioWorklet processor to capture audio
      `);
      try {
        await audioContext.current.audioWorklet.addModule('./worklets/recording-processor.js');
      } catch (error) {
        console.log(`
          DEBUG - [${new Date().toISOString()}]: Error registering AudioWorklet processor: ${error}
        `);
      }

      audioProcessor.current = new AudioWorkletNode(audioContext.current, 'recording-processor');

      audioProcessor.current.port.onmessageerror = (error) => {
        console.log(`
          DEBUG - [${new Date().toISOString()}]: Error receiving message from worklet ${error}
        `);
      };

      audioProcessor.current.port.onmessage = (event) => {
        // this is pcm audio
        sendMessage(event.data);
      };
      channelMerger.current.connect(audioProcessor.current);
    } catch (error) {
      alert(`An error occurred while recording: ${error}`);
      await stopRecording();
    }
  };

  async function toggleRecording() {
    if (recording) {
      await startRecording();
    } else {
      await stopRecording();
    }
  }

  useEffect(() => {
    toggleRecording();
  }, [recording]);

  const handleRecording = () => {
    if (!recording) {
      // eslint-disable-next-line no-restricted-globals
      agreeToRecord.current = confirm(settings.recordingDisclaimer);

      if (agreeToRecord.current) {
        if (settings.WSEndpoint) {
          setRecording(!recording);
        } else {
          alert('Enable Websocket Audio input to use this feature');
        }
      }
    } else {
      setRecording(!recording);
    }
    return recording;
  };

  const toggleMicrophoneEnabled = () => {
    micStream.current.getAudioTracks()[0].enabled = !micStream.current.getAudioTracks()[0].enabled;
    setMicMuted(!micStream.current.getAudioTracks()[0].enabled);
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <Form
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant={recording ? 'secondary' : 'default'} onClick={handleRecording} disabled={false}>
                {recording ? 'Stop Streaming' : 'Start Streaming'}
              </Button>
            </SpaceBetween>
          }
        >
          <div className="w-full border border-slate-200 p-3 bg-white rounded-lg cursor-pointer">
            <div className="flex flex-col md:flex-row gap-4 justify-between pb-2 border-b mb-4">
              <p className="text-xl font-semibold min-h-8">Meeting Information</p>
              <div>
                {recording && (
                  <Button variant="ghost" asChild className="text-xs">
                    <a href={`#/calls/${callMetaData.callId}`} target="blank">
                      <ExternalLinkIcon />
                      Open in progress meeting
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <ColumnLayout columns={2}>
              <FormField
                label={<span className="text-sm text-gray-700">Meeting Topic</span>}
                stretch
                required
                description={<span className="text-xs text-gray-400">Prefix for unique meeting identifier</span>}
                errorText={meetingTopic.length < 1 && DEFAULT_BLANK_FIELD_MSG}
              >
                <Input value={meetingTopic} onChange={handleCallIdChange} disabled={recording} />
              </FormField>
              <FormField
                label={<span className="text-sm text-gray-700">Participants (stream)</span>}
                stretch
                required
                description={<span className="text-xs text-gray-400">Label for stream audio</span>}
                errorText={callMetaData.fromNumber.length < 1 && DEFAULT_BLANK_FIELD_MSG}
              >
                <Input value={callMetaData.fromNumber} onChange={handlefromNumberChange} disabled={recording} />
              </FormField>

              <FormField
                label={<span className="text-sm text-gray-700">Meeting owner (microphone)</span>}
                stretch
                required
                description={<span className="text-xs text-gray-400">Label for microphone input</span>}
                errorText={callMetaData.agentId.length < 1 && DEFAULT_BLANK_FIELD_MSG}
              >
                <div className="flex flex-row gap-1">
                  <Input className="flex-1" value={callMetaData.agentId} onChange={handleAgentIdChange} disabled={recording} />
                  <Button className="w-12" variant={micMuted ? 'secondary' : 'default'} onClick={toggleMicrophoneEnabled} disabled={!recording}>
                    {micMuted ? <MicOffIcon /> : <MicIcon />}
                  </Button>
                </div>
              </FormField>
            </ColumnLayout>

            {!recording && (
              <div className="flex justify-end">
                <p className={cn('mt-6 ml-auto text-sm', isFlashing && recording ? 'text-red-500' : 'text-gray-700')}>
                  Recording in progress, do not close or refresh this tab.
                </p>
              </div>
            )}
          </div>
        </Form>
      </form>
      {!recording && recordedMeetingId !== '' && (
        <div className="flex gap-1 justify-end mt-6">
          <p className="text-base text-gray-700">
            Stream ended:&nbsp;
            <a className="text-xs text-blue-600" href={`#/calls/${recordedMeetingId}`} target="_blank">
              Open recorded meeting
            </a>
          </p>
        </div>
      )}
    </div>
  );
};

export default StreamAudio;
