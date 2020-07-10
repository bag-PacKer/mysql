'use strict';

const mysqlx = require('../../../../');

const config = JSON.parse(process.env.MYSQLX_CLIENT_CONFIG);

// required arguments
const schema = process.argv[2];
const table = process.argv[3];
const criteria = process.argv[4];
const placeholder = process.argv[5];
const assignment = process.argv[6];

const baseConfig = Object.assign({}, config, { schema });

mysqlx.getSession(baseConfig)
    .then(session => {
        return session.getDefaultSchema().getTable(table).select()
            .where(criteria)
            .bind(placeholder, assignment)
            .execute()
            .then(() => {
                return session.close();
            });
    })
    .catch(err => {
        // errors in should be passed as JSON to the parent process via stderr
        console.error(JSON.stringify({ message: err.message, stack: err.stack }));
        process.exit(1);
    });
