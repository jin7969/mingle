export type LiveStreamStatus = 'loading' | 'live' | 'ended' | 'error' | 'unconfigured';

export type LiveStageProps = {
  onStatusChange?: (status: LiveStreamStatus) => void;
};
