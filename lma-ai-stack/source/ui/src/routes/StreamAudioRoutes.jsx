import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';

import StreamAudioLayout from '../components/stream-audio-layout';

const StreamAudioRoutes = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={path}>
        <div>
          <StreamAudioLayout />
        </div>
      </Route>
    </Switch>
  );
};

export default StreamAudioRoutes;
