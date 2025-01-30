require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('post-data', function (req) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ' '
})

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.get('/api/persons', async (request, response, next) => {
  try {
    const persons = await Person.find({})
    response.json(persons)
  } catch (err) {
    next(err)
  }
})

app.get('/api/persons/:id', async (request, response, next) => {
  try {
    const person = await Person.findById(request.params.id)
    response.json(person)
  } catch (err) {
    next(err)
  }
})

app.post('/api/persons', async (request, response, next) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: !body.name ? 'name missing' : 'number missing'
    })
  }
  const person = new Person({
    name: body.name,
    number: body.number
  })
  try {
    const result = await person.save()
    response.json(result)
  } catch (err) {
    next(err)
  }
})

app.put('/api/persons/:id', async (request, response, next) => {
  try {
    const body = request.body
    const person = {
      name: body.name,
      number: body.number
    }
    const updatedPerson = await Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
    response.json(updatedPerson)
  } catch (err) {
    next(err)
  }
})

app.delete('/api/persons/:id', async (request, response, next) => {
  try {
    await Person.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (err) {
    next(err)
  }
})

app.get('/info', async (request, response) => {
  const timeReceived = new Date()
  const personCount = await Person.countDocuments()
  response.send(`
    <div>Phonebook has info for ${personCount} people</div>
    <br/>
    <div>${timeReceived}</div>
  `)
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})