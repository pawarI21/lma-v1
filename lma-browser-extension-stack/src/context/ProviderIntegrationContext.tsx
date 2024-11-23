/* eslint-disable @typescript-eslint/no-empty-function */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useSettings } from './SettingsContext';
import { useUserContext } from './UserContext';

type Call = {
	callEvent: string;
	agentId: string;
	fromNumber: string;
	toNumber: string;
	callId: string;
	samplingRate: number;
	activeSpeaker: string;
};

const initialIntegration = {
	currentCall: {} as Call,
	isTranscribing: false,
	muted: false,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setMuted: (muteValue: boolean) => {},
	paused: false,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setPaused: (pauseValue: boolean) => {},
	fetchMetadata: () => {},
	// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
	startTranscription: (user: any, userName: string, meetingTopic: string) => {},
	stopTranscription: () => {},
	metadata: {
		userName: '',
		meetingTopic: '',
	},
	platform: 'n/a',
	activeSpeaker: 'n/a',
	sendRecordingMessage: () => {},
};
const IntegrationContext = createContext(initialIntegration);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function IntegrationProvider({ children }: any) {
	const [currentCall, setCurrentCall] = useState({} as Call);
	const { user, checkTokenExpired } = useUserContext();
	const settings = useSettings();
	const [metadata, setMetadata] = useState({
		userName: '',
		meetingTopic: '',
	});
	const [platform, setPlatform] = useState('n/a');
	const [activeSpeaker, setActiveSpeaker] = useState('n/a');
	const [isTranscribing, setIsTranscribing] = useState(false);
	const [shouldConnect, setShouldConnect] = useState(false);
	const [muted, setMuted] = useState(false);
	const [paused, setPaused] = useState(false);

	const { sendMessage, readyState, getWebSocket } = useWebSocket(
		settings.wssEndpoint as string,
		{
			queryParams: {
				authorization: `Bearer ${user.access_token}`,
				id_token: `${user.id_token}`,
				// refresh_token: `${user.refresh_token}`,
			},
			onOpen: (event) => {
				console.log(event);
			},
			onClose: (event) => {
				console.log(event);
				stopTranscription();
			},
			onError: (event) => {
				console.log(event);
				stopTranscription();
			},
		},
		shouldConnect
	);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const connectionStatus = {
		[ReadyState.CONNECTING]: 'Connecting',
		[ReadyState.OPEN]: 'Open',
		[ReadyState.CLOSING]: 'Closing',
		[ReadyState.CLOSED]: 'Closed',
		[ReadyState.UNINSTANTIATED]: 'Uninstantiated',
	}[readyState];

	const dataUrlToBytes = async (dataUrl: string, isMuted: boolean, isPaused: boolean) => {
		const res = await fetch(dataUrl);
		const dataArray = new Uint8Array(await res.arrayBuffer());
		if (isPaused) {
			// mute all channels by sending just zeroes
			return new Uint8Array(dataArray.length);
		} else if (isMuted) {
			// mute only the one channel by mutating the zeroes of only one channel (channel 1)
			for (let i = 2; i < dataArray.length; i += 4) {
				dataArray[i] = 0;
				dataArray[i + 1] = 0;
			}
		}
		return dataArray;
	};

	const updateMetadata = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(newMetadata: any) => {
			console.log('newMetadata.baseUrl' + newMetadata?.baseUrl);

			// if (!newMetadata.baseUrl) {
			// return;
			// }

			if (newMetadata.baseUrl === 'https://app.zoom.us') {
				setPlatform('Zoom');
			} else if (newMetadata.baseUrl === 'https://app.chime.aws') {
				setPlatform('Amazon Chime');
			} else if (
				newMetadata.baseUrl === 'https://teams.microsoft.com' ||
				newMetadata.baseUrl === 'https://teams.live.com'
			) {
				setPlatform('Microsoft Teams');
			} else if (newMetadata.baseUrl.includes('webex.com')) {
				setPlatform('Cisco Webex');
			}
			setMetadata(newMetadata);
		},
		[metadata, setMetadata, platform, setPlatform]
	);

	const fetchMetadata = async () => {
		if (!chrome.tabs) {
			return;
		}
		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		console.log('tab', tab);

		if (tab && tab.id) {
			try {
				const response = await chrome.tabs.sendMessage(tab.id, { action: 'FetchMetadata' });
				console.log('Received response from Metadata query!', response);
				if (response?.baseUrl) {
					updateMetadata(response);
				}
			} catch (error) {
				console.log(error);
			}
		}
	};

	const sendRecordingMessage = useCallback(async () => {
		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		if (tab && tab.id) {
			await chrome.tabs.sendMessage(tab.id, {
				action: 'SendChatMessage',
				message: settings.recordingMessage,
			});
		}
		return {};
	}, [settings]);

	const sendStopMessage = useCallback(async () => {
		const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
		if (tab && tab.id) {
			await chrome.tabs.sendMessage(tab.id, {
				action: 'SendChatMessage',
				message: settings.stopRecordingMessage,
			});
		}
		return {};
	}, [settings]);

	const getTimestampStr = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0'); // JavaScript months start at 0
		const day = String(now.getDate()).padStart(2, '0');
		const hour = String(now.getHours()).padStart(2, '0');
		const minute = String(now.getMinutes()).padStart(2, '0');
		const second = String(now.getSeconds()).padStart(2, '0');
		const millisecond = String(now.getMilliseconds()).padStart(3, '0');
		const formattedDate = `${year}-${month}-${day}-${hour}:${minute}:${second}.${millisecond}`;
		return formattedDate;
	};

	const startTranscription = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		async (user: any, userName: string, meetingTopic: string) => {
			if (await checkTokenExpired()) {
				// TODO login popup
				return;
			}

			setShouldConnect(true);
			const callMetadata = {
				callEvent: 'START',
				agentId: userName,
				fromNumber: '+9165551234',
				toNumber: '+8001112222',
				callId: `${meetingTopic} - ${getTimestampStr()}`,
				samplingRate: 8000,
				activeSpeaker: 'n/a',
			};

			setCurrentCall(callMetadata);

			try {
				if (chrome.runtime) {
					const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
					if (tab.id) {
						await chrome.tabs.sendMessage(tab.id, { action: 'StartTranscription' });
						// We send a message here, but not actually start the stream until we receive a new message with the sample rate.
					}
				}
			} catch (exception) {
				console.log('exception', exception);

				alert("If you recently installed or update LMA, please refresh the browser's page and try again.");
			}
		},
		[setShouldConnect, setCurrentCall]
	);

	const stopTranscription = useCallback(() => {
		if (isTranscribing) {
			if (chrome.runtime) {
				chrome.runtime.sendMessage({ action: 'StopTranscription' });
			}
			if (readyState === ReadyState.OPEN) {
				currentCall.callEvent = 'END';
				sendMessage(JSON.stringify(currentCall));
				getWebSocket()?.close();
			}
			setShouldConnect(false);
			setIsTranscribing(false);
			setPaused(false);
			sendStopMessage();
		}
	}, [
		readyState,
		shouldConnect,
		isTranscribing,
		paused,
		setIsTranscribing,
		getWebSocket,
		sendMessage,
		setPaused,
		sendStopMessage,
		sendRecordingMessage,
	]);

	useEffect(() => {
		if (chrome.runtime) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
			const handleRuntimeMessage = async (request: any, sender: any, sendResponse: any) => {
				if (request.action === 'TranscriptionStopped') {
					stopTranscription();
				} else if (request.action === 'UpdateMetadata') {
					updateMetadata(request.metadata);
				} else if (request.action === 'SamplingRate') {
					// This event should only bubble up once at the start of recording in the injected code
					currentCall.samplingRate = request.samplingRate;
					currentCall.callEvent = 'START';
					sendMessage(JSON.stringify(currentCall));
					setIsTranscribing(true);
					sendRecordingMessage();
				} else if (request.action === 'AudioData') {
					if (readyState === ReadyState.OPEN) {
						const audioData = await dataUrlToBytes(request.audio, muted, paused);

						sendMessage(audioData);
					}
				} else if (request.action === 'ActiveSpeakerChange') {
					console.log('request', request);

					currentCall.callEvent = 'SPEAKER_CHANGE';
					currentCall.activeSpeaker = request.active_speaker;
					setActiveSpeaker(request.active_speaker);
					sendMessage(JSON.stringify(currentCall));
				} else if (request.action === 'MuteChange') {
					setMuted(request.mute);
				}
			};
			chrome.runtime.onMessage.addListener(handleRuntimeMessage);
			// Clean up the listener when the component unmounts
			return () => chrome.runtime.onMessage.removeListener(handleRuntimeMessage);
		}
	}, [
		currentCall,
		metadata,
		readyState,
		muted,
		paused,
		activeSpeaker,
		isTranscribing,
		setMuted,
		setActiveSpeaker,
		sendMessage,
		setPlatform,
		setIsTranscribing,
		sendRecordingMessage,
		updateMetadata,
	]);

	return (
		<IntegrationContext.Provider
			value={{
				currentCall,
				isTranscribing,
				muted,
				setMuted,
				paused,
				setPaused,
				fetchMetadata,
				startTranscription,
				stopTranscription,
				metadata,
				platform,
				activeSpeaker,
				sendRecordingMessage,
			}}
		>
			{children}
		</IntegrationContext.Provider>
	);
}
export function useIntegration() {
	return useContext(IntegrationContext);
}
export default IntegrationProvider;
