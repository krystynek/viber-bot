// VIBER BOT PACKAGES
const ViberBot = require('viber-bot').Bot;
// const BotEvents = require('viber-bot').Events;
const TextMessage = require('viber-bot').Message.Text;
const { createLogger } = require('./lib/utils')

// FILESYSTEM AND REQUIRED CONFIGS
const claimFlow = require('./flows/claim-flow')

// PACKAGES FOR LOCALHOST TESTING
const bodyParser = require('body-parser')
const express = require('express')
const app = express()

// SQLITE
const db = require('./database')

// LOGGER
const logger = createLogger();

// Creating the bot with access token, name and avatar
const bot = new ViberBot(logger, {
  authToken: process.env.VIBER_AUTH_TOKEN, // <--- Change in heroku .env
  name: process.env.BOT_NAME,  // <--- Change in Heroku .env
  avatar: 'http://api.adorable.io/avatar/200/isitup', // It is recommended to be 720x720, and no more than 100kb.
});


let isLocalInstance = false
const port = process.env.PORT || 4040;
if (process.env.NOW_URL || process.env.HEROKU_URL) {
  const http = require('http');

  http.createServer(bot.middleware()).listen(port, () => bot.setWebhook(process.env.NOW_URL || process.env.HEROKU_URL));
} else {
  isLocalInstance = true
  logger.debug('Could not find the now.sh/Heroku environment variables. Please make sure you followed readme guide.');
}

// *****************************************************************************************
// **************************          VIBER BOT         ***********************************
// *****************************************************************************************
// bot.getBotProfile().then(response => console.log(`Bot Named: ${response.name}`));
bot.onSubscribe(response => {
  intro(response)
})

bot.onTextMessage(/./, (message, response) => {
  checkProgress(response.userProfile.id, message.text, response)
})

// *****************************************************************************************
// ************************      MAIN   FUNCTION         ***********************************
// *****************************************************************************************

async function checkProgress (userId, message, response) {
  await checkClaimExists(userId).then(async (claimData) => {

    if (claimData) {
      console.log(claimData)
      if (message === 'edit' || message === 'Edit') {
        console.log('start edit')
        const msg = 'Select one od the options:\n' + editAnsweredQuestions() + '[x] Cancel'
        await updateClaim(userId, 'edit', 'edit')
        say(response, msg)
      }

      else if (message === 'reset') {
        console.log('starting from the beginning')
        await deleteClaim(userId)
        await createClaim(userId)
        intro(response)
      }

      else if (claimData.edit !== null) {
        if (message === 'x' || message === 'X') {
          // cancel and continue
          console.log('edit cancelled')
          await updateClaim(userId, 'edit', null)
          executeStepFromFLow(userId, claimData.step, message, response)
        }

        else if (claimData.edit !== 'edit') {
          // if edit step is set, execute and continue
          const step = claimData.edit
          console.log('editing step:', step)
          await updateClaim(userId, 'edit', null)
          executeStepFromFLow(userId, step, message, response)
        }

        else {
          // set step to be edited
          console.log('setting edit step:', message)
          await updateClaim(userId, 'edit', message)
          const flow = claimFlow.find(item => item.step == message)
          say(response, flow.question)
        }
      }

      else {
        console.log('Normal flow')
        executeStepFromFLow(userId, claimData.step, message, response)
      }
    }

    else {
      console.log('Claim UID not found:', claimData)
      createClaim(userId)
      intro(response)
    }

    function editAnsweredQuestions () {
      const currentStep = claimData.step
      const options = claimFlow.filter(item => item.step <= currentStep).map(item => item.field).join('\n')
      return options
    }
  })
}

// *****************************************************************************************
// **************************          FUNCTIONS         ***********************************
// *****************************************************************************************

function checkClaimExists (uid) {
  return new Promise((resolve, reject) => {
    const sql = 'select * from claims where uid = ?'
    db.get(sql, [uid,], (err, row) => {
      if (err) {
        reject(err)
      }
      resolve(row)
    })
  })
}

function createClaim (id) {
  const sql = 'INSERT INTO claims (uid, step) VALUES (?,?)'
  db.run(sql, [id, 0,], function (err, result) {
    if (err) {
      console.log(err)
    } else {
      console.log(result)
    }
  })
  return

}
function updateClaim (uid, column, value) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE claims SET ${column} = ? WHERE uid = ?`
    db.run(sql, [value, uid,], function (err, row) {
      if (err) {
        reject(err)
      }
      resolve(row)
    })
  })
}

function deleteClaim (uid) {
  return new Promise((resolve, reject) => {
    console.log('deleting claim:', uid)
    const sql = 'DELETE FROM claims WHERE uid = ?'
    db.run(sql, [uid,], function (err, row) {
      if (err) {
        reject(err)
      }
      resolve(row)
    })
  })
}

function say (response, message) {
  response.send(new TextMessage(message));
}

function intro (response) {
  const initialGreeting = `Hi there. I am ${bot.name}! I will help you to create a new claim.\n`
  const msg = initialGreeting + claimFlow[0].question
  say(response, msg)
}


async function executeStepFromFLow (userId, step, input, response) {
  let msg = ''
  if (input) {
    step = +step

    // GET STEP FROM FLOW
    const flow = claimFlow.find(item => item.step === step)
    // VERIFY
    try {
      const columns = flow.validation.split('.')
      const valid = await validateInput(input, columns)

      if (valid) {
        // console.log('passed', valid)
        await updateClaim(userId, columns[1], input)
        await updateClaim(userId, 'step', step + 1)
        msg = claimFlow.find(item => item.step === step + 1).question
        say(response, msg)
      } else {
        msg = flow.error
        say(response, msg)
      }
    } catch (error) {
      console.log(error)
    }
  } else {
    console.log('no msg set')
    msg = claimFlow[step].question
    say(response, msg)
  }
}

async function validateInput (input, destination) {
  if (destination[0] === 'db') {
    console.log('checking if user record exists in our DB')
    try {
      const result = await validateAgainstDbRecord(input, destination[1])
      // console.log('validateInput:', result)
      return result
    } catch (err) {
      console.log('validateInput:', err)
    }
  } else {
    // TEMP PASS FOR NON DB ITEMS
    console.log('Other validation')
  }
}

function validateAgainstDbRecord (input, key) {
  return new Promise((resolve, reject) => {
    const sql = `select * from users where ${key} = ?`
    db.get(sql, [input,], (err, row) => {
      if (err) {
        reject('validateAgainstDbRecord:', err)
      }
      resolve(row)
    })
  })
}

// *****************************************************************************************
// JUST FOR TESTING.
// *****************************************************************************************
// EXPRESS

if (isLocalInstance) {

  const jsonParser = bodyParser.json()
  app.use(bodyParser.json({ type: 'application/*+json' }))
  app.listen(port, () => console.log('Server is running on port:', port));
  app.get('/users/:userId', function (req, res) {
    const id = req.params.userId
    try {
      const usersData = require(`./claims/${id}.json`);
      res.send(usersData)
    } catch (error) {
      console.log(error)
    }
  })

  app.post('/test', jsonParser, function (req, res) {
    res.userProfile = { 'name': 'test', 'id': 'test' }
    checkProgress('test', req.body.text, res)
  })
}