const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors')

morgan.token('post-data-object', (req, res) => {
  return JSON.stringify(req.body);
})

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data-object'));

let persons = [{
  id: 1,
  name: 'Harshita',
  number: 'abcd'
},
{
  id: 2,
  name: 'Ramakrishna',
  number: 'abcdedf'
},
{
  id: 3,
  name: 'Usha Devi',
  number: '234dsfsd'
}
];

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:personId', (req, res) => {
  const {
    personId
  } = req.params;

  if (personId) {
    const matchingPersonId = persons.findIndex(
      (person) => person.id.toString() === personId.toString()
    );
    res.json({
      data: persons[matchingPersonId]
    });
  } else {
    res.status(404).end();
  }
});

app.delete('/api/persons/:personId', (req, res) => {
  const {
    personId
  } = req.params;
  if (personId) {
    const matchingPersonIndex = persons.findIndex(
      (person) => person.id.toString() === personId.toString()
    );

    if (matchingPersonIndex >= 0) {
      persons.splice(matchingPersonIndex, 1);
      res.status(200).end();
    }

    res.status(404).end();
  }

  res.status(404).end();
})

app.post('/api/persons/', (req, res) => {
  const {
    name,
    number
  } = req.body;

  const MUL = 1234567891011121314;

  const errors = [];

  if (!name) {
    errors.push({
      name: "can't be blank"
    })
  } else {
    const matchingPersonIndex = persons.findIndex(
      (person) => person.name.toString() === name.toString()
    );
    const isNameAlreadyPresent = matchingPersonIndex >= 0;

    if (isNameAlreadyPresent) {
      errors.push({
        name: 'already present'
      });
    }
  }
  if (!number) {
    errors.push({
      number: "can't be blank"
    })
  };


  const areErrorsPresent = errors.length > 0;
  if (areErrorsPresent) {
    res.status(422).json({
      errors
    });
  }

  if (name && number && !areErrorsPresent) {
    persons.push({
      id: Math.round(Math.random() * MUL),
      name,
      number
    });

    res.json({
      data: persons
    });
  }
})

app.get('/info', (req, res) => {
  const totalPersonsInfo = `<p>Phonebook has info for ${persons.length} people</p>`;
  const date = `<p>${new Date().toUTCString()}</p > `;

  res.send(`${totalPersonsInfo} ${date} `)
});

const PORT = process.env.PORT || 3002;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT} `);
});