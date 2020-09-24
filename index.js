const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

// Setup environment variables
const dotenv = require('dotenv');
dotenv.config();

morgan.token('post-data-object', (req, res) => {
  return JSON.stringify(req.body);
})

app.use(cors());

app.use(express.static('build'));
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data-object'));

const Person = require('./models/person');

app.get('/api/persons', (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get('/api/persons/:personId', (req, res) => {
  const { personId } = req.params;

  Person.findById(req.params.personId)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.delete('/api/persons/:personId', (req, res) => {
  const {
    personId
  } = req.params;

  Person.findByIdAndDelete(req.params.personId)
    .then(() => {
      res.status(204).end();
    })
    .catch((err) => next(err));


})

app.post('/api/persons/', (req, res, next) => {
  const { name, number } = req.body;

  const MUL = 1234567891011121314;

  const errors = [];

  const person = new Person({
    name,
    number
  });

  person.save()
    .then((savedPerson) => {
      return {
        data: savedPerson.toJSON(),
      };
    })
    .then((saveAndFormattedPerson) => {
      res.json(saveAndFormattedPerson);
    })
    .catch((err) => {
      console.log("err while saving : ", err);
      return next(err);
    });

})

app.put('/api/persons/:personId', (req, res) => {
  const { name, number } = req.body;
  const person = { name, number };

  Person.findByIdAndUpdate(req.params.personId, person, { new: true, runValidators: true })
    .then((updatedPerson) => {
      res.status(201).send(updatedPerson);
    })
    .catch((err) => next(err));
})

app.get('/info', (req, res) => {
  Person.find({}).then((persons) => {
    const totalPersonsInfo = `<p>Phonebook has info for ${persons.length} people</p>`;
    const date = `<p>${new Date().toUTCString()}</p > `;

    res.send(`${totalPersonsInfo} ${date} `);
  })
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  if (error.name === 'ValidationError') {
    return response.status(422).json({ error: error.message })
  }

  next(error);
}

app.use(errorHandler)

const PORT = process.env.PORT;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT} `);
});