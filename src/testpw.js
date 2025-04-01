const { hashPassword, verifyPassword } = require('./core/password');

async function main() {
  const password = '1234';

  console.log('The password:', password);

  const hash = await hashPassword(password);
  // bekijk hoe de hash opgebouwd is, wat herken je?
  // waar staat de timeCost, memoryCost, salt en de hash zelf?
  console.log('The hash:', hash);

  const hash2 = '$argon2id$v=19$m=131072,t=6,p=4$1DN8meLJA8txjOpmsXXIyA$giyLRzEIAwYAY+NSwfkoddXQadwrXC8mLo7xLk650m8';

  let valid = await verifyPassword(password, hash);
  console.log('The password', password, 'is', valid ? 'valid' : 'incorrect');

  valid = await verifyPassword(password, hash2);
  console.log('The password from java', password, 'is', valid ? 'valid' : 'incorrect');
}

main();
