'use strict';
require('./server').startServer().catch(require('./server').startupError);
