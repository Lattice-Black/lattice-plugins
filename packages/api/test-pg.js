const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'lattice',
  user: 'postgres',
  password: 'postgres',
});

pool.query('SELECT current_user, current_database()', (err, res) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log('Success!', res.rows[0]);
  pool.end();
});
