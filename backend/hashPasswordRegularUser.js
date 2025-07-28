const bcrypt = require('bcryptjs');

const plainPassword = 'password123'; // Regular user password

bcrypt.genSalt(10, (err, salt) => {
  if (err) throw err;

  bcrypt.hash(plainPassword, salt, (err, hash) => {
    if (err) throw err;

    console.log('Hashed password for regular user:', hash);
  });
});