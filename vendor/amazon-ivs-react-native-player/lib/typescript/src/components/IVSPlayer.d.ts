import React from 'react';
import { type ViewStyle } from 'react-native';
import type { IVSPlayerRef, NetworkRecoveryMode, PlayerData, Quality, ResizeMode, TextCue, TextMetadataCue, VideoData } from '../types';
import type { LogLevel, PlayerState } from '../types/enums';
export type Props = {
    style?: ViewStyle;
    testID?: string;
    paused?: boolean;
    muted?: boolean;
    loop?: boolean;
    autoplay?: boolean;
    streamUrl?: string;
    liveLowLatency?: boolean;
    rebufferToLive?: boolean;
    playbackRate?: number;
    logLevel?: LogLevel;
    resizeMode?: ResizeMode;
    progressInterval?: number;
    volume?: number;
    quality?: {
        target: Quality | null;
        adaptive?: boolean;
    };
    autoMaxQuality?: Quality | null;
    autoQualityMode?: boolean;
    breakpoints?: number[];
    maxBitrate?: number;
    initialBufferDuration?: number;
    pipEnabled?: boolean;
    networkRecoveryMode?: NetworkRecoveryMode;
    maxVideoSize?: {
        size: {
            width: number;
            height: number;
        };
    };
    showErrorMessage?: boolean;
    playInBackground?: boolean;
    notificationTitle?: string;
    notificationText?: string;
    onSeek?(position: number): void;
    onData?(data: PlayerData): void;
    onVideoStatistics?(data: VideoData): void;
    onPlayerStateChange?(state: PlayerState): void;
    onDurationChange?(duration: number | null): void;
    onQualityChange?(quality: Quality | null): void;
    onPipChange?(isActive: boolean): void;
    onRebuffering?(): void;
    onLoadStart?(): void;
    onLoad?(duration: number | null): void;
    onLiveLatencyChange?(liveLatency: number): void;
    onTextCue?(textCue: TextCue): void;
    onTextMetadataCue?(textMetadataCue: TextMetadataCue): void;
    onProgress?(progress: number): void;
    onError?(error: string): void;
    onTimePoint?(position: number): void;
    onVideoSizeChange?(size: {
        width: number;
        height: number;
    }): void;
    children?: React.ReactNode;
};
declare const IVSPlayerContainer: React.ForwardRefExoticComponent<Props & React.RefAttributes<IVSPlayerRef>>;
export default IVSPlayerContainer;
//# sourceMappingURL=IVSPlayer.d.ts.map