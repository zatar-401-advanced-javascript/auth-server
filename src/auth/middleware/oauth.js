require('dotenv').config();
const superagent = require('superagent');
const users = require('../models/users-model');

const tokenServerUrl = 'https://github.com/login/oauth/access_token';
const remoteAPI = 'https://api.github.com/user';

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const API_SERVER = process.env.API_SERVER;

module.exports = async (req, res, next) => {
  try {
    // console.log('cry');
    const code = req.query.code;
    // console.log('1. CODE', code);
    const access_token = await exchangeCodeForToken(code);
    // console.log('2. TOKEN', access_token);
    const remoteUser = await getRemoteUserInfo(access_token);
    // console.log('3. REMOTE USER \n', remoteUser);
    const [user, token] = await getUser(remoteUser);
    // console.log('USER & TOKEN', user, token);
    req.user = user;
    req.token = token;
    next();
    // 
  } catch (err) {
    next(`ERROR ${err.message}`);
  }
};

async function exchangeCodeForToken(code) {
  const tokenResponse = await superagent.post(tokenServerUrl).send({
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: API_SERVER,
    grant_type: 'authorization_code',
  });
  return tokenResponse.body.access_token;
}

async function getRemoteUserInfo(token) {
  const userResponse = await superagent
    .get(remoteAPI)
    .set('Authorization', `token ${token}`)
    .set('user-agent', 'express-app');

  return userResponse.body;
}
// save the remote user to the db
async function getUser(remoteUser) {
  const record = {
    username: remoteUser.login,
    password: 'oauthpassword',
  };
  const check = await users.read(record.username);
  if(check.length > 0){
    const user = check;
    const token = users.generateToken(user);
    return [user, token];
  }else{
    const user = await users.save(record);
    const token = users.generateToken(user);
    return [user, token];
  }
}