const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Customer = require('../models/Customer');
const Superadmin = require('../models/Superadmin');
const Agent = require('../models/Agent');
const authenticate = require('../middleware/authMiddleware');

// Helper function to select the appropriate user model based on role
function selectModel(role) {
    if (role === 'superadmin') {
        return Superadmin;
    } else if (role === 'agent') {
        return Agent;
    } else {
        return Customer;
    }
}

// Recursive helper function to filter approved content
const filterApprovedContent = (items) => {
    if (!items || items.length === 0) return [];
    return items.filter(item => item.status === 'approved')
        .map(item => ({
            ...item,
            replies: filterApprovedContent(item.replies)
        }));
};

// Recursive helper function to find and add a nested reply/sub-reply
const findAndAddReplyRecursively = (repliesArray, targetReplyId, newReplyData) => {
    for (let i = 0; i < repliesArray.length; i++) {
        const reply = repliesArray[i];
        if (reply._id.toString() === targetReplyId) {
            reply.replies.unshift(newReplyData);
            return true;
        }
        if (reply.replies && reply.replies.length > 0) {
            if (findAndAddReplyRecursively(reply.replies, targetReplyId, newReplyData)) {
                return true;
            }
        }
    }
    return false;
};

// Recursive helper function to find and update reply status
const findAndUpdateReplyStatusRecursively = (replies, targetReplyId, newStatus) => {
    for (let reply of replies) {
        if (reply._id.toString() === targetReplyId) {
            reply.status = newStatus;
            return true;
        }
        if (reply.replies && reply.replies.length > 0) {
            if (findAndUpdateReplyStatusRecursively(reply.replies, targetReplyId, newStatus)) {
                return true;
            }
        }
    }
    return false;
};


// Recursive helper function to find and remove a reply
const findAndRemoveReplyRecursively = (repliesArray, targetReplyId) => {
    for (let i = 0; i < repliesArray.length; i++) {
        const reply = repliesArray[i];
        if (reply._id.toString() === targetReplyId) {
            repliesArray.splice(i, 1);
            return true;
        }
        if (reply.replies && reply.replies.length > 0) {
            if (findAndRemoveReplyRecursively(reply.replies, targetReplyId)) {
                return true;
            }
        }
    }
    return false;
};

router.post('/', authenticate, async (req, res) => {
    const { title, category, content } = req.body;
    const userRole = req.user.role;
    let userProfile;

    try {
        let selectedModel = selectModel(userRole);
        userProfile = await selectedModel.findById(req.user.id).select('-password');

        if (!userProfile) {
            return res.status(404).json({ error: 'Authenticated user profile not found' });
        }

        const newPost = new Post({
            user: req.user.id,
            author: userProfile.name,
            title,
            category,
            content,
            replies: []
        });

        const post = await newPost.save();
        res.status(201).json({ message: 'Post submitted for moderation.', post });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/', async (req, res) => {
    try {
        let posts = await Post.find().sort({ date: -1 }).lean();
        posts = posts.filter(post => post.status === 'approved');
        posts = posts.map(post => ({
            ...post,
            replies: filterApprovedContent(post.replies)
        }));
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/:id/toggle-like', authenticate, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.status !== 'approved') {
            return res.status(403).json({ error: 'Cannot like a post that is not approved.' });
        }
        const isLiked = post.likedBy.includes(req.user.id);
        if (isLiked) {
            post.likes = Math.max(0, post.likes - 1);
            post.likedBy = post.likedBy.filter(
                (userId) => userId.toString() !== req.user.id
            );
        } else {
            post.likes += 1;
            post.likedBy.push(req.user.id);
        }
        await post.save();
        res.json({ likes: post.likes });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/:id/reply', authenticate, async (req, res) => {
    const { replyContent } = req.body;
    const userRole = req.user.role;

    if (!replyContent || replyContent.trim() === '') {
        return res.status(400).json({ error: 'Reply content cannot be empty' });
    }

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        let selectedModel = selectModel(userRole);
        const userProfile = await selectedModel.findById(req.user.id).select('-password');
        if (!userProfile) {
            return res.status(404).json({ error: 'Authenticated user profile not found' });
        }
        const newReply = {
            user: req.user.id,
            author: userProfile.name,
            content: replyContent,
            date: new Date(),
            replies: []
        };
        post.replies.unshift(newReply);
        await post.save();
        res.json({
            message: 'Reply submitted for moderation.',
            reply: newReply
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/:postId/replies/:replyId', authenticate, async (req, res) => {
    const { replyContent } = req.body;
    const { postId, replyId } = req.params;
    const userRole = req.user.role;

    if (!replyContent || replyContent.trim() === '') {
        return res.status(400).json({ error: 'Reply content cannot be empty' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        let selectedModel = selectModel(userRole);
        const userProfile = await selectedModel.findById(req.user.id).select('-password');
        if (!userProfile) {
            return res.status(404).json({ error: 'Authenticated user profile not found' });
        }
        const newSubReply = {
            user: req.user.id,
            author: userProfile.name,
            content: replyContent,
            date: new Date(),
            replies: []
        };
        const replyFoundAndAdded = findAndAddReplyRecursively(post.replies, replyId, newSubReply);
        if (!replyFoundAndAdded) {
            return res.status(404).json({ error: 'Parent reply not found in the post' });
        }
        await post.save();
        res.json({
            message: 'Sub-reply submitted for moderation.',
            reply: newSubReply
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.get('/moderation', authenticate, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 }).lean();
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/moderation/posts/:id/status', authenticate, async (req, res) => {
    console.log(req.body)
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided.' });
    }

    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        post.status = status;
        await post.save();
        res.json({ message: `Post status updated to ${status}`, post });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/moderation/replies/:postId/:replyId/status', authenticate, async (req, res) => {
    const { status } = req.body;
    const { postId, replyId } = req.params;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided.' });
    }

    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const replyUpdated = findAndUpdateReplyStatusRecursively(post.replies, replyId, status);
        if (!replyUpdated) {
            return res.status(404).json({ error: 'Reply not found in the post' });
        }
        await post.save();
        res.json({ message: `Reply status updated to ${status}`, post });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/moderation/posts/:id', authenticate, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        await Post.deleteOne({ _id: req.params.id });
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/moderation/replies/:postId/:replyId', authenticate, async (req, res) => {
    const { postId, replyId } = req.params;
    try {
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const replyRemoved = findAndRemoveReplyRecursively(post.replies, replyId);
        if (!replyRemoved) {
            return res.status(404).json({ error: 'Reply not found in the post' });
        }
        await post.save();
        res.json({ message: 'Reply deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;