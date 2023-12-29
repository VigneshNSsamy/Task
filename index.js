const express = require('express')
const bodyParser = require('body-parser')
const JWT = require('jsonwebtoken')
const fs = require('fs')
const { generateKeyPairSync } = require('crypto')
const { expressjwt } = require('express-jwt')
const jwksClient = require('jwks-rsa')
const connectDb = require('./db')
const user = require('./user_module')



const app = express();
app.use(express.json());
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))

const PORT = 8005;
const KEY_EXPIRATION_SECONDS = 3600;
const SECRET_KEY = 'your_secret_key';
var { public, private } = {}
const username = 'Hello';


connectDb().then(()=>{
  console.log('Db Connected');
})

const keyPairs = {};
function generateRSAKeyPair() {
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    public = publicKey;
    private = privateKey
    return {
      publicKey,
      privateKey,
      kid: new Date().toISOString(),
      expiry: Date.now() + KEY_EXPIRATION_SECONDS * 1000,
    };
  }

  keyPairs['initial'] = generateRSAKeyPair();

  app.get('/jwks', (req, res) => {
    console.log('From GET call');
    const validKeys = Object.values(keyPairs).filter(key => key.expiry > Date.now());
  
    const jwks = {
      keys: validKeys.map(key => ({
        kty: 'RSA',
        kid: key.kid,
        use: 'sig',
        nbf: Math.floor(key.expiry / 1000) - KEY_EXPIRATION_SECONDS,
        exp: Math.floor(key.expiry / 1000),
        alg: 'RS256',
        e: 'AQAB',
        n: key.publicKey.split('-----')[2].replace(/\r?\n|\r/g, ''),
      })),
    };
    user.create({ jwkeys: jwks})
  
    res.json(jwks);
  });

const authenticationToken = (req,res,next)=>{
    const token = req.header('Authorization')
    console.log(token);
    if(!token) return res.sendStatus(401);

    JWT.verify(token, public, (err, user)=>{
        if(err) return res.sendStatus(403);
        req.user = user
        next();
    });
};




app.post('/login',(req,res,next)=>{
    const log_user = 'admin'
    console.log(log_user);
    const password = 'abcdefg'
    console.log(password);
      const secret = private
      console.log(secret);
      if(log_user!=username && log_pass!= password) return res.status(401).send('Invalide User');
      const token = JWT.sign(
      {
        username: log_user,
        password: password 
      }, secret, {expiresIn: '20min', algorithm: 'RS256'})
      res.send({ token })
      console.log(token);
  })

  app.use(
    expressjwt({
      secret: jwksClient.expressJwtSecret({
        jwksUri: 'http://localhost:8005/.well-known/jwks.json',
        cache: true,
        rateLimit: true,
      }),
      algorithms: ['RS256']
    }).unless({path: ['/', '/protected']})
);
  
app.get('/',async(req,res,next)=>{
    res.send({ message: 'This is Resource API routs'});
});

app.get('/protected', authenticationToken,(req,res,next)=>{
    res.send({ message: 'This is Protected Route'})
});

app.listen(PORT, ()=>{
    console.log('Running in PORT 8005');
})
  


  