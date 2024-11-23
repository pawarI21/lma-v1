import React, { useEffect, useState } from 'react';
import { useCollection } from '@awsui/collection-hooks';
import '@awsui/global-styles/index.css';

import useCallsContext from '../../contexts/calls';
import useSettingsContext from '../../contexts/settings';
import useAppContext from '../../contexts/app';
import { KEY_COLUMN_ID, DEFAULT_PREFERENCES, DEFAULT_SORT_COLUMN } from './config';

import mapCallsAttributes from '../common/map-call-attributes';
import useLocalStorage from '../common/local-storage';
import { exportToExcel } from '../common/download-func';
import { shareMeetings } from '../common/share-meeting';
import { CallsCommonHeader } from './calls-table-config';
import { Button } from '../ui/button';
import DynamicPagination from '../ui/dynamic-pagination';
import { Skeleton } from '../ui/skeleton';
import { CallCard } from './CallCard';

const CallList = () => {
  const [callList, setCallList] = useState([]);
  const [shareResult, setShareResult] = useState(null);

  const { settings } = useSettingsContext();
  const { calls, isCallsListLoading, setIsCallsListLoading, setPeriodsToLoad, setSelectedItems, periodsToLoad } = useCallsContext();

  const [preferences] = useLocalStorage('call-list-preferences', DEFAULT_PREFERENCES);
  const { currentSession, currentCredentials } = useAppContext();

  const { items, collectionProps, paginationProps } = useCollection(callList, {
    pagination: { pageSize: preferences.pageSize },
    sorting: { defaultState: { sortingColumn: DEFAULT_SORT_COLUMN, isDescending: true } },
    selection: {
      keepSelection: false,
      trackBy: KEY_COLUMN_ID,
    },
  });

  useEffect(() => {
    if (!isCallsListLoading) {
      setCallList(mapCallsAttributes(calls, settings));
    }
  }, [isCallsListLoading, calls]);

  useEffect(() => {
    setSelectedItems(collectionProps.selectedItems);
  }, [collectionProps.selectedItems]);

  const shareMeeting = async (recipients) => {
    const result = await shareMeetings(calls, collectionProps, recipients, settings, currentCredentials, currentSession);
    setShareResult(result);
  };

  return (
    <div>
      <div className="flex flex-col justify-between items-center gap-2 sm:flex-row mb-4">
        <h1 className="text-3xl font-medium m-0">Meetings</h1>
        <Button variant="outline">Upload Transcript or Recording</Button>
      </div>
      <div className="flex justify-end mb-6">
        <CallsCommonHeader
          selectedItems={collectionProps.selectedItems}
          loading={isCallsListLoading}
          setIsLoading={setIsCallsListLoading}
          periodsToLoad={periodsToLoad}
          setPeriodsToLoad={setPeriodsToLoad}
          downloadToExcel={() => exportToExcel(callList, 'Meeting-List')}
          shareMeeting={shareMeeting}
          shareResult={shareResult}
          setShareResult={setShareResult}
        />
      </div>

      {isCallsListLoading ? (
        <div className="flex flex-col gap-1">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : null}

      <div className="mb-6">
        {items?.map((item) => (
          <CallCard
            key={item.CallId}
            data={item}
            selectedItems={collectionProps.selectedItems}
            onSelectionChange={collectionProps.onSelectionChange}
          />
        ))}
      </div>

      <div className="mt-6">
        <DynamicPagination
          currentPage={paginationProps?.currentPageIndex}
          totalPages={paginationProps?.pagesCount}
          onPageChange={paginationProps?.onChange}
        />
      </div>
    </div>
  );
};

export default CallList;
