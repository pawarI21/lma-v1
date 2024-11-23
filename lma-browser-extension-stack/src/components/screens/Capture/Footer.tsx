import React, { useCallback } from 'react';
import { Button } from 'components/ui/button';
import { useIntegration } from 'context/ProviderIntegrationContext';
import { useSettings } from 'context/SettingsContext';
import { MicIcon, MicOffIcon, PauseIcon, PlayIcon, SquareArrowOutUpRightIcon, XIcon } from 'lucide-react';

const Footer = () => {
	const settings = useSettings();
	const { currentCall, muted, setMuted, paused, setPaused, isTranscribing, stopTranscription } = useIntegration();

	const stopListening = useCallback(() => {
		stopTranscription();
	}, [stopTranscription]);

	const openInLMA = useCallback(async () => {
		const url = `${settings.cloudfrontEndpoint}/#/calls/${currentCall.callId}`;
		window.open(url, '_blank', 'noreferrer');
	}, [currentCall, settings]);

	const mute = useCallback(() => {
		setMuted(true);
	}, [muted, setMuted]);

	const unmute = useCallback(() => {
		setMuted(false);
	}, [muted, setMuted]);

	if (!isTranscribing) {
		return null;
	}

	return (
		<div className='bg-slate-800 px-4 py-2 flex flex-row gap-4 justify-evenly'>
			{muted ? (
				<Button className='rounded-full h-11 w-11' onClick={() => unmute()}>
					<MicOffIcon />
				</Button>
			) : (
				<Button className='rounded-full h-11 w-11' onClick={() => mute()}>
					<MicIcon />
				</Button>
			)}
			<Button className='rounded-full h-11 w-11' onClick={async () => openInLMA()}>
				<SquareArrowOutUpRightIcon />
			</Button>
			<Button className='rounded-full h-11 w-11' onClick={() => setPaused(paused ? false : true)}>
				{paused ? <PlayIcon /> : <PauseIcon />}
			</Button>
			<Button className='rounded-full h-11 w-11' onClick={() => stopListening()}>
				<XIcon />
			</Button>
		</div>
	);
};

export default Footer;
