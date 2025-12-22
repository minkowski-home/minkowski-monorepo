import { MongoClient, type Collection, type Db } from "mongodb";

type CollectionName =
  | "design_test_questions"
  | "images"
  | "applicants"
  | "attempts"
  | "supplemental_questions";

let client: MongoClient | null = null;

const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required.");
  }
  return uri;
};

const getDatabaseName = (): string => {
  return process.env.MONGODB_DB ?? "minkowski_design_test";
};

export const getClient = async (): Promise<MongoClient> => {
  if (!client) {
    client = new MongoClient(getMongoUri(), { uuidRepresentation: "standard" });
    await client.connect();
  }
  return client;
};

export const closeClient = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
  }
};

const getDatabase = async (): Promise<Db> => {
  const mongo = await getClient();
  return mongo.db(getDatabaseName());
};

export const getCollection = async <T>(name: CollectionName): Promise<Collection<T>> => {
  const db = await getDatabase();
  return db.collection<T>(name);
};
