const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const crypto = require('crypto')


app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = [];
let data = {};


function generateRandomString(length) {
    return crypto.randomBytes(length)
                 .toString('hex')
                 .slice(0, length);
}
// Create new user
app.post('/api/users', (req, res) => {
  const newUserId = generateRandomString(16);
  const userObj = {
    username: `${req.body.username}`,
     _id: newUserId
  }
  data[newUserId] = { 'username': req.body.username,
                      'count': 0,
                      '_id': newUserId,
                      'log': []
                  };
  users.push(userObj);
  res.send(userObj);
})

app.get('/api/users', (req, res) => {
  res.send(users);
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const userId = req.params._id;
  const user = data[userId];
  const date = req.body.date ? new Date(req.body.date) : new Date(Date.now());
  const excerciseObj = { 'description': req.body.description,
                          'duration': parseInt(req.body.duration),
                          'date': date
  }

  user.log.push(excerciseObj);
  user.count++;
  res.send({ 'username': user.username,
              'description': excerciseObj.description,
              'duration': excerciseObj.duration,
              'date': excerciseObj.date.toDateString(),
              '_id': user._id
  });
})

app.get('/api/users/:_id/logs', (req, res) => {
  const userId = req.params._id;
  const from = req.query.from ? new Date(req.query.from) : new Date(-8640000000000000);
  const to = req.query.to ? new Date(req.query.to) : new Date(8640000000000000);
  const limit = req.query.limit;
  let userObj = data[userId];
  let partLog = userObj.log.filter(obj => {
    return obj.date > from && obj.date < to;
  })
  
  partLog = limit ? partLog.slice(0, limit) : partLog;
  if (from || to || limit) {
    userObj.log = partLog;
  }
  userObj.log.forEach(obj => {
    obj.date = obj.date.toDateString()
  });
  res.send(userObj);
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
