const express = require('express');
const router = express.Router();
const AgentChat = require('../models/AgentChat');
const Complaint = require('../models/Complaint');
const Agent = require('../models/Agent'); // To find agent details
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');
const authenticate = require('../middleware/authMiddleware');

router.post('/superadmin-to-agent', authenticateSuperAdmin, async (req, res) => {
  const { complaintId, agentId, message } = req.body; // agentId is required here

  try {
    let complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found.' });
    }

    if (!agentId) {
      return res.status(400).json({ msg: 'Agent ID is required to send a message.' });
    }

    const targetAgent = await Agent.findOne({"agentID":agentId}); // Using agentID field
    if (!targetAgent) {
      return res.status(404).json({ msg: 'Agent not found with the provided ID.' });
    }

    // Assign agent to complaint if not already assigned or if a new one is provided
    if (!complaint.agentInfo?.id || complaint.agentInfo.id.toString() !== targetAgent.agentID.toString()) {
      complaint.agentInfo = {
        id: targetAgent.agentID,
        name: targetAgent.name || targetAgent.username,
        location: targetAgent.location || 'N/A'
      };
    }

    // Create new agent chat message
    const newAgentMessage = new AgentChat({
      complaintId: complaint._id,
      sender: req.user.id, // Superadmin's User ID
      senderModel: 'Superadmin', // Correctly set to 'Superadmin'
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

router.post('/agent-to-superadmin', authenticate, async (req, res) => {
  const { complaintId, message } = req.body;
  const agent = await Agent.findById(req.user.id);
  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found.' });
    }

    // Check if the agent sending the message is actually assigned to this complaint
    if (!complaint.agentInfo || complaint.agentInfo.id.toString() !== agent.agentID.toString()) {
      return res.status(403).json({ msg: 'Forbidden: You are not assigned to this complaint.' });
    }

    const newAgentMessage = new AgentChat({
      complaintId: complaint._id,
      sender: req.user.id, // Agent's User ID
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

router.get('/for-complaint/:complaintId', authenticate, async (req, res) => {
  const { complaintId } = req.params;

  try {
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ msg: 'Complaint not found.' });
    }

    // Direct authorization check:
    if (req.user.role === 'superadmin') {
      // Superadmin can view all
    } else if (req.user.role === 'agent') {
      // Agent can only view if assigned to this complaint
      if (!complaint.agentInfo || complaint.agentInfo.id.toString() !== req.user.id.toString()) {
        return res.status(403).json({ msg: 'Forbidden: You are not authorized to view chats for this complaint.' });
      }
    } else {
      // Any other role (e.g., customer) is forbidden
      return res.status(403).json({ msg: 'Forbidden: You do not have permission to access this resource.' });
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


router.get('/my-agent-chats', authenticate, async (req, res) => {
  try {
    // Find all complaints assigned to this agent
    const agent = await Agent.findById(req.user.id);
    const complaintsAssigned = await Complaint.find({ 'agentInfo.id': agent.agentID }).select('_id');

    const complaintIds = complaintsAssigned.map(c => c._id);

    // Find all AgentChats where this agent is involved, either as sender or receiver
    const agentChats = await AgentChat.find({
      complaintId: { $in: complaintIds },
      $or: [
        { sender: req.user.id, senderModel: 'Agent' }, // Messages sent by this agent
        { senderModel: 'Superadmin' } // Messages sent by Superadmin
      ]
    })
    .populate({
      path: 'complaintId', // Populate complaint details for context
      // *** MODIFIED: Expand select to include all necessary fields and deep populate ***
      select: 'subject customerId agentInfo status description preferredResolution adminReplies createdAt',
      populate: [
        { // Populate customerId within the complaint
          path: 'customerId',
          select: 'name email username' // Select customer details
        },
        { // Populate adminReplies array, and their senders (customer or superadmin)
          path: 'adminReplies.repliedBy',
          select: 'name username role' // Select sender details for admin replies
        }
      ]
    })
    .populate({
      path: 'sender', // This is for the sender of the AgentChat message itself
      select: 'name username role'
    })
    .sort({ createdAt: 1 });

    // Group chats by complaintId for easier display on the agent's side
    const groupedChats = agentChats.reduce((acc, chat) => {
      const complaintId = chat.complaintId._id.toString();
      if (!acc[complaintId]) {
        acc[complaintId] = {
          complaint: chat.complaintId, // This now contains full complaint details including adminReplies and populated customerId
          messages: [] // This will hold the agent-superadmin messages
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