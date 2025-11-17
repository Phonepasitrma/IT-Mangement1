require('dotenv').config();
const app = require('./app');
const { poolPromise } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Wait for database connection then start server
poolPromise
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
