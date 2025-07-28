const bcrypt = require('bcryptjs');

const plainPassword = 'admin123'; // your original password

bcrypt.genSalt(10, (err, salt) => {
  if (err) throw err;

  bcrypt.hash(plainPassword, salt, (err, hash) => {
    if (err) throw err;

    console.log('Hashed password:', hash);
  });
});
