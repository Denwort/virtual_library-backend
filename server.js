/*
Iniciar postgres:
initdb -U postgres -A password -E utf8 -W -D “C:\BD\DATA”
pg_ctl -D “C:\BD\DATA” -l “C:\BD\LOG\log.txt” start
psql -U postgres

Para crear, rellenar la base de datos y ejecutar el servidor: 
npx sequelize db:create
npx sequelize db:migrate
npx sequelize-cli db:seed:all
npm run dev

Para borrar base de datos en caso haya error:
DROP DATABASE proyectopw1;
*/
const express = require('express');
const bodyParser = require("body-parser")
const path = require('path');

// require
const prueba = require('./api/prueba')
// -----

const app = express()
const port = 3080

app.use(express.static(path.join(__dirname, './static')));
app.use(bodyParser.json());

// use
app.use('/api/prueba',prueba)
//-----

app.get('/', (req,res) => {
  res.sendFile(path.join(__dirname, './static/index.html'));
});

app.listen(port, () => {
    console.log(`Server escuchando en el port::${port}`);
});
