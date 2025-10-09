import express from 'express';
import { LatticePlugin } from '@lattice/plugin-express';

const app = express();

// Middleware
app.use(express.json());

// Sample routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from demo app!' });
});

app.get('/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
  ]);
});

app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: 'User' });
});

app.post('/users', (req, res) => {
  res.status(201).json({ id: 3, name: req.body.name });
});

app.put('/users/:id', (req, res) => {
  res.json({ id: req.params.id, name: req.body.name });
});

app.delete('/users/:id', (req, res) => {
  res.status(204).send();
});

app.get('/posts', (req, res) => {
  res.json([
    { id: 1, title: 'First Post' },
    { id: 2, title: 'Second Post' },
  ]);
});

app.get('/posts/:id', (req, res) => {
  res.json({ id: req.params.id, title: 'Post Title' });
});

// Initialize Lattice plugin (AFTER all routes are defined)
const lattice = new LatticePlugin({
  serviceName: 'demo-express-app',
  environment: 'development',
  apiEndpoint: 'http://localhost:3000/api/v1',
  enabled: true,
  autoSubmit: true,
  onAnalyzed: (metadata) => {
    console.log(`\n✅ Lattice analyzed service: ${metadata.service.name}`);
    console.log(`   - Routes discovered: ${metadata.routes?.length || 0}`);
    console.log(`   - Dependencies discovered: ${metadata.dependencies?.length || 0}`);
  },
  onSubmitted: (response) => {
    console.log(`\n✅ Lattice metadata submitted successfully!`);
    console.log(`   - Service ID: ${response.serviceId}`);
    console.log(`   - Routes processed: ${response.routesProcessed}`);
    console.log(`   - Dependencies processed: ${response.dependenciesProcessed}`);
  },
  onError: (error) => {
    console.error(`\n❌ Lattice error:`, error.message);
  },
});

// Analyze the app
(async () => {
  try {
    await lattice.analyze(app);

    // Start server
    const PORT = 3001;
    app.listen(PORT, () => {
      console.log(`\n🚀 Demo Express app running on http://localhost:${PORT}`);
      console.log(`\nAvailable routes:`);
      console.log(`  GET  http://localhost:${PORT}/`);
      console.log(`  GET  http://localhost:${PORT}/users`);
      console.log(`  GET  http://localhost:${PORT}/users/:id`);
      console.log(`  POST http://localhost:${PORT}/users`);
      console.log(`  PUT  http://localhost:${PORT}/users/:id`);
      console.log(`  DELETE http://localhost:${PORT}/users/:id`);
      console.log(`  GET  http://localhost:${PORT}/posts`);
      console.log(`  GET  http://localhost:${PORT}/posts/:id`);
    });
  } catch (error) {
    console.error('Failed to start app:', error);
    process.exit(1);
  }
})();
