import { Client, Account, Databases } from 'appwrite';

export const PROJECT_ID = '6967dc1500276f2d4429';
export const DATABASE_ID = '696b8e000006c3271db0';
export const ENDPOINT = 'https://sgp.cloud.appwrite.io/v1';

const client = new Client();
client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
