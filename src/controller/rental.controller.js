const User = require("../models/user.schema");
const Car = require("../models/car.schema");
const Transaction = require("../models/transaction.schema");
const flwApi = require("../config/flutterwave");

// 1. Initiate car rental and payment
exports.rentCarWithFlutterwave = async (req, res) => {
  const { carId } = req.params;
  const userId = req.user.id;
  const { startDate, endDate } = req.body;

  try {
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });
    if (car.isRented) return res.status(400).json({ message: "Car is already rented" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (new Date(startDate) < new Date()) {
      return res.status(400).json({ message: "Start date cannot be in the past" });
    }

    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    if (days <= 0) return res.status(400).json({ message: "End date must be after start date" });
    const totalPrice = car.price * days;

    const transaction = await Transaction.create({
      senderId: userId,
      carId: car._id,
      amount: totalPrice,
      status: "pending",
      startDate,
      endDate,
    });

    const paymentData = {
      tx_ref: `car_rental_${transaction._id}_${Date.now()}`,
      amount: totalPrice,
      currency: "NGN",
      redirect_url:
        process.env.FLW_REDIRECT_URL || "http://localhost:3000/api/payment/flutterwave/callback",
      customer: {
        email: user.email,
        name: user.name,
      },
      customizations: {
        title: "Car Rental Payment",
        description: `Payment for renting ${car.make} ${car.model} for ${days} day(s)`,
      },
      meta: {
        transactionId: transaction._id.toString(),
        carId: car._id.toString(),
        userId: user._id.toString(),
      },
    };

    const flwRes = await flwApi.post("/payments", paymentData);
    if (flwRes.data.status !== "success") {
      return res.status(500).json({ message: "Failed to initiate payment" });
    }

    transaction.tx_ref = paymentData.tx_ref;
    await transaction.save();

    return res.status(200).json({
      message: "Payment initiated",
      paymentLink: flwRes.data.data.link,
      transactionId: transaction._id,
    });
  } catch (error) {
    console.error("Error initiating payment:", error?.response?.data || error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// 2. Confirm payment and update rental status (called in your callback or webhook)
exports.confirmCarRentalPayment = async (req, res) => {
  const { transactionId } = req.body; // or req.query, depends on how you implement callback

  try {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    if (transaction.status === "successful") {
      return res.status(400).json({ message: "Transaction already confirmed" });
    }

    // Ideally, here you verify payment status with Flutterwave's API using transaction.tx_ref

    // For demo, assume payment is successful:
    transaction.status = "successful";
    await transaction.save();

    const car = await Car.findById(transaction.carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    car.isRented = true;
    car.rentedBy = transaction.senderId;
    car.startDate = transaction.startDate;
    car.endDate = transaction.endDate;
    car.totalPrice = transaction.amount;
    car.status = "pending"; // or 'approved'
    await car.save();

    return res.status(200).json({ message: "Car rental confirmed and updated", car });
  } catch (error) {
    console.error("Error confirming payment:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
