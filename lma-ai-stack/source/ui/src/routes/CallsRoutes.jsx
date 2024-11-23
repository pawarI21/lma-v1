import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import CallAnalyticsLayout from '../components/call-analytics-layout';

const CallsRoutes = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={path}>
        <div>
          <CallAnalyticsLayout />
        </div>
      </Route>
    </Switch>
  );
};

export default CallsRoutes;
