const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET;

const user = mongoose.model('user', mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, require: true },
}));

class Users {
  constructor() {
  }
  async save(record) {
    const check = await user.find({ username: record.username });
    if (check.length > 0) {
      // console.log('__Check__',check.length);
      console.log('username already used');
      return Promise.reject();
    } else {
      record.password = await bcrypt.hash(record.password, 5);
      const newRecord = new user(record);
      return newRecord.save();
    }
  }
  async authenticateBasic(username, password) {
    // console.log(username,password);
    const check = await user.find({ username: username });
    // console.log(check);
    if (check.length > 0) {
      const valid = await bcrypt.compare(password, check[0].password);
      return valid ? check : Promise.reject();
    }

    return Promise.reject();
  }

  generateToken(user) {
    // console.log(SECRET);
    const token = jwt.sign({ username: user.username }, SECRET);
    return token;
  }
  
  read(_id) {
    const query = _id ? { _id } : {};
    return user.find(query);
  }
}
module.exports = new Users();



// module.exports = mongoose.model('user', user);
// read(_id) {
// const query = _id ? { _id } : {};
// return user.find(query);
//   }
// update(_id, record) {
//   return user.findByIdAndUpdate(_id, record, { new: true });
// }

// delete (_id) {
//   return user.findByIdAndDelete(_id);
// }