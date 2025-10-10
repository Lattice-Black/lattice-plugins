'use client';

import { useEffect, useState } from 'react';
import { ServiceCard } from '@/components/ServiceCard';
import { LoadingGrid } from '@/components/Loading';
import { fetchServices } from '@/lib/api';
import type { Service } from '@/types';

export function ServicesList() {
  const [services, setServices] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const data = await fetchServices({ limit: 50 });
        setServices(data.services || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    }

    void loadServices();
  }, []);

  if (loading) {
    return <LoadingGrid />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 border border-red-900 bg-red-950/20">
        <div className="text-center">
          <div className="font-mono text-sm text-red-500 mb-2">
            Error loading services
          </div>
          <p className="text-xs text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-24 h-24 border-2 border-gray-800 mb-6 mx-auto relative">
            <div className="absolute inset-4 border border-gray-800" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No Services Discovered
          </h2>
          <p className="text-sm text-gray-500 font-mono">
            Start your services with Lattice plugin to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          routeCount={0}
          dependencyCount={0}
        />
      ))}
    </div>
  );
}
