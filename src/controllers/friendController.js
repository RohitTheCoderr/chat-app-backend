import FriendRequest from "../models/friendRequest.js";
import User from "../models/user.js";
import { sendFriendRequestEmail } from "../services/emailService.js";

const sendFriendRequest=async(req, res)=>{
    try {

        const {userId}=req.params
        const senderId=req.user._id        

        // Check if the user is trying to send a friend request to themselves
        if (senderId.toString() === userId) {
            return res.status(400).json({ success: false, message: "You cannot send a friend request to yourself" });
        }

        if(!userId){
           return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const existingRequest = await FriendRequest.findOne({
            $or: [
    {
      sender: senderId,
      receiver: userId,
    },
    {
      sender: userId,
      receiver: senderId,
    },
  ],
            status: "PENDING",
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: "This user has already sent you a friend request. Please accept or reject it."
 });
        }

        const existingFriendship = await User.findOne({
            _id: senderId,
            friends: userId,
        });

        if (existingFriendship) {
            return res.status(400).json({ success: false, message: "You are already friends with this user" });
        }
        
        const newFriendRequest = new FriendRequest({
            sender: senderId,
            receiver: userId,
        });

        const receiverUser=await User.findById({_id: userId})

        if(!receiverUser){
            return res.status(404).json({ success: false, message: "Receiver user not found" });
        }

        await sendFriendRequestEmail(receiverUser.email, receiverUser.name, req.user.name);

        await newFriendRequest.save();

        res.status(201).json({ success: true, message: "Friend request sent successfully", data: newFriendRequest });
        
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send friend request", error: error.message });
    }
}

const getFriendRequests=async(req, res)=>{
    try {
        const userId=req?.user?._id

        if(!userId){
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const friendRequests=await FriendRequest.find({receiver:userId, status:"PENDING"}).populate("sender", "name email avatar.url")

        res.status(200).json({ success: true, data: friendRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get friend requests", error: error.message });
    }
}

const acceptFriendRequest=async(req, res)=>{
    try {
        const {userId}=req.params
        const receiverId=req.user._id

        if(!userId){
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const friendRequest=await FriendRequest.findOne({sender:userId, receiver:receiverId, status:"PENDING"})

        if(!friendRequest){
            return res.status(404).json({ success: false, message: "Friend request not found" });
        }

        friendRequest.status="ACCEPTED"
        await friendRequest.save()

        // Add each other as friends
        await User.findByIdAndUpdate(userId, {$addToSet:{friends:receiverId}})
        await User.findByIdAndUpdate(receiverId, {$addToSet:{friends:userId}})

        res.status(200).json({ success: true, message: "Friend request accepted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to accept friend request", error: error.message });
    }
}

const declineFriendRequest=async(req, res)=>{
    try {
        const {userId}=req?.params
        const receiverId=req?.user?._id
        
        if(!userId){
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const friendRequest=await FriendRequest.findOne({sender:userId, receiver:receiverId, status:"PENDING"})

        if(!friendRequest){
            return res.status(404).json({ success: false, message: "Friend request not found" });
        }

        friendRequest.status="DECLINED"
        await friendRequest.save()

        res.status(200).json({ success: true, message: "Friend request declined successfully" });
    } catch (error) {
       res.status(500).json({ success: false, message: "Failed to decline friend request", error: error.message }) 
    }
}

const cancelFriendRequest=async(req, res)=>{
    try {
        const {userId}=req?.params
        const senderId=req?.user?._id

        if(!userId){
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const friendRequest=await FriendRequest.findOne({sender:senderId, receiver:userId, status:"PENDING"})

        if(!friendRequest){
            return res.status(404).json({ success: false, message: "Friend request not found" });
        }

        await FriendRequest.findByIdAndDelete(friendRequest._id)

        res.status(200).json({ success: true, message: "Friend request cancelled successfully" });
    } catch (error) {
       res.status(500).json({ success: false, message: "Failed to cancel friend request", error: error.message }) 
    }
}

export { sendFriendRequest, getFriendRequests, acceptFriendRequest, declineFriendRequest, cancelFriendRequest }
