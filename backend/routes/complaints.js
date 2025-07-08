const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');
const authenticate = require('../middleware/authMiddleware'); // Assumes req.user has id and role

// Submit new complaint (from customer)
router.post('/', authenticate, async (req, res) => {
  try {
    const complaint = new Complaint({
      customerId: req.user.id,
      ...req.body
    });
    // Add the initial complaint message as the first entry in adminReplies
    // This makes sure the customer's initial message also appears in the conversation history
    complaint.adminReplies.push({
      message: req.body.description, // Assuming description is the initial message
      repliedBy: req.user.id,
      repliedByType: 'Customer', // Initial message always from customer
    });

    await complaint.save();
    res.status(201).send(complaint);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});

// Get all complaints (for superadmin)
router.get('/', authenticateSuperAdmin, async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).send({ error: 'Access denied' });
    }

    const complaints = await Complaint.find()
      .populate('customerId', 'name email')
      .populate({ // Populate adminReplies.repliedBy using refPath
        path: 'adminReplies.repliedBy',
        select: 'name username email role', // Select relevant fields from Admin/Customer/Agent
      })
      .sort({ createdAt: -1 });

    res.send(complaints);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// Get complaints for a specific customer (for customer dashboard)
router.get('/my-complaints', authenticate, async (req, res) => {
  try {
    // Ensure only customers can access their own complaints
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Only customers can view their complaints.' });
    }

    const complaints = await Complaint.find({ customerId: req.user.id })
      .populate('customerId', 'name email') // Populate the original customer
      .populate({ // Populate adminReplies.repliedBy using refPath
        path: 'adminReplies.repliedBy',
        select: 'name username email role', // Select relevant fields from Admin/Customer/Agent
      })
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({ message: 'Server error while fetching complaints.' });
  }
});

// Reply to a complaint (can be from customer, admin, superadmin, or agent)
router.post('/:id/reply', authenticate, async (req, res) => {
  try {
    console.log("object");
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const isCustomerReplying = (req.user.role === 'customer');
    const isAdminOrAgentReplying = ['admin', 'superadmin', 'agent'].includes(req.user.role);

    // Authorization check
    if (isCustomerReplying && complaint.customerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to reply to this complaint as a customer.' });
    }
    if (isAdminOrAgentReplying && !complaint.agentInfo?.id && req.user.role === 'agent') {
      // If agent info not set, and an agent is replying, assign them
      complaint.agentInfo = {
        id: req.user.id,
        name: req.user.name || req.user.username, // Assuming name or username is available on agent user object
        location: req.user.location || 'N/A' // Assuming location is available on agent user object
      };
    }

    const { message } = req.body;

    // Determine repliedByType based on the sender's role
    const repliedByType = req.user.role.charAt(0).toUpperCase() + req.user.role.slice(1);

    // Prevent customer from replying to resolved complaints
    if (isCustomerReplying && complaint.status === 'resolved') {
        return res.status(403).json({ message: 'You cannot reply to a resolved complaint.' });
    }

    complaint.adminReplies.push({
      message,
      repliedBy: req.user.id,
      repliedByType: repliedByType,
      // isInternal field is removed
    });

    // Update status based on who replied
    if (complaint.status === 'resolved' && isCustomerReplying) {
      complaint.status = 'in_progress'; // Re-open if customer replies to a resolved complaint
    } else if (complaint.status === 'open' && isAdminOrAgentReplying) {
      complaint.status = 'in_progress'; // Set to in_progress if admin/agent replies to an open complaint
    }

    complaint.updatedAt = Date.now();
    await complaint.save();

    res.status(200).json({ message: 'Reply added successfully', complaint });
  } catch (error) {
    console.error('Error adding reply to complaint:', error);
    res.status(500).json({ message: 'Server error while adding reply.' });
  }
});

// Update complaint status (admin/superadmin only)
router.put('/:id/status', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    complaint.status = status;
    complaint.updatedAt = Date.now();

    await complaint.save();

    res.status(200).json({ message: 'Complaint status updated successfully', complaint });

  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;