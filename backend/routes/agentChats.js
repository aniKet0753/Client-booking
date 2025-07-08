// routes/agentChats.js
const express = require('express');
const router = express.Router();
const AgentChat = require('../models/AgentChat');
const Complaint = require('../model/Complaints'); // To update complaint.agentInfo and agentChat array
const Agent = require('../model/Agent'); // To find agent details
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Middleware for superadmin access
const superadminAuth = [auth, authorize(['superadmin'])];
// Middleware for agent access
const agentAuth = [auth, authorize(['agent'])];
// Middleware for superadmin OR agent access (for fetching relevant chats)
const superadminOrAgentAuth = [auth, authorize(['superadmin', 'agent'])];

// @route   POST /api/agent-chats/superadmin-to-agent
// @desc    Superadmin sends a message to an agent regarding a complaint
// @access  Private (Superadmin only)
router.post('/superadmin-to-agent', superadminAuth, async (req, res) => {
  const { complaintId, agentId, message } = req.body; // agentId is required here

  try {
    let complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found.' });
    }

    if (!agentId) {
      return res.status(400).json({ msg: 'Agent ID is required to send a message.' });
    }

    const targetAgent = await Agent.findById(agentId);
    if (!targetAgent) {
      return res.status(404).json({ msg: 'Agent not found with the provided ID.' });
    }

    // Assign agent to complaint if not already assigned or if a new one is provided
    if (!complaint.agentInfo?.id || complaint.agentInfo.id.toString() !== targetAgent._id.toString()) {
      complaint.agentInfo = {
        id: targetAgent._id,
        name: targetAgent.name || targetAgent.username,
        location: targetAgent.location || 'N/A'
      };
    }

    // Create new agent chat message
    const newAgentMessage = new AgentChat({
      complaintId: complaint._id,
      sender: req.user.id, // Superadmin's User ID
      senderModel: 'User', // Superadmin is a 'User'
      message: message,
    });

    await newAgentMessage.save();

    // Add the chat message ID to the complaint's agentChat array
    complaint.agentChat.push(newAgentMessage._id);
    await complaint.save();

    // Populate the newly created chat to return it or for immediate display logic
    await newAgentMessage.populate({ path: 'sender', select: 'name username role' });

    res.status(201).json({ msg: 'Message sent to agent and complaint updated successfully.', chatMessage: newAgentMessage });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/agent-chats/agent-to-superadmin
// @desc    Agent sends a message to superadmin regarding a complaint
// @access  Private (Agent only)
router.post('/agent-to-superadmin', agentAuth, async (req, res) => {
  const { complaintId, message } = req.body;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found.' });
    }

    // Check if the agent sending the message is actually assigned to this complaint
    // This is a crucial authorization check for agents
    if (!complaint.agentInfo || complaint.agentInfo.id.toString() !== req.user.id.toString()) {
      return res.status(403).json({ msg: 'Forbidden: You are not assigned to this complaint.' });
    }

    const newAgentMessage = new AgentChat({
      complaintId: complaint._id,
      sender: req.user.id, // Agent's User ID (assuming Agent model extends/is a User or has a linked User ID)
      senderModel: 'Agent', // Sender is an 'Agent'
      message: message,
    });

    await newAgentMessage.save();

    complaint.agentChat.push(newAgentMessage._id);
    await complaint.save();

    await newAgentMessage.populate({ path: 'sender', select: 'name username role' });

    res.status(201).json({ msg: 'Message sent to superadmin.', chatMessage: newAgentMessage });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/agent-chats/for-complaint/:complaintId
// @desc    Get all agent-superadmin messages for a specific complaint
// @access  Private (Superadmin or assigned Agent)
router.get('/for-complaint/:complaintId', superadminOrAgentAuth, async (req, res) => {
  const { complaintId } = req.params;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found.' });
    }

    // Authorization check: Superadmin can view all. Agent can only view if assigned.
    if (req.user.role === 'agent' && (!complaint.agentInfo || complaint.agentInfo.id.toString() !== req.user.id.toString())) {
      return res.status(403).json({ msg: 'Forbidden: You are not assigned to this complaint.' });
    }

    const agentChats = await AgentChat.find({ complaintId: complaintId })
      .populate({ path: 'sender', select: 'name username role' })
      .sort({ createdAt: 1 }); // Sort by creation date

    res.json(agentChats);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   GET /api/agent-chats/my-agent-chats
// @desc    Get all agent-superadmin messages for the currently logged-in agent
// @access  Private (Agent only)
router.get('/my-agent-chats', agentAuth, async (req, res) => {
  try {
    // Find all complaints assigned to this agent
    const complaintsAssigned = await Complaint.find({ 'agentInfo.id': req.user.id }).select('_id');

    const complaintIds = complaintsAssigned.map(c => c._id);

    // Find all AgentChats where this agent is involved, either as sender or receiver
    // This assumes the superadmin's ID is not fixed but is a 'User' ID
    const agentChats = await AgentChat.find({
      complaintId: { $in: complaintIds },
      $or: [
        { sender: req.user.id, senderModel: 'Agent' }, // Messages sent by this agent
        { senderModel: 'User' } // Messages sent by Superadmin (assuming Superadmin is User model)
      ]
    })
    .populate({
      path: 'complaintId', // Populate complaint details for context
      select: 'subject customerId agentInfo status'
    })
    .populate({
      path: 'sender',
      select: 'name username role'
    })
    .sort({ createdAt: 1 });

    // Group chats by complaintId for easier display on the agent's side
    const groupedChats = agentChats.reduce((acc, chat) => {
      const complaintId = chat.complaintId._id.toString();
      if (!acc[complaintId]) {
        acc[complaintId] = {
          complaint: chat.complaintId,
          messages: []
        };
      }
      acc[complaintId].messages.push(chat);
      return acc;
    }, {});

    res.json(Object.values(groupedChats)); // Return as an array of complaint objects with messages

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;