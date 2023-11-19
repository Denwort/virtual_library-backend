const express = require('express')
const ruta = express.Router()
const db = require('../db/models/index.js')

ruta.post('/reservar', async (req, res) => {
    let obj = req.body
    console.log(obj)
    let rpta = await db.reserva.create( obj )
    res.status(200).json(rpta);
    let libro = await db.libro.findByPk(obj.libro_id)
    await libro.increment('contador', { by: 1 })
    let persona = await db.persona.findByPk(obj.persona_id)
    await libro.update({ultimo_reservante : persona.nombres})
    console.log(libro)
});
  
module.exports = ruta