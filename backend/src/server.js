const app = require('./app');
const envConfig = require('../config/envConfig');
const dbConfig = require('../config/dbConfig');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(\Server is running on port \\);
});
