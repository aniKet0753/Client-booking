const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const authenticateSuperAdmin = require('../middleware/authSuperadminMiddleware');
const authenticate = require('../middleware/authMiddleware');

// Submit new complaint
router.post('/', authenticate, async (req, res) => {
  try {
    const complaint = new Complaint({
      customerId: req.user.id,
      ...req.body
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
      .sort({ createdAt: -1 });
      
    res.send(complaints);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// Admin reply to complaint
// router.post('/:id/reply', authenticate, async (req, res) => {
//   try {
//     if (req.user.role !== 'superadmin') {
//       return res.status(403).send({ error: 'Access denied' });
//     }

//     const complaint = await Complaint.findById(req.params.id);
//     if (!complaint) {
//       return res.status(404).send({ error: 'Complaint not found' });
//     }
//     console.log(req.params.id)

//     console.log(complaint)
//     complaint.adminReplies.push({
//       message: req.body.message,
//       repliedBy: req.user.id,
//       isInternal: req.body.isInternal || false
//     });

//     if (req.body.status) {
//       complaint.status = req.body.status;
//     }

//     complaint.updatedAt = Date.now();
//     await complaint.save();

//     // Here you would add logic to send notifications/emails
//     // to customer or agent based on isInternal flag

//     res.send(complaint);
//   } catch (error) {
//     console.log(error);
//     res.status(400).send(error);
//   }
// });

router.post('/:id/reply', authenticate, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        if (req.user.role === 'customer' && complaint.status === 'resolved') {
            return res.status(403).json({ message: 'Cannot reply to a resolved complaint.' });
        }

        if (complaint.customerId.toString() !== req.user.id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin' && req.user.role !== 'agent') {
             return res.status(403).json({ message: 'Unauthorized to reply to this complaint' });
        }

        const { message } = req.body;
        
        // Determine if the reply is internal (from an admin/agent) or external (from customer)
        const isInternalReply = (req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.role === 'agent');

        complaint.adminReplies.push({
            message,
            repliedBy: req.user.id, // Store the ID of the logged-in user
            isInternal: isInternalReply // True if admin/agent, false if customer
        });
        
        if (complaint.status === 'resolved' && !isInternalReply) { // If a customer *could* reply and it was resolved, it would reopen
            complaint.status = 'in_progress';
        } else if (complaint.status === 'open' && isInternalReply) {
             // If agent replies to an open complaint, set it to in_progress
             complaint.status = 'in_progress';
        }
        
        complaint.updatedAt = Date.now(); // Update the timestamp
        await complaint.save();

        res.status(200).json({ message: 'Reply added successfully', complaint });
    } catch (error) {
        console.error('Error adding reply to complaint:', error);
        res.status(500).json({ message: 'Server error while adding reply.' });
    }
});

router.put('/:id/status', authenticate, async (req, res) => { // Added auth middleware
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Optional: Validate the new status value against the enum
    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Update the status
    complaint.status = status;
    complaint.updatedAt = Date.now(); // Manually update updatedAt

    await complaint.save();

    res.status(200).json({ message: 'Complaint status updated successfully', complaint });

  } catch (error) {
    console.error('Error updating complaint status:', error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

router.get('/my-complaints', authenticate, async (req, res) => {
    try {
        // Find complaints where customerId matches the logged-in user's ID
        const complaints = await Complaint.find({ customerId: req.user.id })
            .populate('customerId', 'name email') // Optional: populate customer info
            .populate('adminReplies.repliedBy', 'username') // To show who replied if you have this field
            .sort({ createdAt: -1 }); // Latest complaints first

        res.status(200).json(complaints);
    } catch (error) {
        console.error('Error fetching user complaints:', error);
        res.status(500).json({ message: 'Server error while fetching complaints.' });
    }
});

module.exports = router;