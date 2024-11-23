import React, { useEffect, useRef } from 'react';
import { useIntegration } from 'context/ProviderIntegrationContext';
import { useLiveTranscript } from './hooks/useLiveTranscript';
import { Avatar, AvatarFallback } from 'components/ui/avatar';

const getDisplayChannel = (channel: string, speaker?: string) => {
	if (channel === 'AGENT' || channel === 'CALLER') {
		return `${speaker}`.trim();
	} else if (channel === 'AGENT_ASSISTANT' || channel === 'MEETING_ASSISTANT') {
		return 'MEETING_ASSISTANT';
	}

	return `${channel}`;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTimestampFromSeconds = (secs: any) => {
	if (!secs || Number.isNaN(secs)) {
		return '';
	}
	return new Date(secs * 1000).toISOString().substr(14, 7);
};

function Transcript() {
	const { currentCall } = useIntegration();
	const list = useLiveTranscript(currentCall?.callId);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const bottomRef = useRef<any>();

	useEffect(() => {
		if (bottomRef.current?.scrollIntoView) {
			bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, [list]);

	return (
		<div>
			<div className='max-h-[468px] overflow-auto pt-4'>
				{list?.map((item) => (
					<div className='border-b border-b-slate-700 pb-2 mb-5 px-4' key={item.PK}>
						<div className='flex flex-row gap-2 md:gap-6'>
							<div className='flex flex-col items-center gap-2'>
								<Avatar className='h-7 w-7'>
									<AvatarFallback className='uppercase text-xs text-gray-800'>
										{getDisplayChannel(item.Channel, item.Speaker)?.[0]}
									</AvatarFallback>
								</Avatar>
								<p className='text-[10px] leading-4 font-medium text-gray-400 w-11 text-center'>
									{getTimestampFromSeconds(item.StartTime) || ''}
								</p>
							</div>
							<div className='flex-1'>
								<div className='flex flex-row flex-wrap gap-1'>
									<p className='text-sm capitalize font-medium text-gray-300 font-satoshi mb-1'>
										{getDisplayChannel(item.Channel, item.Speaker)}
									</p>
								</div>
								<div>
									<p className='text-sm font-satoshi font-normal text-gray-100'>{item.Transcript}</p>
								</div>
							</div>
						</div>
					</div>
				))}
				<div key='bottom' ref={bottomRef} />
			</div>
		</div>
	);
}

export default Transcript;
