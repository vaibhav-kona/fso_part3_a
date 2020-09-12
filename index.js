const express = require('express');
const app = express();

let persons = [
  {
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
  const { personId } = req.params;

  if (personId) {
    const matchingPersonId = persons.findIndex(
      (person) => person.id.toString() === personId.toString()
    );
    res.json({ data: persons[matchingPersonId] });
  } else {
    res.status(404).end();
  }
});

app.get('/info', (req, res) => {
  const totalPersonsInfo = `<p>Phonebook has info for ${persons.length} people</p>`;
  const date = `<p>${new Date().toUTCString()}</p > `;

  res.send(`${totalPersonsInfo} ${date} `)
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});