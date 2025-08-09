const Car = require('../models/car.schema');

const addCars = async(req, res) => {
    const { make, model, year, price, description, color, brand} = req.body;
    // Validate input

    if(!make || !model || !year || !price){
        return res.status(400).json({message: 'All field are required'});
    }
    try{
        // Create new car
        const newCar = new Car({
            make, 
            model, 
            year, 
            price, 
            description, 
            color, 
            brand
        });
        await newCar.save();

        return res.status(201).json({message: 'Car Added Successfully', carId: newCar._id, car: newCar});
    } catch(error){
        console.error('Error adding car', error);
        return res.status(500).json({message: 'Internal server error'});
    }
};

// Edit a car

const editCar = async(req, res) => {
    const { cardId } = req.params;
    const { make, model, year, price, description, color, brand} = req.body;
    try{
       const car = await Car.findById(carId);
       if(!car){
        return res.status(404).json({message: 'Car Not Found'});
       } 
       // Update car details
       car.make = make || car.make;
       car.model = model || car.model;
       car.year = year || car.year;
       car.price = price || car.price;
       car.description = description || car.description;
       car.color = color || car.color;
       car.brand = brand || car.brand;
       await car.save();
       return res.status(200).json({message: 'Car Updated Successfully'});
    } catch(error){
        console.error("Error updating car:", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};
// Delet a car
const deleteCar = async(req, res) => {
    const {carId} = req.params;
    try{
        const car = await Car.findByIdAndDelete(carId);
        if(!car){
            return res.status(404).json({message: 'Car not found'});
        }
        return res.status(200).json({message: 'Car deleted successfully'});
    } catch(error){
        console.error("Ërror deleting a car:", error);
        return res.status(500).json({message: "Internal Server Error"});
    }
};

// Get all cars
const getAllCars = async(req, res) => {
    try{
        const cars = await Car.find();
        return res.status(200).json({ cars })
    } catch(error){
        console.error("Error fetching cars:", error);
        return res.status(500).json({message: 'Internal Serval Error'});
    }
};
// Search cars by make
const searchCars = async(req, res) => {
    const { make } = req.query;
    try{
        const car = await car.findOne({ make: make });
        if(!car){
             return res.status(404).json({message: "Car Not Found"})
        };
        return res.status(200).json({ car });
    } catch(error){
        console.error("Error seaching cars:", error);
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports = {
    addCars,
    editCar,
    deleteCar,
    getAllCars,
    searchCars,
};