/**
 * Traffic Generator for Lattice Demo
 * Simulates API calls between services to generate statistics
 */

const DEMO_EXPRESS_APP = 'http://localhost:3001';
const ORDER_SERVICE = 'http://localhost:3002';
const NEXTJS_APP = 'http://localhost:3003';

async function makeRequest(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { success: true, status: response.status, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function generateTraffic() {
  console.log('🚀 Starting traffic generation...\n');

  const scenarios = [
    // User service calls
    { name: 'Get all users', fn: () => makeRequest(`${DEMO_EXPRESS_APP}/api/users`) },
    { name: 'Get user by ID', fn: () => makeRequest(`${DEMO_EXPRESS_APP}/api/users/1`) },
    { name: 'Get user orders (inter-service)', fn: () => makeRequest(`${DEMO_EXPRESS_APP}/api/users/1/orders`) },

    // Order service calls
    { name: 'Get all orders', fn: () => makeRequest(`${ORDER_SERVICE}/api/orders`) },
    { name: 'Get orders for user', fn: () => makeRequest(`${ORDER_SERVICE}/api/orders?userId=1`) },
    { name: 'Get order by ID', fn: () => makeRequest(`${ORDER_SERVICE}/api/orders/1`) },

    // Next.js service calls
    { name: 'Get products', fn: () => makeRequest(`${NEXTJS_APP}/api/products`) },
    { name: 'Get cart', fn: () => makeRequest(`${NEXTJS_APP}/api/cart`) },
  ];

  // Run scenarios multiple times
  for (let i = 1; i <= 5; i++) {
    console.log(`\n📊 Round ${i}/5`);

    for (const scenario of scenarios) {
      const result = await makeRequest;
      const status = result.success ? `✅ ${result.status}` : `❌ Failed`;
      console.log(`  ${status} - ${scenario.name}`);

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n✨ Traffic generation complete!');
  console.log('\n📈 View statistics at:');
  console.log('  - Dashboard: http://localhost:3010');
  console.log('  - Network Graph: http://localhost:3010/graph');
  console.log('  - Services API: http://localhost:3000/api/v1/services\n');
}

// Run traffic generator
generateTraffic();
