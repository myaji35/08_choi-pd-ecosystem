/**
 * Video Streaming Utilities for Epic 23
 * - Video upload and transcoding
 * - HLS/DASH streaming
 * - Live streaming (RTMP/WebRTC)
 * - Watch history and analytics
 * - Subtitle management
 */

import { db } from './db';
import {
  videos,
  videoChapters,
  videoSubtitles,
  watchHistory,
  liveStreams,
  videoComments,
  videoPlaylists,
  playlistVideos,
  type NewVideo,
  type NewVideoChapter,
  type NewVideoSubtitle,
  type NewWatchHistory,
  type NewLiveStream,
  type NewVideoComment
} from './db/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import crypto from 'crypto';

// ============================================================
// Configuration
// ============================================================

const VIDEO_CONFIG = {
  SUPPORTED_FORMATS: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
  MAX_FILE_SIZE: 5 * 1024 * 1024 * 1024, // 5GB
  RESOLUTIONS: ['360p', '720p', '1080p', '1440p', '4k'],
  DEFAULT_BITRATES: {
    '360p': 800000,
    '720p': 2500000,
    '1080p': 5000000,
    '1440p': 10000000,
    '4k': 20000000
  },
  HLS_SEGMENT_DURATION: 6, // seconds
  COMPLETION_THRESHOLD: 0.9 // 90% watched = completed
};

// ============================================================
// 1. Video Upload and Processing
// ============================================================

/**
 * Initialize video upload
 */
export async function createVideo(params: {
  title: string;
  description?: string;
  courseId?: number;
  originalFileName: string;
  fileSize: number;
  duration: number;
  visibility?: 'public' | 'unlisted' | 'private' | 'members_only';
  uploadedBy: string;
}): Promise<any> {
  const {
    title,
    description,
    courseId,
    originalFileName,
    fileSize,
    duration,
    visibility = 'public',
    uploadedBy
  } = params;

  // Validate file size
  if (fileSize > VIDEO_CONFIG.MAX_FILE_SIZE) {
    throw new Error(`File size exceeds maximum of ${VIDEO_CONFIG.MAX_FILE_SIZE / 1024 / 1024 / 1024}GB`);
  }

  const [video] = await db.insert(videos).values({
    title,
    description: description || null,
    courseId: courseId || null,
    originalFileName,
    fileSize,
    duration,
    status: 'uploading',
    processingProgress: 0,
    visibility,
    uploadedBy
  }).returning();

  return video;
}

/**
 * Update video processing status
 */
export async function updateVideoProcessing(params: {
  videoId: number;
  status: 'uploading' | 'processing' | 'ready' | 'failed' | 'archived';
  progress?: number;
  hlsUrl?: string;
  dashUrl?: string;
  mp4Url?: string;
  resolutions?: string[];
  thumbnailUrl?: string;
  error?: string;
}): Promise<void> {
  const { videoId, status, progress, hlsUrl, dashUrl, mp4Url, resolutions, thumbnailUrl, error } = params;

  const updateData: any = {
    status,
    updatedAt: new Date()
  };

  if (progress !== undefined) updateData.processingProgress = progress;
  if (hlsUrl) updateData.hlsUrl = hlsUrl;
  if (dashUrl) updateData.dashUrl = dashUrl;
  if (mp4Url) updateData.mp4Url = mp4Url;
  if (resolutions) updateData.resolutions = JSON.stringify(resolutions);
  if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;

  await db.update(videos)
    .set(updateData)
    .where(eq(videos.id, videoId));
}

/**
 * Generate HLS playlist (placeholder - requires FFmpeg)
 */
export async function generateHlsPlaylist(videoId: number, inputFile: string): Promise<string> {
  // This would use FFmpeg to transcode video to HLS format
  // ffmpeg -i input.mp4 -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls output.m3u8

  console.log(`Generating HLS playlist for video ${videoId} from ${inputFile}`);

  // Placeholder implementation
  const hlsUrl = `/streams/${videoId}/master.m3u8`;

  await updateVideoProcessing({
    videoId,
    status: 'processing',
    progress: 50,
    hlsUrl
  });

  return hlsUrl;
}

/**
 * Generate thumbnail from video
 */
export async function generateThumbnail(videoId: number, inputFile: string, timestamp: number = 0): Promise<string> {
  // This would use FFmpeg to extract thumbnail
  // ffmpeg -i input.mp4 -ss 00:00:05 -vframes 1 thumbnail.jpg

  console.log(`Generating thumbnail for video ${videoId} at ${timestamp}s`);

  const thumbnailUrl = `/thumbnails/${videoId}.jpg`;

  await db.update(videos)
    .set({ thumbnailUrl })
    .where(eq(videos.id, videoId));

  return thumbnailUrl;
}

// ============================================================
// 2. Video Playback and Streaming
// ============================================================

/**
 * Get video streaming URLs
 */
export async function getVideoStreamingUrls(videoId: number): Promise<any> {
  const [video] = await db
    .select()
    .from(videos)
    .where(eq(videos.id, videoId));

  if (!video) {
    throw new Error('Video not found');
  }

  if (video.status !== 'ready') {
    throw new Error('Video is not ready for streaming');
  }

  return {
    hls: video.hlsUrl,
    dash: video.dashUrl,
    mp4: video.mp4Url,
    resolutions: video.resolutions ? JSON.parse(video.resolutions) : [],
    thumbnailUrl: video.thumbnailUrl,
    duration: video.duration
  };
}

/**
 * Record video view
 */
export async function recordVideoView(params: {
  videoId: number;
  userId?: string;
  userType?: 'distributor' | 'pd' | 'customer';
}): Promise<void> {
  const { videoId, userId, userType } = params;

  // Increment view count
  await db.update(videos)
    .set({
      viewCount: sql`${videos.viewCount} + 1`
    })
    .where(eq(videos.id, videoId));

  // Create or update watch history if user is logged in
  if (userId && userType) {
    const existing = await db
      .select()
      .from(watchHistory)
      .where(
        and(
          eq(watchHistory.userId, userId),
          eq(watchHistory.videoId, videoId)
        )
      );

    if (existing.length === 0) {
      await db.insert(watchHistory).values({
        userId,
        userType,
        videoId,
        watchedDuration: 0,
        lastPosition: 0,
        completed: false
      });
    }
  }
}

// ============================================================
// 3. Watch History and Progress Tracking
// ============================================================

/**
 * Update watch progress
 */
export async function updateWatchProgress(params: {
  userId: string;
  userType: 'distributor' | 'pd' | 'customer';
  videoId: number;
  position: number;
  duration: number;
  device?: string;
  quality?: string;
}): Promise<void> {
  const { userId, userType, videoId, position, duration, device, quality } = params;

  // Get video duration
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId));
  if (!video) return;

  const watchedDuration = position;
  const completionRate = Math.min(1, position / video.duration);
  const completed = completionRate >= VIDEO_CONFIG.COMPLETION_THRESHOLD;

  // Find existing watch history
  const existing = await db
    .select()
    .from(watchHistory)
    .where(
      and(
        eq(watchHistory.userId, userId),
        eq(watchHistory.videoId, videoId)
      )
    );

  if (existing.length > 0) {
    // Update existing
    await db.update(watchHistory)
      .set({
        watchedDuration,
        lastPosition: position,
        completed,
        completedAt: completed ? new Date() : null,
        device: device || existing[0].device,
        quality: quality || existing[0].quality,
        lastWatchedAt: new Date()
      })
      .where(eq(watchHistory.id, existing[0].id));
  } else {
    // Create new
    await db.insert(watchHistory).values({
      userId,
      userType,
      videoId,
      watchedDuration,
      lastPosition: position,
      completed,
      completedAt: completed ? new Date() : null,
      device: device || null,
      quality: quality || null
    });
  }

  // Update video analytics
  await updateVideoAnalytics(videoId);
}

/**
 * Get watch history for user
 */
export async function getWatchHistory(params: {
  userId: string;
  limit?: number;
}): Promise<any[]> {
  const { userId, limit = 50 } = params;

  const history = await db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.userId, userId))
    .orderBy(desc(watchHistory.lastWatchedAt))
    .limit(limit);

  return history;
}

/**
 * Get continue watching videos
 */
export async function getContinueWatching(userId: string): Promise<any[]> {
  const history = await db
    .select()
    .from(watchHistory)
    .where(
      and(
        eq(watchHistory.userId, userId),
        eq(watchHistory.completed, false)
      )
    )
    .orderBy(desc(watchHistory.lastWatchedAt))
    .limit(10);

  return history;
}

// ============================================================
// 4. Video Analytics
// ============================================================

/**
 * Update video analytics
 */
async function updateVideoAnalytics(videoId: number): Promise<void> {
  // Calculate average watch time
  const watchHistories = await db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.videoId, videoId));

  if (watchHistories.length === 0) return;

  const avgWatchTime = Math.round(
    watchHistories.reduce((sum, h) => sum + h.watchedDuration, 0) / watchHistories.length
  );

  const completedCount = watchHistories.filter(h => h.completed).length;
  const completionRate = Math.round((completedCount / watchHistories.length) * 100);

  await db.update(videos)
    .set({
      averageWatchTime: avgWatchTime,
      completionRate
    })
    .where(eq(videos.id, videoId));
}

/**
 * Get video analytics
 */
export async function getVideoAnalytics(videoId: number): Promise<any> {
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId));

  if (!video) {
    throw new Error('Video not found');
  }

  const watchHistories = await db
    .select()
    .from(watchHistory)
    .where(eq(watchHistory.videoId, videoId));

  const totalWatches = watchHistories.length;
  const uniqueViewers = new Set(watchHistories.map(h => h.userId)).size;
  const completedViews = watchHistories.filter(h => h.completed).length;

  return {
    videoId,
    title: video.title,
    viewCount: video.viewCount,
    likeCount: video.likeCount,
    commentCount: video.commentCount,
    totalWatches,
    uniqueViewers,
    completedViews,
    completionRate: video.completionRate,
    averageWatchTime: video.averageWatchTime,
    duration: video.duration
  };
}

// ============================================================
// 5. Chapters and Subtitles
// ============================================================

/**
 * Add chapter to video
 */
export async function addVideoChapter(params: {
  videoId: number;
  title: string;
  startTime: number;
  endTime: number;
  order: number;
  thumbnailUrl?: string;
}): Promise<any> {
  const { videoId, title, startTime, endTime, order, thumbnailUrl } = params;

  const [chapter] = await db.insert(videoChapters).values({
    videoId,
    title,
    startTime,
    endTime,
    order,
    thumbnailUrl: thumbnailUrl || null
  }).returning();

  return chapter;
}

/**
 * Add subtitle to video
 */
export async function addVideoSubtitle(params: {
  videoId: number;
  language: string;
  label: string;
  format?: 'srt' | 'vtt' | 'ass';
  fileUrl: string;
  isDefault?: boolean;
  isAutoGenerated?: boolean;
}): Promise<any> {
  const {
    videoId,
    language,
    label,
    format = 'vtt',
    fileUrl,
    isDefault = false,
    isAutoGenerated = false
  } = params;

  // If this is set as default, unset other defaults
  if (isDefault) {
    await db.update(videoSubtitles)
      .set({ isDefault: false })
      .where(eq(videoSubtitles.videoId, videoId));
  }

  const [subtitle] = await db.insert(videoSubtitles).values({
    videoId,
    language,
    label,
    format,
    fileUrl,
    isDefault,
    isAutoGenerated
  }).returning();

  return subtitle;
}

/**
 * Get video chapters
 */
export async function getVideoChapters(videoId: number): Promise<any[]> {
  const chapters = await db
    .select()
    .from(videoChapters)
    .where(eq(videoChapters.videoId, videoId))
    .orderBy(videoChapters.order);

  return chapters;
}

/**
 * Get video subtitles
 */
export async function getVideoSubtitles(videoId: number): Promise<any[]> {
  const subtitles = await db
    .select()
    .from(videoSubtitles)
    .where(eq(videoSubtitles.videoId, videoId));

  return subtitles;
}

// ============================================================
// 6. Live Streaming
// ============================================================

/**
 * Create live stream
 */
export async function createLiveStream(params: {
  title: string;
  description?: string;
  scheduledStartTime: Date;
  scheduledEndTime?: Date;
  maxViewers?: number;
  enableChat?: boolean;
  enableRecording?: boolean;
  visibility?: 'public' | 'unlisted' | 'private';
  hostedBy: string;
}): Promise<any> {
  const {
    title,
    description,
    scheduledStartTime,
    scheduledEndTime,
    maxViewers = 1000,
    enableChat = true,
    enableRecording = true,
    visibility = 'public',
    hostedBy
  } = params;

  // Generate stream key
  const streamKey = crypto.randomBytes(16).toString('hex');
  const rtmpUrl = `rtmp://live.impd.com/live/${streamKey}`;

  const [stream] = await db.insert(liveStreams).values({
    title,
    description: description || null,
    scheduledStartTime,
    scheduledEndTime: scheduledEndTime || null,
    streamKey,
    rtmpUrl,
    maxViewers,
    enableChat,
    enableRecording,
    visibility,
    hostedBy
  }).returning();

  return {
    ...stream,
    // Don't expose stream key in response - only show in admin panel
    streamKey: undefined,
    publishUrl: rtmpUrl
  };
}

/**
 * Start live stream
 */
export async function startLiveStream(streamId: number): Promise<void> {
  const hlsPlaybackUrl = `/live/${streamId}/stream.m3u8`;

  await db.update(liveStreams)
    .set({
      status: 'live',
      actualStartTime: new Date(),
      hlsPlaybackUrl
    })
    .where(eq(liveStreams.id, streamId));
}

/**
 * End live stream
 */
export async function endLiveStream(streamId: number, recordingUrl?: string): Promise<void> {
  await db.update(liveStreams)
    .set({
      status: 'ended',
      actualEndTime: new Date(),
      recordingUrl: recordingUrl || null
    })
    .where(eq(liveStreams.id, streamId));
}

/**
 * Update live stream viewers
 */
export async function updateLiveViewers(streamId: number, currentViewers: number): Promise<void> {
  const [stream] = await db.select().from(liveStreams).where(eq(liveStreams.id, streamId));

  if (!stream) return;

  const peakViewers = Math.max(stream.peakViewers, currentViewers);

  await db.update(liveStreams)
    .set({
      currentViewers,
      peakViewers,
      totalViews: sql`${liveStreams.totalViews} + 1`
    })
    .where(eq(liveStreams.id, streamId));
}

// ============================================================
// 7. Comments
// ============================================================

/**
 * Add video comment
 */
export async function addVideoComment(params: {
  videoId: number;
  userId: string;
  userName: string;
  comment: string;
  timestamp?: number;
  parentCommentId?: number;
}): Promise<any> {
  const { videoId, userId, userName, comment, timestamp, parentCommentId } = params;

  const [newComment] = await db.insert(videoComments).values({
    videoId,
    userId,
    userName,
    comment,
    timestamp: timestamp || null,
    parentCommentId: parentCommentId || null
  }).returning();

  // Update video comment count
  await db.update(videos)
    .set({
      commentCount: sql`${videos.commentCount} + 1`
    })
    .where(eq(videos.id, videoId));

  return newComment;
}

/**
 * Get video comments
 */
export async function getVideoComments(params: {
  videoId: number;
  limit?: number;
  offset?: number;
}): Promise<any[]> {
  const { videoId, limit = 50, offset = 0 } = params;

  const comments = await db
    .select()
    .from(videoComments)
    .where(eq(videoComments.videoId, videoId))
    .orderBy(desc(videoComments.createdAt))
    .limit(limit)
    .offset(offset);

  return comments;
}

// ============================================================
// 8. Playlists
// ============================================================

/**
 * Create playlist
 */
export async function createPlaylist(params: {
  name: string;
  description?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  createdBy: string;
}): Promise<any> {
  const { name, description, visibility = 'public', createdBy } = params;

  const [playlist] = await db.insert(videoPlaylists).values({
    name,
    description: description || null,
    visibility,
    createdBy
  }).returning();

  return playlist;
}

/**
 * Add video to playlist
 */
export async function addVideoToPlaylist(params: {
  playlistId: number;
  videoId: number;
  order: number;
}): Promise<void> {
  const { playlistId, videoId, order } = params;

  await db.insert(playlistVideos).values({
    playlistId,
    videoId,
    order
  });

  // Update playlist stats
  const [video] = await db.select().from(videos).where(eq(videos.id, videoId));

  await db.update(videoPlaylists)
    .set({
      videoCount: sql`${videoPlaylists.videoCount} + 1`,
      totalDuration: sql`${videoPlaylists.totalDuration} + ${video.duration}`,
      updatedAt: new Date()
    })
    .where(eq(videoPlaylists.id, playlistId));
}

/**
 * Get playlist videos
 */
export async function getPlaylistVideos(playlistId: number): Promise<any[]> {
  const playlistItems = await db
    .select()
    .from(playlistVideos)
    .where(eq(playlistVideos.playlistId, playlistId))
    .orderBy(playlistVideos.order);

  return playlistItems;
}

// ============================================================
// Export all functions
// ============================================================

export default {
  createVideo,
  updateVideoProcessing,
  generateHlsPlaylist,
  generateThumbnail,
  getVideoStreamingUrls,
  recordVideoView,
  updateWatchProgress,
  getWatchHistory,
  getContinueWatching,
  getVideoAnalytics,
  addVideoChapter,
  addVideoSubtitle,
  getVideoChapters,
  getVideoSubtitles,
  createLiveStream,
  startLiveStream,
  endLiveStream,
  updateLiveViewers,
  addVideoComment,
  getVideoComments,
  createPlaylist,
  addVideoToPlaylist,
  getPlaylistVideos
};
