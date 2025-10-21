import { BaseBridge, BridgeConfig} from '@commercebridge/core';
import { Logger } from '@mesh/ecosystem/logger';

import dotenv from 'dotenv';
dotenv.config();


// ============================================================================
// Custom Bridge Implementation
// ============================================================================

/**
 * Custom bridge for a specific client with special requirements
 */
class TimberWholesaleBridge extends BaseBridge {
  private erpClient: any;
  private warehouseApiKey: string;

  constructor(config: BridgeConfig & { erpApiKey: string; warehouseApiKey: string }) {
    
    super(config); // This will connect to all the core integrations as detailed in the config

    // Setup your bridge here
    this.warehouseApiKey = process.env.WAREHOUSE_API_KEY;
    
    await this.connectERP().catch(error => {
      Logger.error(`[TimberWholesaleBridge] Failed to connect to ERP: ${error}`);
      throw error;
    });
  }

  /**
   * Connect to client-specific ERP system
   */
  private async connectERP(): Promise<void> {
    Logger.info('[TimberWholesaleBridge] Connecting to ERP system...');
    // Connect to client's bespoke ERP
    this.erpClient = { connected: true, system: 'SAP' };
    Logger.info('[TimberWholesaleBridge] ERP connected');
  }


// ============================================================================
// Expose you custom bridge methods here
// ============================================================================

  /**
   * Sync engagement to ERP system
   */
  async syncToERP(engagementId: string): Promise<void> {
    Logger.log(`[TimberWholesaleBridge] Syncing ${engagementId} to ERP...`);

    // Get engagement details calling the baseBridge function
    const engagement = await this.enagement.getEngagement(engagementId).catch(error => {
      Logger.error(`[TimberWholesaleBridge] Failed to get engagement: ${error}`);
      throw error;
    });

    // Transform to ERP format
    const erpOrder = this.transformToERPFormat(engagement).catch(error => {
      Logger.error(`[TimberWholesaleBridge] Failed to transform to ERP format: ${error}`);
      throw error;
    });

    // Send to ERP
    await this.sendToERP(erpOrder).catch(error => {
      Logger.error(`[TimberWholesaleBridge] Failed to sync to ERP: ${error}`);
      throw error;
    });

    Logger.log(`[TimberWholesaleBridge] ✓ Synced to ERP with ID: ${erpOrder.erpOrderId}`);
  }


  private transformToERPFormat(engagement: any): any {
    return {
      erpOrderId: `ERP-${Date.now()}`,
      customerNumber: engagement.customerId,
      items: engagement.lineItems,
      totalAmount: engagement.total,
    };
  }

  private async sendToERP(erpOrder: any): Promise<void> {
    // Simulated ERP send
      Logger.log('[TimberWholesaleBridge] Sending to ERP:', erpOrder);
  }

}