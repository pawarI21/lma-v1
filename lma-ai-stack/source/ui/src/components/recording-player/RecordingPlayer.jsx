import React, { useEffect, useState } from 'react';

import useAppContext from '../../contexts/app';
import generateS3PresignedUrl from '../common/generate-s3-presigned-url';
import AudioPlayer from 'components/ui/audio-player';

/* eslint-disable react/prop-types, react/destructuring-assignment */
export const RecordingPlayer = ({ recordingUrl }) => {
  const [preSignedUrl, setPreSignedUrl] = useState();
  const { setErrorMessage, currentCredentials } = useAppContext();

  useEffect(() => {
    const handlePlayer = async () => {
      if (recordingUrl) {
        try {
          const url = await generateS3PresignedUrl(recordingUrl, currentCredentials);
          setPreSignedUrl(url);
        } catch (error) {
          setErrorMessage('failed to get recording url - please try again later');
        }
      }
    };

    handlePlayer();
  }, [recordingUrl, currentCredentials]);

  return preSignedUrl?.length ? <AudioPlayer url={preSignedUrl} /> : null;
};

export default RecordingPlayer;
