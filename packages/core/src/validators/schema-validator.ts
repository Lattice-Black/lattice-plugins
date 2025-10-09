import Ajv, { ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import schemaV1 from '../../../../specs/001-service-discovery-and/contracts/schema-v1.json';
import type { ServiceMetadataSubmission } from '../types';

/**
 * Schema validator using AJV with JSON Schema v1.0.0
 */
export class SchemaValidator {
  private ajv: Ajv;
  private validateService: ValidateFunction | undefined;
  private validateRoute: ValidateFunction | undefined;
  private validateDependency: ValidateFunction | undefined;
  private validateConnection: ValidateFunction | undefined;
  private validateSubmission: ValidateFunction | undefined;

  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      strict: false,
      validateFormats: true,
    });
    addFormats(this.ajv);

    // Add the full schema first so $ref works
    if (schemaV1.definitions) {
      this.ajv.addSchema(schemaV1);

      // Compile individual validators using the schema $id and $ref syntax
      this.validateService = this.ajv.compile({
        $ref: `${schemaV1.$id}#/definitions/Service`
      });
      this.validateRoute = this.ajv.compile({
        $ref: `${schemaV1.$id}#/definitions/Route`
      });
      this.validateDependency = this.ajv.compile({
        $ref: `${schemaV1.$id}#/definitions/Dependency`
      });
      this.validateConnection = this.ajv.compile({
        $ref: `${schemaV1.$id}#/definitions/Connection`
      });
      this.validateSubmission = this.ajv.compile({
        $ref: `${schemaV1.$id}#/definitions/ServiceMetadataSubmission`
      });
    }
  }

  /**
   * Validate a service metadata submission payload
   */
  validateServiceMetadata(data: unknown): ValidationResult<ServiceMetadataSubmission> {
    if (!this.validateSubmission) {
      return {
        valid: false,
        errors: ['Schema validator not initialized'],
      };
    }

    const valid = this.validateSubmission(data);

    if (valid) {
      return {
        valid: true,
        data: data as ServiceMetadataSubmission,
      };
    }

    return {
      valid: false,
      errors: this.formatErrors(this.validateSubmission.errors || []),
    };
  }

  /**
   * Validate a single service object
   */
  validateServiceObject(data: unknown): ValidationResult {
    if (!this.validateService) {
      return {
        valid: false,
        errors: ['Schema validator not initialized'],
      };
    }

    const valid = this.validateService(data);

    if (valid) {
      return { valid: true, data };
    }

    return {
      valid: false,
      errors: this.formatErrors(this.validateService.errors || []),
    };
  }

  /**
   * Validate a single route object
   */
  validateRouteObject(data: unknown): ValidationResult {
    if (!this.validateRoute) {
      return {
        valid: false,
        errors: ['Schema validator not initialized'],
      };
    }

    const valid = this.validateRoute(data);

    if (valid) {
      return { valid: true, data };
    }

    return {
      valid: false,
      errors: this.formatErrors(this.validateRoute.errors || []),
    };
  }

  /**
   * Validate a single dependency object
   */
  validateDependencyObject(data: unknown): ValidationResult {
    if (!this.validateDependency) {
      return {
        valid: false,
        errors: ['Schema validator not initialized'],
      };
    }

    const valid = this.validateDependency(data);

    if (valid) {
      return { valid: true, data };
    }

    return {
      valid: false,
      errors: this.formatErrors(this.validateDependency.errors || []),
    };
  }

  /**
   * Validate a single connection object
   */
  validateConnectionObject(data: unknown): ValidationResult {
    if (!this.validateConnection) {
      return {
        valid: false,
        errors: ['Schema validator not initialized'],
      };
    }

    const valid = this.validateConnection(data);

    if (valid) {
      return { valid: true, data };
    }

    return {
      valid: false,
      errors: this.formatErrors(this.validateConnection.errors || []),
    };
  }

  /**
   * Format AJV errors into readable messages
   */
  private formatErrors(errors: Array<{ instancePath: string; message?: string }>): string[] {
    return errors.map((error) => {
      const path = error.instancePath || 'root';
      const message = error.message || 'validation failed';
      return `${path}: ${message}`;
    });
  }

  /**
   * Get the schema version
   */
  getSchemaVersion(): string {
    return schemaV1.version;
  }
}

/**
 * Validation result type
 */
export interface ValidationResult<T = unknown> {
  valid: boolean;
  data?: T;
  errors?: string[];
}

/**
 * Singleton instance
 */
export const schemaValidator = new SchemaValidator();
