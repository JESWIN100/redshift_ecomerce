const { createPool } =require ('mysql2/promise');

const pool = createPool({
  host: process.env.host,
  user: process.env.user,
  password: '',
  database:process.env.database,
  port:process.env.databaseport,
  connectionLimit: 50,
  connectTimeout: 10000,
  dateStrings: true,  
});

  async function testConnection() {
  const connection = await pool.getConnection();
  try {
   
    console.log('Connected to the SQL database');

   
  } catch (err) { 
    console.error('Error connecting to the database:', err.stack);
  } finally {
    connection.release();
  }
}



testConnection();
module.exports=pool
