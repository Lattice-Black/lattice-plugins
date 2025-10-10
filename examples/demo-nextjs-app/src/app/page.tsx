export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Demo Next.js App - Lattice Discovery</h1>
      <p>This is a demo Next.js application with Lattice plugin integration.</p>

      <h2>Available API Routes:</h2>
      <ul>
        <li>
          <code>GET /api/products</code> - Get all products
        </li>
        <li>
          <code>POST /api/products</code> - Create a new product
        </li>
        <li>
          <code>GET /api/cart</code> - Get cart items
        </li>
        <li>
          <code>POST /api/cart</code> - Add item to cart
        </li>
        <li>
          <code>DELETE /api/cart</code> - Clear cart
        </li>
        <li>
          <code>POST /api/checkout</code> - Process checkout
        </li>
      </ul>

      <p>
        The Lattice plugin automatically discovers these routes and submits them to the
        collector API at <code>http://localhost:3000/api/v1</code>
      </p>
    </main>
  );
}
