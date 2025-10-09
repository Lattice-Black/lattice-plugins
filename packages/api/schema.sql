-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT,
    "environment" TEXT,
    "deploymentType" TEXT,
    "language" TEXT NOT NULL,
    "framework" TEXT NOT NULL,
    "runtime" TEXT,
    "description" TEXT,
    "repository" TEXT,
    "healthCheckUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unknown',
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "discoveredBy" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "middlewareChain" TEXT[],
    "handlerLocation" JSONB,
    "pathParameters" JSONB,
    "queryParameters" JSONB,
    "requestSchema" JSONB,
    "responseSchema" JSONB,
    "description" TEXT,
    "tags" TEXT[],
    "avgResponseTimeMs" DOUBLE PRECISION,
    "callFrequency" DOUBLE PRECISION,
    "errorRate" DOUBLE PRECISION,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependency" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "packageName" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "versionRange" TEXT,
    "dependencyType" TEXT NOT NULL,
    "scope" TEXT,
    "installedSize" INTEGER,
    "publishSize" INTEGER,
    "fileCount" INTEGER,
    "hasVulnerabilities" BOOLEAN,
    "vulnerabilityCount" INTEGER,
    "highestSeverity" TEXT,
    "description" TEXT,
    "license" TEXT,
    "repository" TEXT,
    "homepage" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "Dependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connection" (
    "id" TEXT NOT NULL,
    "sourceServiceId" TEXT NOT NULL,
    "targetServiceId" TEXT NOT NULL,
    "targetRouteId" TEXT,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "callCount" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTimeMs" DOUBLE PRECISION,
    "p95ResponseTimeMs" DOUBLE PRECISION,
    "p99ResponseTimeMs" DOUBLE PRECISION,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "errorRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requestFrequency" DOUBLE PRECISION,
    "peakTime" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,
    "sampleTraceIds" TEXT[],
    "metadata" JSONB,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plugin" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "supportedFrameworks" TEXT[],
    "supportedSchemaVersions" TEXT[],
    "preferredSchemaVersion" TEXT NOT NULL,
    "canDiscoverRoutes" BOOLEAN NOT NULL DEFAULT false,
    "canDiscoverDependencies" BOOLEAN NOT NULL DEFAULT false,
    "canTrackConnections" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "author" TEXT,
    "repository" TEXT,
    "documentation" TEXT,
    "servicesUsing" INTEGER NOT NULL DEFAULT 0,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3),
    "metadata" JSONB,

    CONSTRAINT "Plugin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- CreateIndex
CREATE INDEX "Service_name_idx" ON "Service"("name");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE INDEX "Service_lastSeen_idx" ON "Service"("lastSeen");

-- CreateIndex
CREATE INDEX "Route_serviceId_idx" ON "Route"("serviceId");

-- CreateIndex
CREATE INDEX "Route_method_idx" ON "Route"("method");

-- CreateIndex
CREATE UNIQUE INDEX "Route_serviceId_method_path_key" ON "Route"("serviceId", "method", "path");

-- CreateIndex
CREATE INDEX "Dependency_serviceId_idx" ON "Dependency"("serviceId");

-- CreateIndex
CREATE INDEX "Dependency_packageName_idx" ON "Dependency"("packageName");

-- CreateIndex
CREATE INDEX "Dependency_hasVulnerabilities_idx" ON "Dependency"("hasVulnerabilities");

-- CreateIndex
CREATE UNIQUE INDEX "Dependency_serviceId_packageName_key" ON "Dependency"("serviceId", "packageName");

-- CreateIndex
CREATE INDEX "Connection_sourceServiceId_idx" ON "Connection"("sourceServiceId");

-- CreateIndex
CREATE INDEX "Connection_targetServiceId_idx" ON "Connection"("targetServiceId");

-- CreateIndex
CREATE INDEX "Connection_sourceServiceId_targetServiceId_idx" ON "Connection"("sourceServiceId", "targetServiceId");

-- CreateIndex
CREATE INDEX "Connection_lastSeen_idx" ON "Connection"("lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_sourceServiceId_targetServiceId_method_path_key" ON "Connection"("sourceServiceId", "targetServiceId", "method", "path");

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_name_key" ON "Plugin"("name");

-- CreateIndex
CREATE INDEX "Plugin_name_idx" ON "Plugin"("name");

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_sourceServiceId_fkey" FOREIGN KEY ("sourceServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_targetServiceId_fkey" FOREIGN KEY ("targetServiceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connection" ADD CONSTRAINT "Connection_targetRouteId_fkey" FOREIGN KEY ("targetRouteId") REFERENCES "Route"("id") ON DELETE SET NULL ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 6.17.0                      │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
