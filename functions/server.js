'use strict';

const mirror = require('./mirror'),
    host = '0.0.0.0',
    port = 8080;

mirror.app.listen(
    port, host, 511,
    () => mirror.logger.info('Listening on http://%s:%s', host, port)
);
