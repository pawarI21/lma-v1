import React, { useCallback, useMemo, useState } from 'react';
import { CollectionPreferences } from '@awsui/components-react';

import {
  PAGE_SIZE_OPTIONS,
  PERIODS_TO_LOAD_STORAGE_KEY,
  TIME_PERIOD_DROPDOWN_CONFIG,
  TIME_PERIOD_DROPDOWN_ITEMS,
  VISIBLE_CONTENT_OPTIONS,
} from './config';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Download, RefreshCw, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

/* eslint-disable react/prop-types, react/jsx-props-no-spreading */
export const CallsPreferences = ({
  preferences,
  setPreferences,
  disabled,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  visibleContentOptions = VISIBLE_CONTENT_OPTIONS,
}) => (
  <CollectionPreferences
    title="Preferences"
    confirmLabel="Confirm"
    cancelLabel="Cancel"
    disabled={disabled}
    preferences={preferences}
    onConfirm={({ detail }) => setPreferences(detail)}
    pageSizePreference={{
      title: 'Page size',
      options: pageSizeOptions,
    }}
    wrapLinesPreference={{
      label: 'Wrap lines',
      description: 'Check to see all the text and wrap the lines',
    }}
    visibleContentPreference={{
      title: 'Select visible columns',
      options: visibleContentOptions,
    }}
  />
);

export const CallsCommonHeader = ({ resourceName = 'Meetings', ...props }) => {
  const [shareMeeting, setShareMeeting] = useState(false);
  const [meetingRecipients, setMeetingRecipients] = React.useState('');
  const [submit, setSubmit] = useState(false);

  const onPeriodToLoadChange = (id) => {
    const shardCount = TIME_PERIOD_DROPDOWN_CONFIG[id].count;
    props.setPeriodsToLoad(shardCount);
    localStorage.setItem(PERIODS_TO_LOAD_STORAGE_KEY, JSON.stringify(shardCount));
  };

  const openShareSettings = useCallback(() => {
    setShareMeeting(true);
  }, [setShareMeeting]);

  const closeShareSettings = () => {
    setShareMeeting(false);
    setMeetingRecipients('');
    props.setShareResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmit(true);

    await props.shareMeeting(meetingRecipients);
    setMeetingRecipients('');

    setSubmit(false);
  };

  const periodText = useMemo(() => TIME_PERIOD_DROPDOWN_ITEMS.filter((i) => i.count === props.periodsToLoad)[0]?.text || '', [props.periodsToLoad]);

  return (
    <div>
      <div className="flex flex-row gap-1">
        <Select onValueChange={(value) => onPeriodToLoadChange(value)} disabled={props.loading}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder={periodText ? periodText : 'Select...'} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {TIME_PERIOD_DROPDOWN_ITEMS.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.text}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" disabled={props.loading} onClick={() => props.setIsLoading(true)}>
          <RefreshCw />
        </Button>
        <Button variant="outline" size="icon" disabled={props.loading} onClick={() => props.downloadToExcel()}>
          <Download />
        </Button>
        <Button variant="outline" size="icon" onClick={openShareSettings} disabled={props.selectedItems.length === 0 || props.loading}>
          <Share2 />
        </Button>
      </div>

      <Dialog open={shareMeeting} onOpenChange={(openStatus) => !openStatus && closeShareSettings()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl mb-4">Share Meeting</DialogTitle>
            <DialogDescription>
              <div>
                <p className="text-sm font-normal mb-3">
                  You are sharing&#xA0;
                  {props.selectedItems.length}
                  {props.selectedItems.length === 1 ? ' meeting' : ' meetings'}
                  &#x2e; Enter a comma separated list of email addresses.
                </p>
              </div>
              <div>
                <form onSubmit={handleSubmit}>
                  <Input
                    value={meetingRecipients}
                    onChange={(event) => setMeetingRecipients(event.target.value)}
                    placeholder="Please enter email..."
                  />
                  {props.shareResult ? (
                    <Alert className="mt-2 border-cyan-500" variant="default">
                      {/* <Terminal className="h-4 w-4" /> */}
                      <AlertTitle className="text-base text-cyan-900">Message</AlertTitle>
                      <AlertDescription className="text-sm text-cyan-800">{props.shareResult}</AlertDescription>
                    </Alert>
                  ) : null}

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" type="button" className="ring-red-600 text-red-600 hover:bg-red-50" onClick={closeShareSettings}>
                      Close
                    </Button>
                    <Button variant="outline" disabled={submit || !meetingRecipients.trim()} onclick={handleSubmit}>
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
