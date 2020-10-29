const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET || 'z1337z';

const user = mongoose.model('user', mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, require: true },
}));

const tokendb = mongoose.model('token', mongoose.Schema({
  token: { type: String, required: true },
  use: { type: Number, require: true },
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

  async generateToken(user,expires) {
    // console.log(SECRET);
    let token;
    let singleUse = process.env.TOKEN_SINGLE_USE || 'true';
    // console.log(singleUse);
    if(expires){
      token = jwt.sign({ username: user.username, use:singleUse }, SECRET, {
        expiresIn: `${expires}`,
      });
    }else{
      token = jwt.sign({ username: user.username, use:singleUse }, SECRET);
    }

    if(singleUse == 'true'){
      const record = {'token':token,'use':0};
      const tk = new tokendb(record);
      await tk.save();
    }

    return token;
  }

  async authenticateToken(token) {
    try {
      const tokenObject = jwt.verify(token, SECRET);
      const check = await this.read(tokenObject.username);
      // console.log('token obj', tokenObject);

      // second secure layer
      if(tokenObject.use == 'true'){
        const record = await tokendb.find({'token':token});
        if(record[0].use>0){
          return Promise.reject();
        }
        record[0].use += 1;
        // console.log(record[0]);
        await tokendb.findByIdAndUpdate(record[0]._id, record[0], { new: true });
        
      }

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

