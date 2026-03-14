import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalBlob } from "../backend";
import type { VideoClip } from "../backend.d";
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

export interface UploadClipParams {
  title: string;
  caption: string;
  videoBytes: Uint8Array<ArrayBuffer>;
  onProgress: (pct: number) => void;
}

export function useAddClip() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      caption,
      videoBytes,
      onProgress,
    }: UploadClipParams) => {
      if (!actor) throw new Error("Not connected");
      const id = crypto.randomUUID();
      const blob =
        ExternalBlob.fromBytes(videoBytes).withUploadProgress(onProgress);
      await actor.addVideoClip(id, title, caption, blob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips"] });
    },
  });
}

export function useAddClipFromUrl() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      caption,
      url,
    }: {
      title: string;
      caption: string;
      url: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const id = crypto.randomUUID();
      await actor.addVideoClipFromUrl(id, title, caption, url);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clips"] });
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
    },
  });
}
