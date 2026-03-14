import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface AdminStats {
    clipCount: bigint;
    userCount: bigint;
}
export interface VideoClip {
    id: string;
    title: string;
    partNumber?: bigint;
    videoBlob?: ExternalBlob;
    uploaderPrincipal: Principal;
    caption: string;
    videoUrl?: string;
    uploadTime: Time;
    aspectRatio: AspectRatio;
}
export interface UserProfile {
    name: string;
}
export enum AspectRatio {
    _1_1 = "_1_1",
    _16_9 = "_16_9",
    _9_16 = "_9_16"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addVideoClip(id: string, title: string, caption: string, aspectRatio: AspectRatio, partNumber: bigint | null, videoBlob: ExternalBlob | null, videoUrl: string | null): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteClip(id: string): Promise<void>;
    demoteFromAdmin(user: Principal): Promise<void>;
    getAdminStats(): Promise<AdminStats>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllUsers(): Promise<Array<[Principal, UserRole]>>;
    listClips(): Promise<Array<VideoClip>>;
    listMyClips(): Promise<Array<VideoClip>>;
    promoteToAdmin(user: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
