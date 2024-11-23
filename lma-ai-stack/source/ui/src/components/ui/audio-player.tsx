import { useRef, useState } from 'react';
import { Button } from 'components/ui/button';
import { Slider } from 'components/ui/slider';
import { PauseIcon, PlayIcon, VolumeIcon } from 'lucide-react';

interface IAudioPlayer {
  url: string;
  title?: string;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function AudioPlayer({ url, title }: IAudioPlayer) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
    setCurrentTime(value);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  return (
    <div className="flex flex-col items-center text-black">
      <div className="rounded-lg w-full">
        <audio ref={audioRef} src={url} onLoadedMetadata={handleLoadedMetadata} onTimeUpdate={handleTimeUpdate} />

        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-medium">{title ? title : null}</div>
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <Slider
          value={[currentTime]}
          max={duration}
          step={1}
          onValueChange={([value]) => handleSeek(value)}
          className="w-full bg-gray-700 rounded-full h-2 mb-4"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={togglePlayPause}>
              {isPlaying ? <PauseIcon className="h-8 w-8" /> : <PlayIcon className="h-8 w-8" />}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <VolumeIcon className="h-6 w-6 text-gray-400" />
            <Slider value={[volume]} max={100} step={1} onValueChange={([value]) => handleVolumeChange(value)} className="w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
