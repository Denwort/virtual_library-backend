const express = require('express')
const ruta = express.Router()
const db = require('../db/models/index.js')
const { Op } = require("sequelize");

ruta.get('/busqueda', async (req, res) => {

    // Obtener parametros de busqueda
    let obj = req.query
    let keyword = obj.keyword != '' ? obj.keyword : ''
    let type = obj.type != '' ? obj.type : ''
    let filters = obj.filters ? obj.filters.split(',') : []
    if(filters.length === 0) return res.status(200).json([])

    console.log(req.query)
    console.log(filters)
    
    // Realizar consulta se libros segun parametros, incluyendo reservas
    let libros = await db.libro.findAll( {
        order :[['id', 'ASC']],
        where : {
            [Op.or] : {
                titulo : {
                    [Op.iLike] : filters.includes('titulo') ? `%${keyword}%` : 'sdjafdjhbkfalhblhb'
                },
                autor : {
                    [Op.iLike] : filters.includes('autor') ? `%${keyword}%` : '&&&&&&&&&&'
                },
                topicos : {
                    [Op.iLike] : filters.includes('genero') ? `%${keyword}%` : '&&&&&&&&&&&&'
                },
                isbn : {
                    [Op.iLike] : filters.includes('isbn') ? `%${keyword}%` : '&&&&&&&&&&&&&&&&'
                },
            }
            ,
            tipo : {
                [Op.iLike] : `%${type}%`
            }
        },
        include : {
            model: db.reserva,
            as: 'reservado',
            attributes : ['id', 'fecha_final'],
            order : [['id', 'DESC']]
        }
    })

    // Calcular si el libro esta disponible o no
    let rpta = []
    let hoy = new Date(obtenerFechaActual())
    libros.forEach(item=>{
        let disponibilidad = true;
        console.log(item.id, item.titulo)
        if(item.reservado) {
            //item.reservado = item.reservado.sort((a, b) => b.id - a.id);
            item.reservado.forEach(i=>{
                console.log(" ", i.id, i.fecha_final)
                if(i.fecha_final > hoy){
                    disponibilidad = false
                }
            })
            console.log("   Disponible: ", disponibilidad)
        }
        rpta.push({ ...item.get({ plain: true }), disponible: disponibilidad })
    })
    
    
    return res.status(200).json(rpta)
    
});

function obtenerFechaActual() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${mes}-${dia}`;
}

module.exports = ruta