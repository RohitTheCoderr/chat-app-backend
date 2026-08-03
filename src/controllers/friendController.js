



const sendFriendRequest=async(req, res)=>{
    try {

        const {userId}=req.params
        const senderId=req.body.userId
        
        // Check if the user is trying to send a friend request to themselves
        if (senderId === userId) {
            return res.status(400).json({ success: false, message: "You cannot send a friend request to yourself" });
        }

        if(!userId || !senderId){
           return res.status(400).json({ success: false, message: "User ID and sender ID are required" });
        }

        const existingRequest = await FriendRequest.findOne({
            sender: senderId,
            receiver: userId,
            status: "PENDING",
        });

        if (existingRequest) {
            return res.status(400).json({ success: false, message: "Friend request already sent" });
        }

        const newFriendRequest = new FriendRequest({
            sender: senderId,
            receiver: userId,
        });

        await newFriendRequest.save();

        res.status(201).json({ success: true, message: "Friend request sent successfully", data: newFriendRequest });
        
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to send friend request", error: error.message });
    }
}

const getFriendRequests=async(req, res)=>{
    try {
        const userId=req.body.userId

        if(!userId){
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const friendRequests=await FriendsRequest.findOne({receiver:userId, status:"PENDING"}).populate("sender", "username email avatar.url")

        res.status(200).json({ success: true, data: friendRequests });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get friend requests", error: error.message });
    }
}

export { sendFriendRequest, getFriendRequests, acceptFriendRequest, declineFriendRequest, cancelFriendRequest }