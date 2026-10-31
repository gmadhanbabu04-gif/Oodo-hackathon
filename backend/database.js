const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'brightloop.json');

// Default initial state
const defaultData = {
  users: [],
  products: [],
  plans: [],
  quotationTemplates: [],
  subscriptions: [],
  discountRules: [],
  taxRules: [],
  invoices: [],
  payments: [],
  auditLogs: []
};

class Database {
  constructor() {
    this.data = { ...defaultData };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = { ...defaultData };
        this.save();
      }
    } catch (err) {
      console.error('Error loading database:', err);
      this.data = { ...defaultData };
    }
  }

  save() {
    try {
      const tempPath = `${DB_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_PATH);
    } catch (err) {
      console.error('Error saving database:', err);
    }
  }

  // Generic collection accessors
  getAll(collection) {
    return this.data[collection] || [];
  }

  getById(collection, id) {
    const list = this.data[collection] || [];
    return list.find(item => item.id === id);
  }

  findBy(collection, predicate) {
    const list = this.data[collection] || [];
    return list.filter(predicate);
  }

  findOne(collection, predicate) {
    const list = this.data[collection] || [];
    return list.find(predicate);
  }

  create(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    const newItem = {
      id: item.id || uuidv4(),
      createdAt: new Date().toISOString(),
      ...item
    };
    this.data[collection].push(newItem);
    this.save();
    return newItem;
  }

  update(collection, id, updates) {
    const list = this.data[collection] || [];
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this.data[collection][index] = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.data[collection][index];
  }

  delete(collection, id) {
    const list = this.data[collection] || [];
    const filtered = list.filter(item => item.id !== id);
    if (filtered.length !== list.length) {
      this.data[collection] = filtered;
      this.save();
      return true;
    }
    return false;
  }

  // Sequence generators for invoice and subscription human-readable numbers
  getNextNumber(type) {
    if (type === 'subscription') {
      const subs = this.data.subscriptions || [];
      const num = subs.length + 1;
      return `SUB-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`;
    }
    if (type === 'invoice') {
      const invs = this.data.invoices || [];
      const num = invs.length + 1;
      return `INV-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`;
    }
    if (type === 'payment') {
      const pays = this.data.payments || [];
      const num = pays.length + 1;
      return `PAY-${new Date().getFullYear()}-${String(num).padStart(4, '0')}`;
    }
    return `${type.toUpperCase()}-${Date.now()}`;
  }

  logAudit(action, actor, details) {
    this.create('auditLogs', {
      action,
      actor: actor || 'System',
      details,
      timestamp: new Date().toISOString()
    });
  }
}

const db = new Database();
module.exports = db;
