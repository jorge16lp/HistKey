'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const keywords = require('./keywords.js')
const questions = require('./questions.js')
const demoTextLoader = require('./demoTextLoader.js')

const app = express()
const port = process.env.PORT || 3001

app.listen(port, () => {
    console.log(`API REST corriendo en http://localhost:${port}`)
})

app.use(cors())

app.use(express.json())

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json())

// funciona bien con el res en el main y usando POST
app.post('/keywords/', (req, res) => {
    keywords.getKeyWords(res, req.body.theText)
})

// funciona bien con el res en el main y usando POST
app.post('/questions/', (req, res) => {
    questions.getQuestions(res, req.body.theText, req.body.keywords, req.body.repetitions)
})

app.get('/read-demo-file/', (req, res) => {
    demoTextLoader.getDemoText(res)
})

// funciona bien con el res en el main
// app.get('/keywords/', (req, res) => {
//     res.send({
//         message: 'Buscando keywords'
//     });
// })