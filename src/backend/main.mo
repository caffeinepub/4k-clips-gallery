import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

import Migration "migration";

// Explicit migration
(with migration = Migration.run)
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
    if (caller != user and not (AccessControl.isAdmin(accessControlState, caller))) {
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

  // VideoClip type with additional fields
  public type AspectRatio = {
    #_9_16;
    #_1_1;
    #_16_9;
  };

  public type VideoClip = {
    id : Text;
    title : Text;
    caption : Text;
    videoBlob : ?Storage.ExternalBlob;
    videoUrl : ?Text;
    uploadTime : Time.Time;
    aspectRatio : AspectRatio;
    partNumber : ?Nat;
    uploaderPrincipal : Principal;
  };

  let clips = Map.empty<Text, VideoClip>();

  // Add a new video clip (Any user or admin)
  public shared ({ caller }) func addVideoClip(
    id : Text,
    title : Text,
    caption : Text,
    aspectRatio : AspectRatio,
    partNumber : ?Nat,
    videoBlob : ?Storage.ExternalBlob,
    videoUrl : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users or admins can add video clips");
    };

    let clip : VideoClip = {
      id;
      title;
      caption;
      aspectRatio;
      partNumber;
      videoBlob;
      videoUrl;
      uploadTime = Time.now();
      uploaderPrincipal = caller;
    };

    clips.add(id, clip);
  };

  // Delete a clip (Admin or owner)
  public shared ({ caller }) func deleteClip(id : Text) : async () {
    let clip = switch (clips.get(id)) {
      case (null) { Runtime.trap("Clip not found") };
      case (?c) { c };
    };

    if (caller != clip.uploaderPrincipal and not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only uploader or admin can delete clips");
    };

    clips.remove(id);
  };

  // List all clips (Public access)
  public query func listClips() : async [VideoClip] {
    clips.values().toArray();
  };

  // List only clips uploaded by current user
  public query ({ caller }) func listMyClips() : async [VideoClip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their clips");
    };

    let filtered = clips.values().toArray().filter(
      func(clip) { clip.uploaderPrincipal == caller }
    );
    filtered;
  };

  // Admin stats record
  public type AdminStats = {
    userCount : Nat;
    clipCount : Nat;
  };

  // Admin stats (Admin only)
  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access stats");
    };

    let userCount = userProfiles.size();
    let clipCount = clips.size();

    {
      userCount;
      clipCount;
    };
  };

  // Export user role for frontend use
  public type UserRole = AccessControl.UserRole;

  // List all users with roles (Admin only)
  // Note: We collect users from userProfiles and get their roles
  public query ({ caller }) func listAllUsers() : async [(Principal, UserRole)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list all users");
    };

    // Collect all users who have profiles and their roles
    let users = userProfiles.keys().toArray().map(
      func(user) {
        (user, AccessControl.getUserRole(accessControlState, user));
      }
    );
    users;
  };

  // Promote user to admin (Admin only)
  public shared ({ caller }) func promoteToAdmin(user : Principal) : async () {
    // assignRole already includes admin-only guard, but we check explicitly for clarity
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can promote users");
    };
    AccessControl.assignRole(accessControlState, caller, user, #admin);
  };

  // Demote to regular user (Admin only)
  public shared ({ caller }) func demoteFromAdmin(user : Principal) : async () {
    // assignRole already includes admin-only guard, but we check explicitly for clarity
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can demote users");
    };
    AccessControl.assignRole(accessControlState, caller, user, #user);
  };
};

