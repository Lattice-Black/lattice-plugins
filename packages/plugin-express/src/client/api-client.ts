import { ServiceMetadataSubmission, HTTP_HEADERS, API_ENDPOINTS } from '@lattice/core';
import { SubmissionResponse } from '../config/types';

/**
 * API client for submitting metadata to Lattice collector
 */
export class ApiClient {
  private apiEndpoint: string;
  private apiKey: string;

  constructor(apiEndpoint: string, apiKey: string) {
    this.apiEndpoint = apiEndpoint.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = apiKey;
  }

  /**
   * Submit service metadata to collector API
   */
  async submitMetadata(metadata: ServiceMetadataSubmission): Promise<SubmissionResponse> {
    const url = `${this.apiEndpoint}${API_ENDPOINTS.INGEST_METADATA}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { [HTTP_HEADERS.API_KEY]: this.apiKey }),
          [HTTP_HEADERS.SCHEMA_VERSION]: '1.0.0',
        },
        body: JSON.stringify(metadata),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API submission failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const result = (await response.json()) as SubmissionResponse;
      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to submit metadata: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Health check to verify API connectivity
   */
  async healthCheck(): Promise<boolean> {
    const url = `${this.apiEndpoint}${API_ENDPOINTS.HEALTH}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
