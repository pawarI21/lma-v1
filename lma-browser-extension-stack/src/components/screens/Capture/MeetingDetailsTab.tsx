import React, { useCallback, useEffect, useState } from 'react';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { cn } from 'lib/utils';
import { Button } from 'components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from 'components/ui/alert-dialog';
import { TriangleAlertIcon } from 'lucide-react';
import { useSettings } from 'context/SettingsContext';
import { useIntegration } from 'context/ProviderIntegrationContext';
import { useUserContext } from 'context/UserContext';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IMeetingDetailsTab {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const MeetingDetailsTab = (props: IMeetingDetailsTab) => {
	const settings = useSettings();
	const { user } = useUserContext();
	const { activeSpeaker, metadata, fetchMetadata, isTranscribing, startTranscription } = useIntegration();

	const [showDisclaimer, setShowDisclaimer] = useState(false);
	const [topic, setTopic] = useState('');
	const [agentName, setAgentName] = useState('');
	const [nameErrorText, setNameErrorText] = useState('');
	const [meetingTopicErrorText, setMeetingTopicErrorText] = useState('');

	useEffect(() => {
		fetchMetadata();
	}, []);

	useEffect(() => {
		console.log('Metadata changed');
		if (metadata?.meetingTopic) {
			setTopic(metadata.meetingTopic);
		}
		if (metadata?.userName) {
			setAgentName(metadata.userName);
		}
	}, [metadata, setTopic, setAgentName]);

	const validateForm = useCallback(() => {
		let isValid = true;
		if (agentName === undefined || agentName.trim().length === 0) {
			setNameErrorText('Name required.');
			isValid = false;
		} else {
			setNameErrorText('');
		}
		if (topic === undefined || topic.trim().length === 0) {
			setMeetingTopicErrorText('Topic required.');
			isValid = false;
		} else {
			setMeetingTopicErrorText('');
		}
		return isValid;
	}, [topic, agentName, nameErrorText, setNameErrorText, meetingTopicErrorText, setMeetingTopicErrorText]);

	const startListening = useCallback(() => {
		// eslint-disable-next-line no-useless-escape
		setTopic(topic.replace(/[\/?#%\+&]/g, '|'));

		if (validateForm() === false) {
			return;
		}
		setShowDisclaimer(true);
	}, [settings, validateForm, showDisclaimer]);

	const disclaimerConfirmed = useCallback(() => {
		startTranscription(user, agentName, topic);
	}, [user, agentName, topic, startTranscription]);

	return (
		<div className='flex flex-col gap-4 px-4 pt-4'>
			<div>
				<Label className={cn('text-slate-100 block pb-[6px]', nameErrorText !== '' && 'text-red-500')}>Your name:</Label>
				<Input
					className='text-slate-100 text-sm font-normal placeholder:text-xs'
					placeholder='Your name'
					value={agentName}
					onChange={(e) => setAgentName(e.target.value)}
					disabled={isTranscribing}
				/>
				{nameErrorText ? <p className='text-red-500 text-xs mt-1 ml-1'>{nameErrorText}</p> : null}
			</div>
			<div>
				<Label className={cn('text-slate-100 block pb-[6px]', meetingTopicErrorText !== '' && 'text-red-500')}>
					Meeting Topic:
				</Label>
				<Input
					className='text-slate-100 text-sm font-normal placeholder:text-xs'
					placeholder='Meeting room topic'
					value={topic}
					onChange={(e) => setTopic(e.target.value)}
					disabled={isTranscribing}
				/>
				{meetingTopicErrorText ? <p className='text-red-500 text-xs mt-1 ml-1'>{meetingTopicErrorText}</p> : null}
			</div>
			<div>
				{isTranscribing && activeSpeaker?.length ? (
					<p className='text-slate-100 text-sm'>Active Speaker: {activeSpeaker}</p>
				) : null}
			</div>
			{isTranscribing ? null : <Button onClick={() => startListening()}>Start Listening</Button>}

			<AlertDialog open={showDisclaimer} onOpenChange={(openStatus) => setShowDisclaimer(openStatus)}>
				<AlertDialogContent className='p-3 w-[calc(100%-16px)] rounded-lg bg-gray-900 border-gray-700'>
					<AlertDialogHeader>
						<AlertDialogTitle className='text-slate-100'>Important</AlertDialogTitle>
						<AlertDialogDescription className='text-left text-slate-300 font-light'>
							<TriangleAlertIcon className='inline' size={18} />
							&nbsp;
							{settings.recordingDisclaimer}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter className='flex-row justify-end gap-2'>
						<AlertDialogCancel
							className='mt-0 text-red-400 hover:text-red-300 bg-red-700/15 hover:bg-red-700/20 border-red-900 '
							onClick={() => {
								setShowDisclaimer(false);
							}}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={async () => {
								setShowDisclaimer(false);
								disclaimerConfirmed();
							}}
						>
							Agree
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
};

export default MeetingDetailsTab;
