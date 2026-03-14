import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";

module {
  // Explicit type differences for migration
  type OldUserProfile = {
    name : Text;
  };

  type OldVideoClip = {
    id : Text;
    title : Text;
    caption : Text;
    videoBlob : ?Storage.ExternalBlob;
    videoUrl : ?Text;
    uploadTime : Time.Time;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    clips : Map.Map<Text, OldVideoClip>;
    accessControlState : AccessControl.AccessControlState;
  };

  // New types
  type AspectRatio = {
    #_9_16;
    #_1_1;
    #_16_9;
  };

  type NewVideoClip = {
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

  type NewActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
    clips : Map.Map<Text, NewVideoClip>;
    accessControlState : AccessControl.AccessControlState;
  };

  public func run(old : OldActor) : NewActor {
    let newClips = old.clips.map<Text, OldVideoClip, NewVideoClip>(
      func(_id, oldClip) {
        {
          oldClip with
          aspectRatio = #_16_9;
          partNumber = null;
          uploaderPrincipal = Principal.anonymous(); // Use anonymous instead of non-existent fromNat
        };
      }
    );
    { old with clips = newClips };
  };
};
