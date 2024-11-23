import React, { useMemo, useState } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

import { CallsContext } from '../../contexts/calls';
import useCallsGraphQlApi from '../../hooks/use-calls-graphql-api';

import CallList from '../call-list';
import CallDetails from '../call-details';
import MeetingsQueryLayout from '../meetings-query-layout';

import Layout from '../layout/page';
import { getInitialPeriodsToLoad } from './helpers';

const breadcrumbs = [
  {
    title: 'Calls',
    url: '/calls',
  },
];

const CallAnalyticsLayout = () => {
  const { path } = useRouteMatch();

  const initialPeriodsToLoad = useMemo(() => getInitialPeriodsToLoad(), []);

  const [toolsOpen, setToolsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  const {
    calls,
    callTranscriptPerCallId,
    getCallDetailsFromCallIds,
    isCallsListLoading,
    periodsToLoad,
    setLiveTranscriptCallId,
    setIsCallsListLoading,
    setPeriodsToLoad,
    sendGetTranscriptSegmentsRequest,
  } = useCallsGraphQlApi({ initialPeriodsToLoad });

  const callsContextValue = {
    calls,
    callTranscriptPerCallId,
    getCallDetailsFromCallIds,
    isCallsListLoading,
    selectedItems,
    sendGetTranscriptSegmentsRequest,
    setIsCallsListLoading,
    setLiveTranscriptCallId,
    setPeriodsToLoad,
    setToolsOpen,
    setSelectedItems,
    periodsToLoad,
    toolsOpen,
  };

  return (
    <CallsContext.Provider value={callsContextValue}>
      <Layout breadcrumbs={breadcrumbs}>
        <Switch>
          <Route exact path={path}>
            <CallList />
          </Route>
          <Route path={`${path}/query`}>
            <MeetingsQueryLayout />
          </Route>
          <Route path={`${path}/:callId`}>
            <CallDetails />
          </Route>
        </Switch>
      </Layout>
    </CallsContext.Provider>
  );
};

export default CallAnalyticsLayout;
