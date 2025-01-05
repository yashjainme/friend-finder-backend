const User = require('../models/userModel');

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username email')
      .populate('friendRequests.from', 'username email');
    
    res.json({
      friends: user.friends,
      friendRequests: user.friendRequests
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    const existingRequest = friend.friendRequests.find(
      request => request.from.toString() === req.user.id
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    friend.friendRequests.push({ from: req.user.id });
    await friend.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.respondToFriendRequest = async (req, res) => {
  try {
    const { requestId, accept } = req.body;
    const user = await User.findById(req.user.id);
    
    const request = user.friendRequests.id(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    if (accept) {
      user.friends.push(request.from);
      const friend = await User.findById(request.from);
      friend.friends.push(user._id);
      await friend.save();
    }

    user.friendRequests.pull(requestId);
    await user.save();

    res.json({
      message: accept ? 'Friend request accepted' : 'Friend request rejected'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);

    if (!friend) {
      return res.status(404).json({ message: 'Friend not found' });
    }

    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== req.user.id);

    await Promise.all([user.save(), friend.save()]);
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends');
    
    // Get all users except current user and their friends
    const potentialFriends = await User.find({
      _id: { 
        $ne: req.user.id, 
        $nin: user.friends
      }
    }).select('username email friends');

    // Calculate mutual friends for each potential friend
    const recommendations = await Promise.all(
      potentialFriends.map(async (potential) => {
        const mutualFriends = user.friends.filter(friend => 
          potential.friends.includes(friend._id)
        );

        return {
          _id: potential._id,
          username: potential.username,
          email: potential.email,
          mutualFriendCount: mutualFriends.length
        };
      })
    );

    // Sort by number of mutual friends
    recommendations.sort((a, b) => b.mutualFriendCount - a.mutualFriendCount);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
