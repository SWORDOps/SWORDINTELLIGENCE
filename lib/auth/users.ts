// In production, this would connect to your database
// For now, this is a mock user store

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'client' | 'admin';
  mfaEnabled: boolean;
  mfaSecret?: string;
}

// Mock user database (replace with real database in production)
// Password for demo@client.com: demo123
const users: User[] = [
  {
    id: '1',
    email: 'demo@client.com',
    name: 'Demo Client',
    password: '$2a$10$Xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // hashed 'demo123'
    role: 'client',
    mfaEnabled: false,
  },
];

/**
 * Find a user by email address
 */
export function getUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

/**
 * Find a user by ID
 */
export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

/**
 * Get all users (admin only)
 */
export function getAllUsers(): User[] {
  return users;
}
