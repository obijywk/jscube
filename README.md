# jscube
A web service backend managing submissions for and status of a puzzle hunt. Node.js version of https://github.com/tkfocht/Cube

## How to run

First, make sure you have https://nodejs.org/en/download/stable/[Node v5] set up. Then run the following commands:

```
git clone https://github.com/obijywk/jscube
cd jscube
npm install
node app.js
```

The REST API is now available at port 8080.

```
curl -d '{"eventType":"HuntStart","runId":"development"}' -H "Content-Type: application/json" http://192.168.1.2:8080/events
```

## Configuration

The configuration file can be found at `config/default.json`. The `jscube.eventHandlers` property can be changed to run different hunts.
