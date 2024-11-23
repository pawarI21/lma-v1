import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import MeetingDetailsTab from './MeetingDetailsTab';
import Footer from './Footer';
import Transcript from './Transcript';
import { useUserContext } from 'context/UserContext';

function Capture() {
	const { logout } = useUserContext();
	useEffect(() => {
		if (chrome && chrome.runtime) {
			chrome.runtime.getManifest();
		}
	}, []);

	return (
		<div className='h-full'>
			<div className='h-[80vh] min-h-[365px] flex flex-col'>
				<div className='bg-slate-800 px-4 py-4'>
					<h1 className='text-base font-semibold text-gray-3'>Amazon Live Meeting Assistant</h1>
					<button onClick={logout}>logout</button>
				</div>
				<div className='bg-slate-900 flex-1'>
					<Tabs defaultValue='MeetingDetails' className='w-full h-full flex flex-col'>
						<TabsContent value='MeetingDetails' className='mt-0 flex-1 hidden data-[state=active]:block' forceMount>
							<MeetingDetailsTab />
						</TabsContent>
						<TabsContent value='transcript' className='mt-0 flex-1 hidden data-[state=active]:block' forceMount>
							<Transcript />
						</TabsContent>
						<TabsList className='w-full rounded-none bg-slate-700 mt-1'>
							<TabsTrigger
								className='flex-1 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-300 rounded-sm'
								value='MeetingDetails'
							>
								Meeting Details
							</TabsTrigger>
							<TabsTrigger
								className='flex-1 data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-300 rounded-sm'
								value='transcript'
							>
								Transcript
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
				<Footer />
			</div>
		</div>
	);
}

export default Capture;
