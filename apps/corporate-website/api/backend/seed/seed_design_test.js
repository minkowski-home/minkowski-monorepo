const fs = require('fs');

// Seed MongoDB with design test questions, optionally using env overrides.
const dataPath = process.env.DATA_PATH || './backend/seed/design_test_questions.json';
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'minkowski_design_test';

const raw = fs.readFileSync(dataPath, 'utf8');
const documents = JSON.parse(raw);

const client = new Mongo(uri);
const db = client.getDB(dbName);
const collection = db.getCollection('design_test_questions');

collection.deleteMany({});
collection.insertMany(documents);

print(`Inserted ${documents.length} question documents into ${dbName}.design_test_questions`);
client.close();
