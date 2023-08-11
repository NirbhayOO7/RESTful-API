const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const port = 8000;


// Connect to MongoDB
let db;

main().catch(err => console.log(err));
async function main() {
    try {
        db=await mongoose.connect('mongodb://127.0.0.1:27017/WorkOnGrid');
    } catch (error) {
        console.log('Error connecting to database', err);
        return;
    }
}

// Define User schema
const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    age: Number,
    gender: String,
    email: String,
    phone: String,
    birth_date: String,
});

const User = mongoose.model('User', userSchema);

// API endpoint for getting users
app.get('/api/users', async (req, res) => {
    const first_name = req.query.first_name;
  
    if (!first_name) {
      return res.status(400).json({ error: 'Missing first_name parameter' });
    }
  
    // Search users in the MongoDB collection
    const users = await User.find({ first_name: { $regex: '^' + first_name } });
  
    if (users.length > 0) {
        console.log("User",users);
      return res.json({ users });
    }
  
    // If users not found, call the dummy API
    const dummyUrl = `https://dummyjson.com/users/search?q=${first_name}`;
    try {
      const response = await axios.get(dummyUrl);
      const dummyUsers = await response.data;
      // console.log(typeof(dummyUsers));

      // Save dummy users to the MongoDB collection
      // for(let i=0; i<1; i++){
      //   await User.insertMany(dummyUsers[i]);
      //   console.log(dummyUsers[i]);
      // }
      const users = dummyUsers.users;
      // console.log(users);
      for(let k in users){
        // console.log(`user at index ${k}: ${users[k].firstName}`);
        await User.insertMany({
          first_name: users[k].firstName,
          last_name: users[k].lastName,
          age: users[k].age,
          gender: users[k].gender,
          email: users[k].email,
          phone: users[k].phone,
          birth_date: users[k].birthDate
        });
      }

      // await User.insertMany(dummyUsers.users);
      
      // await User.save();
      // console.log("DummyUser:",dummyUsers.users);
      return res.json(dummyUsers);
    } catch (error) {
        console.log("Error fetching dummy users", error);
      return res.status(500).json({ error: 'Failed to fetch dummy users' });
    }
  });

// app.get('/',function(req, res){
//     console.log('request recived');
//     return res.redirect("https://dummyjson.com/users/search?q=first_name");
// });

app.listen(port, function(err){
    if(err){
        console.log("Error starting server:", err);
        return;
    }

    console.log("Server is running over port", port);
    return;
});