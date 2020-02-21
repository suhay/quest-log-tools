require(`dotenv`).config()

const fs = require(`fs`)
const path = require(`path`)

const yaml = require(`js-yaml`)
const mongodb = require(`mongodb`)
const { MongoClient } = mongodb

MongoClient
  .connect(`mongodb+srv://${process.env.MONGODB_HOST}`, {
    ssl: true,
    auth: {
      user: process.env.MONGODB_USERNAME,
      password: process.env.MONGODB_PASSWORD,
    },
    w: `majority`,
    useUnifiedTopology: true,
  })
  .then((client) => {
    const db = client
      .db(process.env.MONGODB_DB)

    const entries = fs.readdirSync(path.resolve(`./quest-log/entry`))
    const threads = fs.readdirSync(path.resolve(`./quest-log/thread`))
    const dialogs = fs.readdirSync(path.resolve(`./quest-log/dialog`))

    const entryCollection = db.collection(process.env.MONGODB_ENTRY_COLLECTION)
    const threadCollection = db.collection(process.env.MONGODB_THREAD_COLLECTION)
    const dialogCollection = db.collection(process.env.MONGODB_DIALOG_COLLECTION)

    Promise.all([
      entryCollection
        .deleteMany({})
        .then(() => entryCollection.insertMany(entries.map((entry) => JSON.parse(fs.readFileSync(`./quest-log/entry/${entry}`).toString())),
          {
            ordered: false,
          }))
        .then(({ result }) => {
          if (result.ok) {
            console.log(`entires - done!`)
          } else {
            console.log(`there was a problem inserting entries...`)
          }
        }),
      threadCollection
        .deleteMany({})
        .then(() => threadCollection.insertMany(threads.map((thread) => JSON.parse(fs.readFileSync(`./quest-log/thread/${thread}`).toString())),
          {
            ordered: false,
          }))
        .then(({ result }) => {
          if (result.ok) {
            console.log(`threads - done!`)
          } else {
            console.log(`there was a problem inserting threads...`)
          }
        }),
      dialogCollection
        .deleteMany({})
        .then(() => dialogCollection.insertMany(dialogs.map((dialog) => yaml.safeLoad(fs.readFileSync(`./quest-log/dialog/${dialog}`, `utf8`)))))
        .then(({ result }) => {
          if (result.ok) {
            console.log(`dialog - done!`)
          } else {
            console.log(`there was a problem inserting dialog...`)
          }
        }),
    ])
      .catch((err) => console.error(err))
      .finally(() => client.close())
  })
  .catch((err) => console.error(err))
