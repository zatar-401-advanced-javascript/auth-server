const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET || 'z1337z';

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

  generateToken(user,expires) {
    // console.log(SECRET);
    let token;
    if(expires){
      token = jwt.sign({ username: user.username }, SECRET, {
        expiresIn: `${expires}`,
      });
    }else{
      token = jwt.sign({ username: user.username }, SECRET);
    }
    return token;
  }

  async authenticateToken(token) {
    try {
      console.log('test');
      const tokenObject = jwt.verify(token, SECRET);
      console.log('token obj', tokenObject);
      const check = await this.read(tokenObject.username);
      if (check) {
        return Promise.resolve(tokenObject);
      } else {
        return Promise.reject();
      }
    } catch (e) {
      return Promise.reject(e.message);
    }
  }

  read(element) {
    // console.log(element);
    const query = element ? { username: element } : {};
    // console.log(query);
    return user.find(query);
  }
}
module.exports = new Users();

