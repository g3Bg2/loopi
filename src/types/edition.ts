/**
 * Edition and Licensing Types
 * 
 * Defines the different editions of Loopi and their capabilities
 */

export type Edition = "community" | "enterprise";

export interface EditionConfig {
  edition: Edition;
  features: EditionFeatures;
}

export interface EditionFeatures {
  // Browser automation (available in all editions)
  browserAutomation: boolean;
  
  // File system operations
  fileSystemAutomation: boolean;
  
  // System-level automation
  systemAutomation: boolean;
  
  // Database operations
  databaseAutomation: boolean;
  
  // Email automation
  emailAutomation: boolean;
  
  // Cloud services
  cloudIntegration: boolean;
  
  // Advanced API features
  advancedApiWorkflows: boolean;
  
  // Team collaboration
  teamCollaboration: boolean;
  
  // Role-based access control
  rbac: boolean;
  
  // Audit logging
  auditLogging: boolean;
  
  // Advanced scheduling
  advancedScheduling: boolean;
  
  // Monitoring and alerts
  monitoring: boolean;
  
  // Enterprise connectors
  enterpriseConnectors: boolean;
  
  // Version control
  versionControl: boolean;
}

export const COMMUNITY_FEATURES: EditionFeatures = {
  browserAutomation: true,
  fileSystemAutomation: false,
  systemAutomation: false,
  databaseAutomation: false,
  emailAutomation: false,
  cloudIntegration: false,
  advancedApiWorkflows: false,
  teamCollaboration: false,
  rbac: false,
  auditLogging: false,
  advancedScheduling: false,
  monitoring: false,
  enterpriseConnectors: false,
  versionControl: false,
};

export const ENTERPRISE_FEATURES: EditionFeatures = {
  browserAutomation: true,
  fileSystemAutomation: true,
  systemAutomation: true,
  databaseAutomation: true,
  emailAutomation: true,
  cloudIntegration: true,
  advancedApiWorkflows: true,
  teamCollaboration: true,
  rbac: true,
  auditLogging: true,
  advancedScheduling: true,
  monitoring: true,
  enterpriseConnectors: true,
  versionControl: true,
};

/**
 * Get edition configuration
 * In a real implementation, this would check license keys, environment variables, etc.
 */
export function getEditionConfig(): EditionConfig {
  // Check for enterprise license (environment variable, license file, etc.)
  const isEnterprise = process.env.LOOPI_EDITION === "enterprise" || 
                       process.env.LOOPI_LICENSE_KEY !== undefined;
  
  return {
    edition: isEnterprise ? "enterprise" : "community",
    features: isEnterprise ? ENTERPRISE_FEATURES : COMMUNITY_FEATURES,
  };
}

/**
 * Check if a feature is available in the current edition
 */
export function hasFeature(feature: keyof EditionFeatures): boolean {
  const config = getEditionConfig();
  return config.features[feature];
}
