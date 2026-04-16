const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'local_db.json');

// Initial state
let db = { users: [], chats: [] };

// Load DB from file if it exists
const loadDB = () => {
  if (fs.existsSync(DB_PATH)) {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      db = JSON.parse(data);
      console.log(`[MOCK DB] Loaded ${db.users.length} users and ${db.chats.length} chats from local_db.json`);
    } catch (err) {
      console.error("Failed to load local_db.json:", err);
    }
  } else {
    console.log("[MOCK DB] No local_db.json found. Starting fresh.");
  }
};

// Save DB to file
const saveDB = () => {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error("Failed to save local_db.json:", err);
  }
};

// Initialize
loadDB();

const createQuery = (data) => ({
  select: () => createQuery(data),
  sort: () => createQuery(data),
  exec: async () => data,
  then: (resolve) => Promise.resolve(data).then(resolve),
  catch: (reject) => Promise.resolve(data).catch(reject)
});

const MockDB = {
  User: {
    findOne: (filter) => {
      const u = db.users.find(u => u.email === filter.email);
      return createQuery(u ? { ...u, matchPassword: async (p) => p === u.password } : null);
    },
    create: async (data) => {
      const user = { 
        ...data, 
        _id: `mock_user_${Date.now()}`,
      };
      db.users.push(user);
      saveDB();
      return { ...user, matchPassword: async (p) => p === user.password };
    },
    findById: (id) => {
      const u = db.users.find(u => u._id === id);
      return createQuery(u ? { ...u, matchPassword: async (p) => p === u.password } : null);
    }
  },
  Chat: {
    find: (filter) => {
      const filtered = db.chats.filter(c => c.user === filter.user);
      return createQuery(filtered);
    },
    findOne: (filter) => {
      const c = db.chats.find(c => c._id === filter._id && c.user === filter.user);
      
      const doc = c ? { 
        ...c, 
        save: async function() {
           const index = db.chats.findIndex(chat => chat._id === this._id);
           if (index !== -1) {
             db.chats[index] = { ...this };
             saveDB();
           }
        } 
      } : null;
      
      return createQuery(doc);
    },
    create: async (data) => {
      const chat = { 
        ...data, 
        _id: `mock_chat_${Date.now()}`, 
        messages: [], 
        isPinned: false,
        updatedAt: new Date()
      };
      db.chats.push(chat);
      saveDB();
      return { ...chat, save: async () => {} }; // Simple save for initial return
    },
    findByIdAndDelete: async (id) => {
      const index = db.chats.findIndex(c => c._id === id);
      if (index !== -1) {
        const deleted = db.chats.splice(index, 1);
        console.log(`[MOCK DB] Deleted chat: ${id}`);
        saveDB();
        return deleted[0];
      }
      return null;
    },
    findByIdAndUpdate: async (id, update) => {
      const index = db.chats.findIndex(c => c._id === id);
      if (index !== -1) {
        db.chats[index] = { ...db.chats[index], ...update, updatedAt: new Date() };
        saveDB();
        return db.chats[index];
      }
      return null;
    }
  }
};

module.exports = MockDB;
