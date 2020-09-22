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

app.post('/api/persons/', (req, res) => {
  const {
    name,
    number
  } = req.body;

  const MUL = 1234567891011121314;

  const errors = [];

  if (!number) {
    errors.push({
      number: "can't be blank"
    })
  };

  if (!name) {
    errors.push({
      name: "can't be blank"
    })
  } else {
    Person.find({ name }).then((matchingPersons) => {
      const isNameAlreadyPresent = matchingPersons.length > 0;

      if (isNameAlreadyPresent) {
        errors.push({
          name: 'already present'
        });
      }

      const areErrorsPresent = !!(errors.length > 0);

      if (areErrorsPresent) {
        res.status(422).json({
          errors
        });
      }

      if (name && number && !areErrorsPresent) {
        const person = new Person({
          name,
          number
        });

        person.save().then((savedPerson) => {
          res.json({
            data: savedPerson
          });
        })
      }
    });
  }
})

app.put('/api/persons/:personId', (req, res) => {
  const { name, number } = req.body;
  const person = { name, number };

  Person.findByIdAndUpdate(req.params.personId, person, { new: true })
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
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT} `);
});