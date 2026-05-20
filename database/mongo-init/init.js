// ── Auth DB ─────────────────────────────────────────────────
db = db.getSiblingDB('auth-db');
db.createCollection('users');
db.users.insertMany([
  {
    username: 'admin',
    email: 'admin@musichub.com',
    password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: password
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'john',
    email: 'john@musichub.com',
    password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'jane',
    email: 'jane@musichub.com',
    password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
print('✅ auth-db seeded');

// ── Song DB ─────────────────────────────────────────────────
db = db.getSiblingDB('song-db');
db.createCollection('songs');
db.songs.insertMany([
  {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    album: 'A Night at the Opera',
    year: 1975,
    genre: 'Rock',
    duration: 354,
    createdBy: 'admin',
    createdByUsername: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Hotel California',
    artist: 'Eagles',
    album: 'Hotel California',
    year: 1977,
    genre: 'Rock',
    duration: 391,
    createdBy: 'admin',
    createdByUsername: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    year: 2020,
    genre: 'Pop',
    duration: 200,
    createdBy: 'admin',
    createdByUsername: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Shape of You',
    artist: 'Ed Sheeran',
    album: 'Divide',
    year: 2017,
    genre: 'Pop',
    duration: 234,
    createdBy: 'john',
    createdByUsername: 'john',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Lose Yourself',
    artist: 'Eminem',
    album: '8 Mile',
    year: 2002,
    genre: 'Hip-Hop',
    duration: 326,
    createdBy: 'john',
    createdByUsername: 'john',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Smells Like Teen Spirit',
    artist: 'Nirvana',
    album: 'Nevermind',
    year: 1991,
    genre: 'Grunge',
    duration: 301,
    createdBy: 'jane',
    createdByUsername: 'jane',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
print('✅ song-db seeded');

// ── User DB ─────────────────────────────────────────────────
db = db.getSiblingDB('user-db');
db.createCollection('users');
db.users.insertMany([
  {
    authId: 'admin',
    username: 'admin',
    email: 'admin@musichub.com',
    role: 'admin',
    bio: 'MusicHub administrator',
    favoriteGenre: 'Rock',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    authId: 'john',
    username: 'john',
    email: 'john@musichub.com',
    role: 'user',
    bio: 'Music lover',
    favoriteGenre: 'Hip-Hop',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    authId: 'jane',
    username: 'jane',
    email: 'jane@musichub.com',
    role: 'user',
    bio: 'Rock fan',
    favoriteGenre: 'Grunge',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
print('✅ user-db seeded');

// ── Chat DB ─────────────────────────────────────────────────
db = db.getSiblingDB('chat-db');
db.createCollection('messages');
db.messages.insertMany([
  {
    roomId: 'admin_john',
    senderId: 'admin',
    senderUsername: 'admin',
    receiverId: 'john',
    receiverUsername: 'john',
    content: 'Hey John! Welcome to MusicHub!',
    read: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    roomId: 'admin_john',
    senderId: 'john',
    senderUsername: 'john',
    receiverId: 'admin',
    receiverUsername: 'admin',
    content: 'Thanks! Great platform!',
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
print('✅ chat-db seeded');

print('🎵 MusicHub database initialization complete!');