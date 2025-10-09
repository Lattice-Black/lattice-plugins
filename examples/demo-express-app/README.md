# Demo Express App with Lattice

This is a demo Express.js application that uses the Lattice plugin for automatic service discovery.

## Features

- 8 sample routes (users and posts)
- Automatic route discovery
- Automatic dependency detection
- Real-time metadata submission to Lattice API

## Running the Demo

1. **Start the Lattice API** (in another terminal):
   ```bash
   cd packages/api
   yarn dev
   ```

2. **Start the demo app**:
   ```bash
   cd examples/demo-express-app
   yarn install
   yarn dev
   ```

3. **Test the endpoints**:
   ```bash
   # Get users
   curl http://localhost:3001/users

   # Get specific user
   curl http://localhost:3001/users/1

   # Create user
   curl -X POST http://localhost:3001/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Charlie"}'
   ```

4. **Check Lattice API**:
   ```bash
   # List all services
   curl http://localhost:3000/api/v1/services

   # Get demo service details
   curl http://localhost:3000/api/v1/services/demo-express-app
   ```

## What Gets Discovered

The Lattice plugin automatically discovers:
- ✅ Service name: `demo-express-app`
- ✅ 8 HTTP routes (GET, POST, PUT, DELETE)
- ✅ All dependencies from package.json
- ✅ Framework: Express.js
- ✅ Runtime: Node.js version

## Configuration

See `.env` file for Lattice plugin configuration options.
