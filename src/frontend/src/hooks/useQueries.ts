import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type AspectRatio, ExternalBlob } from "../backend";
import type { AdminStats, VideoClip } from "../backend.d";
import { useActor } from "./useActor";

export function useListClips() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoClip[]>({
    queryKey: ["clips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listClips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListMyClips() {
  const { actor, isFetching } = useActor();
  return useQuery<VideoClip[]>({
    queryKey: ["myClips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyClips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdminStats() {
  const { actor, isFetching } = useActor();
  return useQuery<AdminStats>({
    queryKey: ["adminStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<[Principal, import("../backend").UserRole][]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export interface UploadClipParams {
  title: string;
  caption: string;
  aspectRatio: AspectRatio;
  partNumber?: bigint;
  videoBytes: Uint8Array<ArrayBuffer>;
  onProgress: (pct: number) => void;
  startTime?: number;
  endTime?: number;
}

export function useAddClip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      caption,
      aspectRatio,
      partNumber,
      videoBytes,
      onProgress,
      startTime,
      endTime,
    }: UploadClipParams) => {
      if (!actor) throw new Error("Not connected");
      const id = crypto.randomUUID();
      const blob =
        ExternalBlob.fromBytes(videoBytes).withUploadProgress(onProgress);
      await actor.addVideoClip(
        id,
        title,
        caption,
        aspectRatio,
        partNumber ?? null,
        blob,
        null,
        startTime ?? null,
        endTime ?? null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips"] });
      queryClient.invalidateQueries({ queryKey: ["myClips"] });
    },
  });
}

export interface ClipSegment {
  title: string;
  caption: string;
  aspectRatio: AspectRatio;
  partNumber: bigint;
  startTime: number;
  endTime: number;
}

export interface BatchUploadParams {
  videoBytes: Uint8Array<ArrayBuffer>;
  segments: ClipSegment[];
  onProgress: (pct: number) => void;
  onClipCreated?: (n: number, total: number) => void;
}

export function useAddClipBatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      videoBytes,
      segments,
      onProgress,
      onClipCreated,
    }: BatchUploadParams) => {
      if (!actor) throw new Error("Not connected");
      // Upload the blob once with progress tracking
      const blob =
        ExternalBlob.fromBytes(videoBytes).withUploadProgress(onProgress);
      // Create N clip entries reusing the same blob
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const id = crypto.randomUUID();
        await actor.addVideoClip(
          id,
          seg.title,
          seg.caption,
          seg.aspectRatio,
          seg.partNumber,
          blob,
          null,
          seg.startTime,
          seg.endTime,
        );
        onClipCreated?.(i + 1, segments.length);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips"] });
      queryClient.invalidateQueries({ queryKey: ["myClips"] });
    },
  });
}

export interface UploadClipFromUrlParams {
  title: string;
  caption: string;
  aspectRatio: AspectRatio;
  partNumber?: bigint;
  url: string;
}

export function useAddClipFromUrl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      caption,
      aspectRatio,
      partNumber,
      url,
    }: UploadClipFromUrlParams) => {
      if (!actor) throw new Error("Not connected");
      const id = crypto.randomUUID();
      await actor.addVideoClip(
        id,
        title,
        caption,
        aspectRatio,
        partNumber ?? null,
        null,
        url,
        null,
        null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips"] });
      queryClient.invalidateQueries({ queryKey: ["myClips"] });
    },
  });
}

export interface UrlClipSegment {
  title: string;
  caption: string;
  aspectRatio: AspectRatio;
  partNumber: bigint;
  startTime: number;
  endTime: number;
  url: string;
}

export interface UrlBatchParams {
  segments: UrlClipSegment[];
  onClipCreated?: (n: number, total: number) => void;
}

export function useAddClipFromUrlBatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ segments, onClipCreated }: UrlBatchParams) => {
      if (!actor) throw new Error("Not connected");
      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i];
        const id = crypto.randomUUID();
        await actor.addVideoClip(
          id,
          seg.title,
          seg.caption,
          seg.aspectRatio,
          seg.partNumber,
          null,
          seg.url,
          seg.startTime,
          seg.endTime,
        );
        onClipCreated?.(i + 1, segments.length);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips"] });
      queryClient.invalidateQueries({ queryKey: ["myClips"] });
    },
  });
}

export function useDeleteClip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      await actor.deleteClip(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips"] });
      queryClient.invalidateQueries({ queryKey: ["myClips"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
  });
}

export function usePromoteToAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not connected");
      await actor.promoteToAdmin(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useDemoteFromAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Principal) => {
      if (!actor) throw new Error("Not connected");
      await actor.demoteFromAdmin(user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}
