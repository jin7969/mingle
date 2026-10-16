"use strict";

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { createSourceWrapper } from "../types/source.js";
import AmazonIvsViewNativeComponent, { Commands } from './AmazonIvsViewNativeComponent';
import { ErrorNotification } from "./ErrorNotification.js";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const MAX_PROGRESS_INTERVAL = 5;
function parseDuration(duration) {
  if (duration == null) {
    return duration;
  }
  return duration > 0 ? duration : Infinity;
}
const IVSPlayerContainer = /*#__PURE__*/React.forwardRef(({
  style,
  streamUrl,
  paused,
  muted,
  loop = false,
  resizeMode,
  autoplay = true,
  liveLowLatency,
  rebufferToLive,
  playbackRate,
  pipEnabled,
  logLevel,
  progressInterval = 1,
  volume,
  quality,
  autoMaxQuality,
  autoQualityMode,
  breakpoints = [],
  maxBitrate,
  initialBufferDuration,
  networkRecoveryMode,
  maxVideoSize,
  showErrorMessage,
  playInBackground = false,
  notificationTitle,
  notificationText,
  onSeek,
  onData,
  onVideoStatistics,
  onPlayerStateChange,
  onDurationChange,
  onQualityChange,
  onPipChange,
  onRebuffering,
  onLoadStart,
  onLoad,
  onLiveLatencyChange,
  onTextCue,
  onTextMetadataCue,
  onProgress,
  onError,
  onTimePoint,
  onVideoSizeChange,
  children
}, ref) => {
  const mediaPlayerRef = useRef(null);
  const initialized = useRef(false);
  const liveLatencyRef = useRef(null);
  const seekCallbackRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState();
  const preload = url => {
    if (!mediaPlayerRef.current || !url) return null;
    const sourceWrapper = createSourceWrapper(url);
    Commands.preload(mediaPlayerRef.current, sourceWrapper.getUri(), sourceWrapper.getId());
    return sourceWrapper;
  };
  const loadSource = source => {
    if (!mediaPlayerRef.current || !source) return;
    Commands.loadSource(mediaPlayerRef.current, source.getId());
  };
  const releaseSource = source => {
    if (!mediaPlayerRef.current || !source) return;
    Commands.releaseSource(mediaPlayerRef.current, source.getId());
  };
  const play = () => {
    if (!mediaPlayerRef.current) return;
    Commands.play(mediaPlayerRef.current);
  };
  const pause = () => {
    if (!mediaPlayerRef.current) return;
    Commands.pause(mediaPlayerRef.current);
  };
  const seekTo = (value, callback) => {
    if (!mediaPlayerRef.current) return;
    if (callback) {
      seekCallbackRef.current = callback;
    }
    Commands.seekTo(mediaPlayerRef.current, value);
  };
  const setOrigin = value => {
    if (!mediaPlayerRef.current) return;
    Commands.setOrigin(mediaPlayerRef.current, value);
  };
  const togglePip = () => {
    if (!mediaPlayerRef.current) return;
    Commands.togglePip(mediaPlayerRef.current);
  };
  const getLiveLatency = () => {
    return liveLatencyRef.current;
  };
  useEffect(() => {
    if (initialized.current || autoplay) {
      if (paused) {
        pause();
      } else {
        play();
      }
    }
    initialized.current = true;
  }, [pause, paused, play, autoplay]);
  useImperativeHandle(ref, () => ({
    preload,
    loadSource,
    releaseSource,
    play,
    pause,
    seekTo,
    setOrigin,
    togglePip,
    getLiveLatency
  }), [preload, loadSource, releaseSource, play, pause, seekTo, setOrigin, togglePip, getLiveLatency]);
  const onSeekHandler = event => {
    const {
      position
    } = event.nativeEvent;
    onSeek?.(position);
  };
  const onPlayerStateChangeHandler = event => {
    const {
      state
    } = event.nativeEvent;
    onPlayerStateChange?.(state);
  };
  const onDurationChangeHandler = event => {
    const {
      duration
    } = event.nativeEvent;
    onDurationChange?.(parseDuration(duration));
  };
  const onQualityChangeHandler = event => {
    const {
      quality
    } = event.nativeEvent;
    onQualityChange?.(quality);
  };
  const onPipChangeHandler = event => {
    const {
      active
    } = event.nativeEvent;
    onPipChange?.(active);
  };
  const onLoadHandler = event => {
    if (Platform.OS === 'android') {
      const shouldAutoPlay = autoplay && !paused;
      shouldAutoPlay ? play() : pause();
    }
    const {
      duration
    } = event.nativeEvent;
    onLoad?.(parseDuration(duration));
  };
  const onLiveLatencyChangeHandler = event => {
    const {
      liveLatency
    } = event.nativeEvent;
    liveLatencyRef.current = liveLatency;
    onLiveLatencyChange?.(liveLatency);
  };
  const onDataHandler = event => {
    const {
      playerData
    } = event.nativeEvent;
    onData?.(playerData);
  };
  const onTextCueHandler = event => {
    const {
      textCue
    } = event.nativeEvent;
    onTextCue?.(textCue);
  };
  const onVideoStatisticsHandler = event => {
    const {
      videoData
    } = event.nativeEvent;
    const statistics = {
      ...videoData,
      duration: parseDuration(videoData.duration)
    };
    onVideoStatistics?.(statistics);
  };
  const onTextMetadataCueHandler = event => {
    const {
      textMetadataCue
    } = event.nativeEvent;
    onTextMetadataCue?.(textMetadataCue);
  };
  const onProgressHandler = event => {
    const {
      position
    } = event.nativeEvent;
    onProgress?.(position);
  };
  const onErrorHandler = event => {
    const {
      error
    } = event.nativeEvent;
    if (showErrorMessage) {
      setErrorMessage(error);
      setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
    }
    onError?.(error);
  };
  const onTimePointHandler = event => {
    const {
      position
    } = event.nativeEvent;
    onTimePoint?.(position);
  };
  const onVideoSizeChangeHandler = event => {
    const {
      size
    } = event.nativeEvent;
    onVideoSizeChange?.(size);
  };
  const onSeekCompleteHandler = event => {
    const {
      success
    } = event.nativeEvent;
    if (seekCallbackRef.current) {
      seekCallbackRef.current(success);
      seekCallbackRef.current = null;
    }
  };
  const constrainedProgressInterval = useMemo(() => {
    if (!progressInterval || progressInterval <= 0.1) {
      return 0.1;
    }
    return Math.min(progressInterval, MAX_PROGRESS_INTERVAL);
  }, [progressInterval]);
  return /*#__PURE__*/_jsxs(View, {
    style: [styles.container, style],
    children: [/*#__PURE__*/_jsx(ErrorNotification, {
      message: errorMessage
    }), /*#__PURE__*/_jsx(AmazonIvsViewNativeComponent, {
      testID: "IVSPlayer",
      muted: muted,
      loop: loop,
      liveLowLatency: liveLowLatency,
      rebufferToLive: rebufferToLive,
      style: styles.mediaPlayer,
      ref: mediaPlayerRef,
      playbackRate: playbackRate,
      streamUrl: streamUrl,
      logLevel: logLevel,
      resizeMode: resizeMode,
      progressInterval: constrainedProgressInterval,
      volume: volume,
      quality: quality,
      initialBufferDuration: initialBufferDuration,
      autoMaxQuality: autoMaxQuality,
      autoQualityMode: autoQualityMode,
      breakpoints: breakpoints,
      maxBitrate: maxBitrate,
      pipEnabled: pipEnabled,
      playInBackground: playInBackground,
      notificationTitle: notificationTitle,
      notificationText: notificationText,
      networkRecoveryMode: networkRecoveryMode,
      maxVideoSize: maxVideoSize,
      onVideoStatistics: onVideoStatisticsHandler,
      onData: onDataHandler,
      onSeek: onSeekHandler,
      onQualityChange: onQualityChangeHandler,
      onPipChange: onPipChangeHandler,
      onPlayerStateChange: onPlayerStateChangeHandler,
      onDurationChange: onDurationChangeHandler,
      onRebuffering: onRebuffering,
      onLoadStart: onLoadStart,
      onLoad: onLoadHandler,
      onTextCue: onTextCueHandler,
      onTextMetadataCue: onTextMetadataCueHandler,
      onProgress: onProgressHandler,
      onLiveLatencyChange: onLiveLatencyChangeHandler,
      onError: onErrorHandler,
      onTimePoint: onTimePointHandler,
      onVideoSizeChange: onVideoSizeChangeHandler,
      onSeekComplete: onSeekCompleteHandler
    }), /*#__PURE__*/_jsx(View, {
      style: styles.children,
      children: children
    })]
  });
});
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  mediaPlayer: {
    flex: 1
  },
  children: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  }
});
export default IVSPlayerContainer;
//# sourceMappingURL=IVSPlayer.js.map