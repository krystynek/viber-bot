### Viber online claim bot

## How to test

- Go to https://partners.viber.com and log in with your viber account.
- Create your own bot.

### Locally

- set `VIBER_AUTH_Token` and `BOT_NAME` in `.env.local` for your own
- to send a message POST a JSON in body `{ text: "Here is the message" }` to `localhost:4040/test`

### Viber

- Deploy on your own heroku (set the abobe variables)
- scan the barcode from the viber admin panel and from hamburger menu, select receive messages (this should subscribe you)
- run locally with nodemon `nodemon index.js` (`npm i -g nodemon` if you don't have it)

### What's next

# Create a public account to publish the bot

(requires public mobile number)

# Deploy

- deploy on HEROKU
- change the A / CNAME Records

# Share

- share the link on your website
