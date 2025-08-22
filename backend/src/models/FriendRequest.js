import mongoose from "mongoose";

//ye to hmm dacha bna rhe and koi bhi variable me store kr skte hai
const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

//ye us dache ko model me convert krta hai, bcoz superpower mil
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
