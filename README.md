# jscube
A web service backend managing submissions for and status of a puzzle
hunt. Node.js version of https://github.com/tkfocht/Cube

## How to run

First, make sure you have [Node.js v5](https://nodejs.org/en/download/stable/)
set up. Then run the following commands:

```
git clone https://github.com/obijywk/jscube
cd jscube
npm install
npm start
```

The REST API is now available at port 8080.

```
curl -d '{"eventType":"HuntStart","runId":"development"}' -H "Content-Type: application/json" http://192.168.1.2:8080/events
```

## How to run tests

```
npm test
```

## How to build documentation

Generated documentation will be written to the docs/ directory.

```
npm run jsdoc
```

## Configuration

The configuration file can be found at `config/default.json`. The
`jscube.huntModules` property can be changed to include different functionality
and run different hunts.
