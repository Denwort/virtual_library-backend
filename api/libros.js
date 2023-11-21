const express = require('express')
const ruta = express.Router()
const db = require('../db/models/index.js')
const { Op } = require("sequelize");

ruta.get('/busqueda', async (req, res) => {

    // Obtener parametros de busqueda
    let obj = req.query
    let keyword = obj.keyword != '' ? obj.keyword : ''
    let type = obj.type != '' ? obj.type : ''
    let filters = obj.filters != '' ? obj.filters.split(',') : []

    let page = obj.page != '' ? obj.page : '' // de mi req llamos a despues del "?"
    let pageSize = 5
    // Necesito saber desde donde inicia la pagina y donde 
    let start = (page - 1) * pageSize // algoritmo para saber el punto de inicio
    let end = start + pageSize

    console.log(req.query)
    console.log(filters)

    // Realizar consulta se libros segun parametros, incluyendo reservas
    let libros = await db.libro.findAll({
        order: [['id', 'ASC']],
        where: {
            [Op.or]: {
                titulo: {
                    [Op.iLike]: filters.includes('titulo') ? `%${keyword}%` : 'sdjafdjhbkfalhblhb'
                },
                autor: {
                    [Op.iLike]: filters.includes('autor') ? `%${keyword}%` : '&&&&&&&&&&'
                },
                topicos: {
                    [Op.iLike]: filters.includes('genero') ? `%${keyword}%` : '&&&&&&&.l.&&&&&'
                },
                isbn: {
                    [Op.iLike]: filters.includes('isbn') ? `%${keyword}%` : '&&&&&°-°&&&&&&&&&'
                },
            }
            ,
            tipo: {
                [Op.iLike]: `%${type}%`
            }
        },
        include: {
            model: db.reserva,
            as: 'reservado',
            attributes: ['id', 'fecha_final'],
            order: [['id', 'DESC']]
        }
    })


    // Calcular si el libro esta disponible o no
    let rpta = []
    let hoy = new Date(obtenerFechaActual())
    libros.forEach(item => {
        let disponibilidad = true;
        console.log(item.id, item.titulo)
        if (item.reservado) {
            //item.reservado = item.reservado.sort((a, b) => b.id - a.id);
            item.reservado.forEach(i => {
                console.log(" ", i.id, i.fecha_final)
                if (i.fecha_final > hoy) {
                    disponibilidad = false
                }
            })
            console.log("   Disponible: ", disponibilidad)
        }
        rpta.push({ ...item.get({ plain: true }), disponible: disponibilidad })
    })

    // PARA LA PAGINACION
    // libros == data
    const totalItems = rpta.length
    const totalPages = Math.ceil(totalItems / pageSize)
    let itemL = rpta
    let itemsAPaginar = itemL.slice(start, end)
    // Convertir a JSON
    itemsAPaginar = JSON.stringify(itemsAPaginar)

    return res.status(200).json({
        page,
        totalPages,
        pageSize,
        totalItems,
        items: JSON.parse(itemsAPaginar)
    }
    )

});

//revisar grab para corroborar

ruta.get('/leer', async (req, res) => {
    let id = req.query.id
    let rpta = await db.libro.findByPk(id, {
        include : {
            model: db.reserva,
            as: 'reservado'
        }
    })
    res.status(200).json(rpta);
});

ruta.post('/agregar', async (req, res) => {
    let obj = req.body
    console.log(obj)
    let rpta = await db.libro.create(obj)
    res.status(200).json(rpta);
});

ruta.delete('/eliminar', async (req, res) => {
    let req_id = req.query.id
    let rpta = await db.libro.destroy({
        where: {
            id: req_id
        },
    })

    res.status(200).json(rpta);
});

ruta.put('/modificar', async (req, res) => {
    const id = req.query.id;
    const datosModificados = req.body;
    
    const libro = await db.libro.findByPk(id);
    // Actualizar los datos del libro en la base de datos
    await libro.update({...datosModificados});
    return res.json({ mensaje: 'Libro modificado correctamente' });

});

function obtenerFechaActual() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${mes}-${dia}`;
}
module.exports = ruta