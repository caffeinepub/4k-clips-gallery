import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";


import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Use explicit migration

actor {
  include MixinStorage();

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type (unchanged)
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management (unchanged)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Updated VideoClip type with optional videoBlob and videoUrl
  public type VideoClip = {
    id : Text;
    title : Text;
    caption : Text;
    videoBlob : ?Storage.ExternalBlob; // Can be null for URL-based clips
    videoUrl : ?Text; // URL for external video, null for file uploads
    uploadTime : Time.Time;
  };

  let clips = Map.empty<Text, VideoClip>();

  // Add a new video clip with file upload (Admin only)
  public shared ({ caller }) func addVideoClip(id : Text, title : Text, caption : Text, videoBlob : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add video clips");
    };

    let clip : VideoClip = {
      id;
      title;
      caption;
      videoBlob = ?videoBlob; // Set videoBlob, videoUrl remains null
      videoUrl = null;
      uploadTime = Time.now();
    };

    clips.add(id, clip);
  };

  // Add a new video clip from URL (Admin only)
  public shared ({ caller }) func addVideoClipFromUrl(id : Text, title : Text, caption : Text, url : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add video clips from URLs");
    };

    let clip : VideoClip = {
      id;
      title;
      caption;
      videoBlob = null; // No file upload, videoUrl is set
      videoUrl = ?url;
      uploadTime = Time.now();
    };

    clips.add(id, clip);
  };

  // Delete a clip (Admin only)
  public shared ({ caller }) func deleteClip(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete clips");
    };
    clips.remove(id);
  };

  // List all clips (Public access - no authorization check needed)
  public query ({ caller }) func listClips() : async [VideoClip] {
    clips.toArray().map(func((_, v)) { v });
  };
};
