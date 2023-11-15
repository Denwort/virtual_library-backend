const express = require('express')
const ruta = express.Router()
const db = require('../db/models/index.js')

ruta.post('/reservar', async (req, res) => {
    let obj = req.body
    console.log(obj)
    let rpta = await db.reserva.create( obj )
    res.status(200).json(rpta);
});
  
module.exports = ruta