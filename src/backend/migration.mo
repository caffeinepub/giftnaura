import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Int "mo:core/Int";

module {
  type OldShippingOrder = {
    orderId : Text;
    customerName : Text;
    trackingLink : Text;
    status : {
      #shipped;
      #delivered;
    };
    createdAt : Int;
  };

  type OldActor = {
    allOrders : Map.Map<Text, OldShippingOrder>;
    userProfiles : Map.Map<Principal, { name : Text }>
  };

  // New types
  type NewShippingOrder = {
    orderId : Text;
    customerName : Text;
    trackingLink : Text;
    status : {
      #processing;
      #shipped;
      #delivered;
      #cancelled;
    };
    createdAt : Int;
  };

  type NewActor = {
    allOrders : Map.Map<Text, NewShippingOrder>;
    userProfiles : Map.Map<Principal, { name : Text }>
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.allOrders.map<Text, OldShippingOrder, NewShippingOrder>(
      func(_orderId, oldOrder) {
        {
          oldOrder with status = migrateStatus(oldOrder.status)
        };
      }
    );
    {
      allOrders = newOrders;
      userProfiles = old.userProfiles;
    };
  };

  func migrateStatus(oldStatus : { #shipped; #delivered }) : {
    #processing;
    #shipped;
    #delivered;
    #cancelled;
  } {
    switch (oldStatus) {
      case (#shipped) { #shipped };
      case (#delivered) { #delivered };
    };
  };
};
