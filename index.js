require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('post-data', function (req, res) { 
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ' '
})

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/api/persons', async (request, response) => {
  try {
    const persons = await Person.find({})
    response.json(persons)
  } catch (err) {
    console.error("Error fetching personlist from DB: ", err.message)
  }
})

app.get('/api/persons/:id', async (request, response) => {
  try {
    const person = await Person.findById(request.params.id)
    response.json(person)
  } catch (err) {
    console.error("Error finding by id: ", err.message)
    response.status(404).end()
  }
})

app.post('/api/persons', async (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: !body.name ? 'name missing' : 'number missing'
    })
  }
  /*const nameExists = persons.some(p => p.name === body.name);
  if (nameExists) {
    return response.status(409).json({
      error: 'name already exists'
    });
  }*/
  const person = new Person({
    name: body.name,
    number: body.number
  })
  try {
    const result = await person.save()
    response.json(result)
  } catch (err) {
    console.error("Error saving to DB: ", err.message)
  }
})

app.delete('/api/persons/:id', async (request, response) => {
  try {
    const result = await Person.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (err) {
    console.error("Error deleting from DB: ", err.message)
  }
})

app.get('/info', (request, response) => {
  const timeReceived = new Date()
  response.send(`
    <div>Phonebook has info for ${persons.length} people</div>
    <br/>
    <div>${timeReceived}</div>
  `)
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})