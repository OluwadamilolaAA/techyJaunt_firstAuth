const axios = require("axios")
const Transaction = require('../models/transaction.schema');
const Car = require('../models/car.schema');

// Flutterwave webhook handler
exports.flutterwaveWebhook = async (req, res) => {
  try {
    // 1. Verify the request signature
    if (req.headers['verif-hash'] !== process.env.FLW_SECRET_HASH) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
    // Flutterwave sends events as POST JSON
    const event = req.body;
    // Validate event (optionally check signature)
    if (!event || !event.data || !event.data.tx_ref) {
      return res.status(400).json({ message: 'Invalid webhook data' });
    }
    const txRef = event.data.tx_ref;
    // Find transaction by tx_ref
    const transaction = await Transaction.findOne({ tx_ref: txRef });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    // Only process if not already successful
    if (transaction.status === 'successful') {
      return res.status(200).json({ message: 'Already processed' });
    }

    const flwRes = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${event.data.id}/verify`,
      { headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` } }
    );

    const paymentData = flwRes.data.data;
    
    // Check payment status
    if (event.data.status === 'successful' && paymentData.amount >= transaction.amount) {
      transaction.status = 'successful';
      await transaction.save();
      // Mark car as rented
      const car = await Car.findById(transaction.carId);
      if (car) {
        car.isRented = true;
        car.rentedBy = transaction.senderId;
        car.startDate = transaction.startDate;
        car.endDate = transaction.endDate;
        car.totalPrice = transaction.amount;
        car.status = 'approved';
        await car.save();
      }
      return res.status(200).json({ message: 'Payment processed and car rented' });
    } else {
      transaction.status = 'failed';
      await transaction.save();
      return res.status(200).json({ message: 'Payment failed or incomplete' });
    }
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};