var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = 'db.sqlite'

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message)
    throw err
  } else {
    console.log('Connected to the SQLite database.')

    db.run(`CREATE TABLE IF NOT EXISTS claims (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid text UNIQUE,
        step integer,
        edit integer,
        name text,
        dob text,
        zip text,
        street text,
        house_number text,
        town text,
        CONSTRAINT uid_unique UNIQUE (uid))`, (err) => {
      if (err) {
        console.log(err)
      }
    })

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name text,
        dob text,
        zip text,
        street text,
        house_number text,
        town text)`, (err) => {
      if (err) {
        console.log('Table Users exists.')
      } else {
        // Table just created, creating some rows
        const insert = 'INSERT INTO users (name, dob, zip, street, house_number, town) VALUES (?,?,?,?,?,?)'
        db.run(insert, ['John Doe', '12/12/1990', 'NN18 8RP', 'Jay Road', '23', 'Corby',])
        db.run(insert, ['Jane Doe', '13/12/1990', 'NN18 8RP', 'Jay Road', '23', 'Corby',])
      }
    })
  }
})

module.exports = db