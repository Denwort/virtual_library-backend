const express = require('express')
const ruta = express.Router()
const db = require('../db/models/index.js')

ruta.get('/all', async (req,res) => {
    let rpta = await db.persona.findAll( {} )
    res.json(rpta)
})

ruta.post('/validar', async (req, res) => {
    let obj = req.body
    let correo = obj.correo
    let contrasenha = obj.contrasenha
    let persona = await db.persona.findOne( {
        where : {
            correo : correo,
            contrasenha : contrasenha
        }
    })
    if(persona){
        console.log("existe")
        return res.status(200).json(persona)
    }
    else {
        console.log("no existe")
        return res.status(404).json(persona)
    }
  });
  
ruta.post('/registrar', async (req, res) => {
    let obj = req.body
    console.log(obj)
    let rpta = await db.persona.create( obj )
    res.status(200).json(rpta);
});
  
module.exports = ruta