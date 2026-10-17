const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const STORE_FILE = path.join(DATA_DIR, 'localStore.json');

// Initial default empty data schema
const defaultState = {
  users: [],
  trials: [],
  contactMessages: [],
  attendance: [],
  bookings: [],
  lastUpdated: new Date().toISOString(),
};

/**
 * Ensures data directory and persistence file exist
 */
const initStore = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(defaultState, null, 2), 'utf8');
    }
  } catch (err) {
    console.warn('[LocalStore Warning] Failed to initialize storage file:', err.message);
  }
};

/**
 * Reads data synchronously from local JSON file
 */
const readStore = () => {
  try {
    initStore();
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf8');
      return JSON.parse(content || '{}');
    }
  } catch (err) {
    console.warn('[LocalStore Warning] Error reading store, using defaults:', err.message);
  }
  return { ...defaultState };
};

/**
 * Writes updated data safely to local JSON file
 */
const writeStore = (data) => {
  try {
    initStore();
    const payload = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(payload, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[LocalStore Warning] Error saving store:', err.message);
    return false;
  }
};

/**
 * Helper to append or update a record in a specific collection
 */
const saveRecord = (collectionName, record) => {
  const current = readStore();
  if (!current[collectionName]) {
    current[collectionName] = [];
  }
  current[collectionName].unshift(record);
  writeStore(current);
  return record;
};

/**
 * Helper to retrieve all records from a specific collection
 */
const getRecords = (collectionName) => {
  const current = readStore();
  return current[collectionName] || [];
};

/**
 * Helper to delete a record by ID or field
 */
const deleteRecord = (collectionName, idField, idValue) => {
  const current = readStore();
  if (Array.isArray(current[collectionName])) {
    const initialLen = current[collectionName].length;
    current[collectionName] = current[collectionName].filter(item => {
      return item[idField] !== idValue && item.id !== idValue && item._id !== idValue;
    });
    if (current[collectionName].length !== initialLen) {
      writeStore(current);
      return true;
    }
  }
  return false;
};

// Initialize on module load
initStore();

module.exports = {
  readStore,
  writeStore,
  saveRecord,
  getRecords,
  deleteRecord,
};

