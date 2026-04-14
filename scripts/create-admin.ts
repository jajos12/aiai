import { db } from '../lib/db/database';
import { hashPassword } from '../lib/auth/password';

const adminEmail = 'abrhamhabtom17@gmail.com';
const adminPassword = 'Chuchu@2255';
const adminName = 'Admin';

const passwordHash = hashPassword(adminPassword);

const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

if (existingAdmin) {
  console.log('Admin user already exists. Updating role...');
  db.prepare('UPDATE users SET role = ?, is_verified = 1 WHERE email = ?').run('admin', adminEmail);
} else {
  console.log('Creating admin user...');
  db.prepare(
    'INSERT INTO users (email, password_hash, name, role, is_verified) VALUES (?, ?, ?, ?, 1)'
  ).run(adminEmail, passwordHash, adminName, 'admin');
}

console.log('Admin user setup complete!');
console.log(`Email: ${adminEmail}`);
console.log('Password: Chuchu@2255');