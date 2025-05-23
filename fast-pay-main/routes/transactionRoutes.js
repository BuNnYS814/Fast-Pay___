const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get user balance
router.get('/balance/:upi_id', async (req, res) => {
    try {
        const user = await User.findOne({ upi_id: req.params.upi_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Fetched balance:', user.balance); // Debug log
        res.json({ balance: Number(user.balance) || 0 });
    } catch (error) {
        console.error('Balance fetch error:', error);
        res.status(500).json({ message: 'Error fetching balance' });
    }
});

// Get user transactions
router.get('/transactions/:upi_id', async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [
                { sender_upi_id: req.params.upi_id },
                { receiver_upi_id: req.params.upi_id }
            ]
        }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

// Create new transaction
router.post('/transaction', async (req, res) => {
    try {
        const { sender_upi_id, amount, type, description } = req.body;
        
        // Find user
        let user = await User.findOne({ upi_id: sender_upi_id });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate new balance
        const currentBalance = Number(user.balance) || 0;
        const parsedAmount = Number(amount);
        const newBalance = type === 'Deposit' 
            ? currentBalance + parsedAmount 
            : currentBalance - parsedAmount;

        // Update user's balance in database
        user.balance = newBalance;
        await user.save();

        // Create transaction
        const transaction = new Transaction({
            sender_upi_id,
            receiver_upi_id: sender_upi_id,
            amount: parsedAmount,
            type,
            description,
            date: new Date()
        });
        await transaction.save();

        // Update user data in response
        res.json({ 
            success: true, 
            message: 'Transaction successful',
            balance: newBalance
        });
    } catch (error) {
        console.error('Transaction error:', error);
        res.status(500).json({ success: false, message: 'Transaction failed' });
    }
});

module.exports = router; 