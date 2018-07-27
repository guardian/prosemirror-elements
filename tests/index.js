import 'mocha/mocha.js';

mocha.setup('bdd');

import('./embed.spec.ts').then(() => {
  mocha.checkLeaks();
  mocha.run();
});
