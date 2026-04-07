import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  module ShippingOrder {
    public type Order = {
      orderId : Text;
      customerName : Text;
      trackingLink : Text;
      status : OrderStatus;
      createdAt : Int;
    };

    public func compare(order1 : Order, order2 : Order) : Order.Order {
      Int.compare(order1.createdAt, order2.createdAt);
    };

    public type OrderStatus = {
      #processing;
      #shipped;
      #delivered;
      #cancelled;
    };
  };

  // --- Order-related types ---
  type Order = ShippingOrder.Order;
  type OrderStatus = ShippingOrder.OrderStatus;

  // -- User Profile types --
  public type UserProfile = {
    name : Text;
    // Other user metadata if needed
  };

  // --- Authorization ---
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // --- Persistent data structures ---

  // Stores orders by orderId
  let allOrders = Map.empty<Text, Order>();

  // Stores user profiles
  let userProfiles = Map.empty<Principal, UserProfile>();

  // --- User Profile Methods ---
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

  // --- Public order methods (no login needed) ---

  public query func getOrder(orderId : Text) : async Order {
    switch (allOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?x) { x };
    };
  };

  // --- ADMIN Order methods ---
  // Mark sensitive methods as admin-only!

  // Remaining CRUD is admin-only
  public shared ({ caller }) func createOrder(order : Order) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create orders");
    };
    let orderExists = allOrders.containsKey(order.orderId);
    if (orderExists) {
      Runtime.trap("Order already exists! Please choose a different order ID.");
    };
    let orderWithTimestamp = {
      order with
      createdAt = Time.now();
    };
    allOrders.add(order.orderId, orderWithTimestamp);
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, newStatus : OrderStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (allOrders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        let updatedOrder = {
          order with
          status = newStatus;
        };
        allOrders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func deleteOrder(orderId : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };
    let orderExists = allOrders.containsKey(orderId);
    if (not orderExists) {
      Runtime.trap("Order not found");
    };
    allOrders.remove(orderId);
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    allOrders.values().toArray().sort();
  };
};
