'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const keywords = require('./keywords.js')
const questions = require('./questions.js')
const demoTextLoader = require('./demoTextLoader.js')

const app = express()
const port = process.env.PORT || 3001

cors.CorsOptions = {
    // origin: ['http://localhost:3000']
    // origin: 'https://jorge16lp.github.io' || 'http://localhost:3000'
    origin: 'https://jorge16lp.github.io'
};

app.listen(port, () => {
    // console.log(`API REST corriendo en http://localhost:${port}`)
    console.log(`API REST corriendo en https://jorge16lp.github.io`)
})

app.use(cors())

app.use(express.json())

app.use(bodyParser.urlencoded({
    extended: false
}))

app.use(bodyParser.json())

// obtener las keywords a partir del texto
app.post('/keywords/', (req, res) => {
    keywords.getKeyWords(res, req.body.theText)
})

// obtener las preguntas a partir del texto, las keywords y sus repeticiones
app.post('/questions/', (req, res) => {
    questions.getQuestions(res, req.body.theText, req.body.keywords, req.body.repetitions)
})

// obtener el texto de prueba
app.get('/read-demo-file/', (req, res) => {
    demoTextLoader.getDemoText(res)
})