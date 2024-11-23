import React from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';

import StreamAudio from '../stream-audio/StreamAudio';

import Layout from '../layout/page';

const breadcrumbs = [
  {
    title: 'Stream',
  },
];

const StreamAudioLayout = () => {
  const { path } = useRouteMatch();

  return (
    <Layout breadcrumbs={breadcrumbs}>
      <Switch>
        <Route path={path}>
          <StreamAudio />
        </Route>
      </Switch>
    </Layout>
  );
};

export default StreamAudioLayout;
