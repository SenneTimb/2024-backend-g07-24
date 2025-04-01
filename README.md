# Backend SDP2 Groep 07
- Mathisse Snauwaert
- Senne Timbreur
- Joris Coppejans
- Alexander Callebaut
- Kevin Vermeulen

## Vereisten

Ik verwacht dat volgende software reeds geïnstalleerd is:

- [NodeJS](https://nodejs.org)
- [Yarn](https://yarnpkg.com)
- [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
- ...

## Opstarten
1. Opstarten van het java project voor de databank schema te initializeren

1. Maak een .env bestand aan in de hoofdmap en vul je het met de gegevens in het dossier aan

3. In het bestand "./config/development.js" vul je het volgende met de juiste credenties.

```js
database: {
    client: 'mysql2',
    host: 'localhost',
    port: 3306,
    name: '<DATABASE_NAME>',
    username: '<MYSQL_USERNAME>',
    password: '<MYSQL_PASSWORD>',
  },
```

4. Voer het commando `yarn install` uit.
5. als volgt voer je de commando `yarn start` uit in je console.

## Testen

1. Maak een '.env.test' bestand aan in de hoofdmapen vul het aan volgens de gegevens van het dossier en vervang NODE_ENV naar 'test'

2. als volgt voer je de commando `yarn test` uit in je console.
