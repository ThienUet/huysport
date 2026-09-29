// MongoDB Initialization Script for SportX E-Commerce
// Automatically executed by Docker on container first boot

const dbName = 'sportx_db';
const sportxDB = db.getSiblingDB(dbName);

print('=======================================================');
print('🚀 [Docker Mongo-Init]: Initializing ' + dbName + '...');
print('=======================================================');

// 1. Create Collections
sportxDB.createCollection('users');
sportxDB.createCollection('products');
sportxDB.createCollection('orders');
sportxDB.createCollection('customers');
sportxDB.createCollection('sizerules');
sportxDB.createCollection('faqs');
sportxDB.createCollection('chatsessions');
sportxDB.createCollection('coupons');
sportxDB.createCollection('settings');

// 2. Create Indexes
sportxDB.users.createIndex({ id: 1 }, { unique: true });
sportxDB.users.createIndex({ email: 1 }, { unique: true });

sportxDB.products.createIndex({ id: 1 }, { unique: true });
sportxDB.products.createIndex({ sku: 1 }, { unique: true });
sportxDB.products.createIndex({ category: 1 });

sportxDB.orders.createIndex({ id: 1 }, { unique: true });
sportxDB.orders.createIndex({ orderNumber: 1 }, { unique: true });
sportxDB.orders.createIndex({ fulfillmentStatus: 1 });
sportxDB.orders.createIndex({ paymentStatus: 1 });

sportxDB.customers.createIndex({ id: 1 }, { unique: true });
sportxDB.customers.createIndex({ email: 1 }, { unique: true });
sportxDB.customers.createIndex({ tier: 1 });

sportxDB.sizerules.createIndex({ id: 1 }, { unique: true });
sportxDB.sizerules.createIndex({ ruleCode: 1 }, { unique: true });

sportxDB.faqs.createIndex({ id: 1 }, { unique: true });
sportxDB.faqs.createIndex({ intent: 1 });

sportxDB.chatsessions.createIndex({ id: 1 }, { unique: true });

sportxDB.coupons.createIndex({ id: 1 }, { unique: true });
sportxDB.coupons.createIndex({ code: 1 }, { unique: true });

print('✅ [Docker Mongo-Init]: All collections and indexes created successfully in ' + dbName);
