const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    author: { 
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// After defining the initial ReplySchema, make it recursive
// This allows a 'replies' array within a ReplySchema itself
ReplySchema.add({
    replies: [ReplySchema] // This makes it recursive: a reply can have replies
});


const PostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    likes: {
        type: Number,
        default: 0
    },
    likedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    // Replies to the main post are an array of ReplySchema documents
    replies: [ReplySchema],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Post', PostSchema);