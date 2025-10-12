/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/jsx-no-comment-textnodes */
import Link from 'next/link';
import { DotGrid } from '@/components/DotGrid';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black">
      <DotGrid />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative h-8 w-8">
                  <div className="absolute inset-0 border border-gray-500" />
                  <div className="absolute inset-1 border border-gray-500" />
                </div>
                <span className="font-mono text-xl font-bold uppercase tracking-tight text-white">
                  Lattice
                </span>
              </Link>

              <nav className="flex items-center gap-6">
                <Link
                  href="/docs"
                  className="font-mono text-sm text-white"
                >
                  Docs
                </Link>
                <Link
                  href="/pricing"
                  className="font-mono text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
                <Link href="/login" className="font-mono text-sm text-gray-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="border border-white bg-white px-4 py-2 font-mono text-sm uppercase tracking-wider text-black hover:bg-gray-100 transition-colors"
                >
                  Get Started
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-16">
          <div className="mx-auto max-w-4xl">
            {/* Page Header */}
            <div className="mb-16">
              <h1 className="mb-4 text-5xl font-bold uppercase tracking-tight text-white">
                Documentation
              </h1>
              <p className="font-mono text-sm text-gray-500">
                Complete guide to integrating Lattice into your microservices architecture
              </p>
            </div>

            {/* Table of Contents */}
            <nav className="mb-16 border border-gray-800 bg-black/50 backdrop-blur-sm p-8">
              <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-gray-500">
                Contents
              </h2>
              <ul className="space-y-2 font-mono text-sm text-gray-400">
                <li>
                  <a href="#introduction" className="hover:text-white transition-colors">
                    → Introduction
                  </a>
                </li>
                <li>
                  <a href="#quick-start" className="hover:text-white transition-colors">
                    → Quick Start
                  </a>
                </li>
                <li>
                  <a href="#express" className="hover:text-white transition-colors">
                    → Express.js Plugin
                  </a>
                </li>
                <li>
                  <a href="#nextjs" className="hover:text-white transition-colors">
                    → Next.js Plugin
                  </a>
                </li>
                <li>
                  <a href="#configuration" className="hover:text-white transition-colors">
                    → Configuration
                  </a>
                </li>
                <li>
                  <a href="#api" className="hover:text-white transition-colors">
                    → API Reference
                  </a>
                </li>
              </ul>
            </nav>

            {/* Introduction */}
            <section id="introduction" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-white">
                Introduction
              </h2>
              <div className="space-y-4 font-mono text-sm text-gray-500">
                <p>
                  Lattice is a service discovery platform that automatically maps your microservices architecture.
                  Drop-in plugins analyze your applications at runtime, discovering routes, dependencies, and service relationships.
                </p>
                <p>
                  No manual configuration required. Lattice plugins integrate with your existing framework in minutes,
                  providing real-time visibility into your entire service ecosystem.
                </p>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quick-start" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-white">
                Quick Start
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                    1. Create Account
                  </h3>
                  <p className="mb-3 font-mono text-sm text-gray-500">
                    Sign up for a Lattice account and get your API key:
                  </p>
                  <div className="border border-gray-800 bg-black p-4">
                    <code className="font-mono text-xs text-gray-400">
                      Visit https://lattice.black/signup
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                    2. Install Plugin
                  </h3>
                  <p className="mb-3 font-mono text-sm text-gray-500">
                    Choose your framework and install the appropriate plugin:
                  </p>
                  <div className="space-y-2">
                    <div className="border border-gray-800 bg-black p-4">
                      <code className="font-mono text-xs text-gray-400">
                        yarn add @caryyon/plugin-express
                      </code>
                    </div>
                    <div className="border border-gray-800 bg-black p-4">
                      <code className="font-mono text-xs text-gray-400">
                        yarn add @caryyon/plugin-nextjs
                      </code>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                    3. Configure
                  </h3>
                  <p className="mb-3 font-mono text-sm text-gray-500">
                    Set your API key from the dashboard:
                  </p>
                  <div className="border border-gray-800 bg-black p-4">
                    <pre className="font-mono text-xs overflow-x-auto">
                      <code>
                        <span className="text-cyan-300">LATTICE_API_KEY</span>=<span className="text-green-400">your_api_key_here</span>
                      </code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                    4. Start Discovery
                  </h3>
                  <p className="font-mono text-sm text-gray-500">
                    Your services will begin appearing in the Lattice dashboard within minutes.
                  </p>
                </div>
              </div>
            </section>

            {/* Express Plugin */}
            <section id="express" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-white">
                Express.js Plugin
              </h2>

              <div className="mb-8">
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Installation
                </h3>
                <div className="border border-gray-800 bg-black p-4">
                  <code className="font-mono text-xs text-gray-400">
                    yarn add @caryyon/plugin-express
                  </code>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Basic Usage
                </h3>
                <div className="border border-gray-800 bg-black p-4">
                  <pre className="font-mono text-xs overflow-x-auto">
                    <code>
                      <span className="text-purple-400">import</span> <span className="text-white">express</span> <span className="text-purple-400">from</span> <span className="text-green-400">'express'</span>;{'\n'}
                      <span className="text-purple-400">import</span> {'{ '}<span className="text-white">LatticePlugin</span> {'} '}<span className="text-purple-400">from</span> <span className="text-green-400">'@caryyon/plugin-express'</span>;{'\n'}
                      {'\n'}
                      <span className="text-purple-400">const</span> <span className="text-cyan-300">app</span> = <span className="text-yellow-400">express</span>();{'\n'}
                      {'\n'}
                      <span className="text-gray-600">// Initialize Lattice plugin</span>{'\n'}
                      <span className="text-purple-400">const</span> <span className="text-cyan-300">lattice</span> = <span className="text-purple-400">new</span> <span className="text-yellow-400">LatticePlugin</span>{'({'}{'\n'}
                      {'  '}<span className="text-cyan-300">serviceName</span>: <span className="text-green-400">'my-api'</span>,{'\n'}
                      {'  '}<span className="text-cyan-300">apiKey</span>: <span className="text-white">process</span>.<span className="text-cyan-300">env</span>.<span className="text-white">LATTICE_API_KEY</span>,{'\n'}
                      {'});'}{'\n'}
                      {'\n'}
                      <span className="text-gray-600">// Define your routes</span>{'\n'}
                      <span className="text-cyan-300">app</span>.<span className="text-yellow-400">get</span>(<span className="text-green-400">'/api/users'</span>, (<span className="text-white">req</span>, <span className="text-white">res</span>) {'=>'} {'{'}{'\n'}
                      {'  '}<span className="text-white">res</span>.<span className="text-yellow-400">json</span>{'({ '}<span className="text-cyan-300">users</span>: [] {'});'}{'\n'}
                      {'});'}{'\n'}
                      {'\n'}
                      <span className="text-cyan-300">app</span>.<span className="text-yellow-400">post</span>(<span className="text-green-400">'/api/users'</span>, (<span className="text-white">req</span>, <span className="text-white">res</span>) {'=>'} {'{'}{'\n'}
                      {'  '}<span className="text-white">res</span>.<span className="text-yellow-400">json</span>{'({ '}<span className="text-cyan-300">created</span>: <span className="text-purple-400">true</span> {'});'}{'\n'}
                      {'});'}{'\n'}
                      {'\n'}
                      <span className="text-gray-600">// Analyze and start discovery</span>{'\n'}
                      <span className="text-purple-400">await</span> <span className="text-cyan-300">lattice</span>.<span className="text-yellow-400">analyze</span>(<span className="text-cyan-300">app</span>);{'\n'}
                      {'\n'}
                      <span className="text-gray-600">// Optional: Add metrics tracking middleware</span>{'\n'}
                      <span className="text-cyan-300">app</span>.<span className="text-yellow-400">use</span>(<span className="text-cyan-300">lattice</span>.<span className="text-yellow-400">createMetricsMiddleware</span>());{'\n'}
                      {'\n'}
                      <span className="text-cyan-300">app</span>.<span className="text-yellow-400">listen</span>(<span className="text-blue-400">3000</span>, () {'=>'} {'{'}{'\n'}
                      {'  '}<span className="text-white">console</span>.<span className="text-yellow-400">log</span>(<span className="text-green-400">'Server running on port 3000'</span>);{'\n'}
                      {'});'}
                    </code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Configuration Options
                </h3>
                <div className="border border-gray-800 bg-black/50 backdrop-blur-sm">
                  <table className="w-full">
                    <thead className="border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-mono text-xs uppercase text-gray-500">
                          Option
                        </th>
                        <th className="px-4 py-3 text-left font-mono text-xs uppercase text-gray-500">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-mono text-xs uppercase text-gray-500">
                          Default
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          serviceName
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          string
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          Auto-detected
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          apiKey
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          string
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          process.env.LATTICE_API_KEY
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          enabled
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          boolean
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          true
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          autoSubmit
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          boolean
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          true
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          submitInterval
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          number
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          300000 (5 min)
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          discoverRoutes
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          boolean
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          true
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          discoverDependencies
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          boolean
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          true
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Next.js Plugin */}
            <section id="nextjs" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-white">
                Next.js Plugin
              </h2>

              <div className="mb-8">
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Installation
                </h3>
                <div className="border border-gray-800 bg-black p-4">
                  <code className="font-mono text-xs text-gray-400">
                    yarn add @caryyon/plugin-nextjs
                  </code>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Basic Usage
                </h3>
                <p className="mb-3 font-mono text-sm text-gray-500">
                  Create a discovery script and run it during your build or startup:
                </p>
                <div className="border border-gray-800 bg-black p-4">
                  <pre className="font-mono text-xs overflow-x-auto">
                    <code>
                      <span className="text-gray-600">// scripts/discover.ts</span>{'\n'}
                      <span className="text-purple-400">import</span> {'{ '}<span className="text-white">LatticeNextPlugin</span> {'} '}<span className="text-purple-400">from</span> <span className="text-green-400">'@caryyon/plugin-nextjs'</span>;{'\n'}
                      {'\n'}
                      <span className="text-purple-400">const</span> <span className="text-cyan-300">lattice</span> = <span className="text-purple-400">new</span> <span className="text-yellow-400">LatticeNextPlugin</span>{'({'}{'\n'}
                      {'  '}<span className="text-cyan-300">serviceName</span>: <span className="text-green-400">'my-nextjs-app'</span>,{'\n'}
                      {'  '}<span className="text-cyan-300">apiKey</span>: <span className="text-white">process</span>.<span className="text-cyan-300">env</span>.<span className="text-white">LATTICE_API_KEY</span>,{'\n'}
                      {'  '}<span className="text-cyan-300">appDir</span>: <span className="text-green-400">'./src/app'</span>, <span className="text-gray-600">// Path to your Next.js app directory</span>{'\n'}
                      {'});'}{'\n'}
                      {'\n'}
                      <span className="text-purple-400">await</span> <span className="text-cyan-300">lattice</span>.<span className="text-yellow-400">analyze</span>();
                    </code>
                  </pre>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Package.json Script
                </h3>
                <div className="border border-gray-800 bg-black p-4">
                  <pre className="font-mono text-xs overflow-x-auto">
                    <code>
                      {'{'}{'\n'}
                      {'  '}<span className="text-cyan-300">"scripts"</span>: {'{'}{'\n'}
                      {'    '}<span className="text-cyan-300">"discover"</span>: <span className="text-green-400">"tsx scripts/discover.ts"</span>,{'\n'}
                      {'    '}<span className="text-cyan-300">"build"</span>: <span className="text-green-400">"yarn discover && next build"</span>{'\n'}
                      {'  }'}{'\n'}
                      {'}'}
                    </code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Configuration Options
                </h3>
                <div className="border border-gray-800 bg-black/50 backdrop-blur-sm">
                  <table className="w-full">
                    <thead className="border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left font-mono text-xs uppercase text-gray-500">
                          Option
                        </th>
                        <th className="px-4 py-3 text-left font-mono text-xs uppercase text-gray-500">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left font-mono text-xs uppercase text-gray-500">
                          Default
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          serviceName
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          string
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          Required
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          appDir
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          string
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          ./src/app
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          enabled
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          boolean
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          true
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          autoSubmit
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          boolean
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                          true
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Configuration */}
            <section id="configuration" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-white">
                Configuration
              </h2>

              <div className="mb-8">
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Environment Variables
                </h3>
                <p className="mb-3 font-mono text-sm text-gray-500">
                  Configure the plugin with your API key:
                </p>
                <div className="border border-gray-800 bg-black p-4">
                  <pre className="font-mono text-xs overflow-x-auto">
                    <code>
                      <span className="text-cyan-300">LATTICE_API_KEY</span>=<span className="text-green-400">your_api_key_from_dashboard</span>{'\n'}
                      <span className="text-cyan-300">LATTICE_ENABLED</span>=<span className="text-purple-400">true</span>{'\n'}
                      <span className="text-cyan-300">LATTICE_AUTO_SUBMIT</span>=<span className="text-purple-400">true</span>{'\n'}
                      <span className="text-cyan-300">LATTICE_SUBMIT_INTERVAL</span>=<span className="text-blue-400">300000</span>
                    </code>
                  </pre>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Callbacks
                </h3>
                <p className="mb-3 font-mono text-sm text-gray-500">
                  Hook into the discovery lifecycle with callbacks:
                </p>
                <div className="border border-gray-800 bg-black p-4">
                  <pre className="font-mono text-xs overflow-x-auto">
                    <code>
                      <span className="text-purple-400">const</span> <span className="text-cyan-300">lattice</span> = <span className="text-purple-400">new</span> <span className="text-yellow-400">LatticePlugin</span>{'({'}{'\n'}
                      {'  '}<span className="text-cyan-300">serviceName</span>: <span className="text-green-400">'my-api'</span>,{'\n'}
                      {'  '}<span className="text-cyan-300">onAnalyzed</span>: (<span className="text-white">metadata</span>) {'=>'} {'{'}{'\n'}
                      {'    '}<span className="text-white">console</span>.<span className="text-yellow-400">log</span>(<span className="text-green-400">{`\`Discovered \${`}<span className="text-white">metadata</span>.<span className="text-cyan-300">routes</span>.<span className="text-cyan-300">length</span>{'} routes`'}</span>);{'\n'}
                      {'  },'}{'\n'}
                      {'  '}<span className="text-cyan-300">onSubmitted</span>: (<span className="text-white">response</span>) {'=>'} {'{'}{'\n'}
                      {'    '}<span className="text-white">console</span>.<span className="text-yellow-400">log</span>(<span className="text-green-400">{`\`Submitted: \${`}<span className="text-white">response</span>.<span className="text-cyan-300">serviceId</span>{'}`'}</span>);{'\n'}
                      {'  },'}{'\n'}
                      {'  '}<span className="text-cyan-300">onError</span>: (<span className="text-white">error</span>) {'=>'} {'{'}{'\n'}
                      {'    '}<span className="text-white">console</span>.<span className="text-yellow-400">error</span>(<span className="text-green-400">'Discovery error:'</span>, <span className="text-white">error</span>);{'\n'}
                      {'  },'}{'\n'}
                      {'});'}
                    </code>
                  </pre>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Disabling in Production
                </h3>
                <p className="mb-3 font-mono text-sm text-gray-500">
                  Control discovery behavior per environment:
                </p>
                <div className="border border-gray-800 bg-black p-4">
                  <pre className="font-mono text-xs overflow-x-auto">
                    <code>
                      <span className="text-purple-400">const</span> <span className="text-cyan-300">lattice</span> = <span className="text-purple-400">new</span> <span className="text-yellow-400">LatticePlugin</span>{'({'}{'\n'}
                      {'  '}<span className="text-cyan-300">serviceName</span>: <span className="text-green-400">'my-api'</span>,{'\n'}
                      {'  '}<span className="text-cyan-300">enabled</span>: <span className="text-white">process</span>.<span className="text-cyan-300">env</span>.<span className="text-white">NODE_ENV</span> !== <span className="text-green-400">'production'</span>,{'\n'}
                      {'});'}
                    </code>
                  </pre>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section id="api" className="mb-16">
              <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-white">
                API Reference
              </h2>

              <div className="mb-8">
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Collector API Endpoints
                </h3>
                <div className="space-y-4">
                  <div className="border border-gray-800 bg-black/50 backdrop-blur-sm p-6">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="border border-gray-700 bg-black px-2 py-1 font-mono text-xs text-gray-400">
                        POST
                      </span>
                      <code className="font-mono text-sm text-white">
                        /api/v1/ingest/metadata
                      </code>
                    </div>
                    <p className="font-mono text-xs text-gray-500">
                      Submit service metadata, routes, and dependencies
                    </p>
                  </div>

                  <div className="border border-gray-800 bg-black/50 backdrop-blur-sm p-6">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="border border-gray-700 bg-black px-2 py-1 font-mono text-xs text-gray-400">
                        GET
                      </span>
                      <code className="font-mono text-sm text-white">
                        /api/v1/services
                      </code>
                    </div>
                    <p className="font-mono text-xs text-gray-500">
                      List all discovered services
                    </p>
                  </div>

                  <div className="border border-gray-800 bg-black/50 backdrop-blur-sm p-6">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="border border-gray-700 bg-black px-2 py-1 font-mono text-xs text-gray-400">
                        GET
                      </span>
                      <code className="font-mono text-sm text-white">
                        /api/v1/services/:id
                      </code>
                    </div>
                    <p className="font-mono text-xs text-gray-500">
                      Get service details including routes and dependencies
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 font-mono text-lg uppercase tracking-wider text-white">
                  Authentication
                </h3>
                <p className="mb-3 font-mono text-sm text-gray-500">
                  All API requests require an API key in the Authorization header:
                </p>
                <div className="border border-gray-800 bg-black p-4">
                  <pre className="font-mono text-xs overflow-x-auto">
                    <code>
                      <span className="text-cyan-300">Authorization</span>: <span className="text-white">Bearer</span> <span className="text-green-400">YOUR_API_KEY</span>
                    </code>
                  </pre>
                </div>
              </div>
            </section>

            {/* Footer CTA */}
            <div className="border border-gray-800 bg-black/50 backdrop-blur-sm p-12 text-center">
              <h3 className="mb-3 text-2xl font-bold uppercase tracking-tight text-white">
                Ready to Start?
              </h3>
              <p className="mb-6 font-mono text-sm text-gray-500">
                Get your API key and start discovering services in minutes
              </p>
              <Link
                href="/signup"
                className="inline-block border border-white bg-white px-8 py-4 font-mono text-base uppercase tracking-wider text-black hover:bg-gray-100 transition-colors"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm py-12 mt-24">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-6">
                  <div className="absolute inset-0 border border-gray-500" />
                </div>
                <span className="font-mono text-sm text-gray-600">
                  © 2025 Lattice. All rights reserved.
                </span>
              </div>
              <div className="flex gap-6">
                <Link href="/docs" className="font-mono text-sm text-white">
                  Documentation
                </Link>
                <Link href="/pricing" className="font-mono text-sm text-gray-600 hover:text-white transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
