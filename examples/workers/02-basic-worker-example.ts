/**
 * Basic Worker Example
 * 
 * Demonstrates:
 * - Simple worker extending WorkerModel
 * - ETL pattern: Extract → Transform → Load → Notify
 * - Bridge integration for data operations
 * - Job card processing with cycle metadata
 * 
 * This matches the actual CommerceBridge worker pattern.
 * 
 * Prerequisites:
 * - Bridge instance running
 * - MongoDB connection
 * - Job cards in queue
 */


// ============================================================================
// Worker Implementation
// ============================================================================

/**
 * Engagement Recalculator Worker
 * 
 * Processes engagement recalculation jobs:
 * 1. Fetch engagements from database
 * 2. Recalculate pricing and fulfillment
 * 3. Save updated engagements
 * 4. Send notifications
 */

import { BaseWorker, JobCard, WorkerConfig, CycleMetaModel, meshBridgeModel } from '@commercebridge/core'

class EngagementRecalculatorWorker {
  workerType = 'engagement_recalculator';
  cycleMeta!: CycleMetaModel;
  bridge!: meshBridgeModel;

  /**
   * Main work method - called by the worker framework
   * Follows ETL pattern: Extract → Transform → Load → Notify
   */
  async work(): Promise<void> {
    try {
      // Guard: No jobs to process
      if (!this.cycleMeta.jobCards?.length) {
        this.cycleMeta.logInfo('No job cards to process');
        return;
      }

      // Phase 1: Extract - Get source data
      this.cycleMeta.logInfo('Starting data extraction phase');
      this.cycleMeta.performance.clockStart('getData');
      this.cycleMeta.jobCards = await this.getSourceDataFromRepository(this.cycleMeta.jobCards);
      this.cycleMeta.performance.clockEnd();

      // Phase 2: Transform - Process data
      this.cycleMeta.logInfo('Starting data transformation phase');
      this.cycleMeta.jobCards = await this.transformData(this.cycleMeta.jobCards);

      // Phase 3: Load - Save processed data
      this.cycleMeta.logInfo('Starting data loading phase');
      this.cycleMeta.jobCards = await this.saveProcessedData(this.cycleMeta.jobCards);

      // Phase 4: Notify - Send notifications
      this.cycleMeta.logInfo('Starting notification phase');
      await this.createNotifications(this.cycleMeta.jobCards);

    } catch (error) {
      this.cycleMeta.logError(`Worker failed: ${error}`);
      throw error;
    }
  }

  /**
   * Phase 1: Extract - Get engagements from database
   */
  protected async getSourceDataFromRepository(jobCards: JobCard[]): Promise<JobCard[]> {
    // Batch fetch all engagements
    const engagements = await this.bridge.engagement_getEngagements(
      jobCards.map(job => ({
        engagementId: job.inputs.engagementId,
        requestingEntity: job.requestingEntity,
      }))
    );

    // Attach engagements to job cards
    return this.cycleMeta.processJobs(async (jobCard) => {
      const matchingEngagement = engagements.find(
        eng => eng._id.toString() === jobCard.inputs.engagementId
      );

      if (!matchingEngagement) {
        this.cycleMeta.logError(
          `No engagement (${jobCard.inputs.engagementId}) found for job card ${jobCard.id}`
        );
        jobCard.status = 'Error';
        return jobCard;
      }

      jobCard.data = jobCard.data || {};
      jobCard.data.sourceEngagement = matchingEngagement;
      
      return jobCard;
    }, jobCards);
  }

  /**
   * Phase 2: Transform - Recalculate pricing and fulfillment
   */
  protected async transformData(jobCards: JobCard[]): Promise<JobCard[]> {
    return this.cycleMeta.processJobs(async (jobCard) => {
      if (!jobCard.data?.sourceEngagement) {
        this.cycleMeta.logError(`No data found for job card ${jobCard.id}`);
        jobCard.status = 'Error';
        return jobCard;
      }

      const engagement = jobCard.data.sourceEngagement;

      try {
        // Get account and tenant info
        const buyer = Array.isArray(engagement.actors)
          ? engagement.actors.find((a: any) => a?.entityType === 'buyer')
          : undefined;
        const accountId = buyer?.attributes.accountId;
        const tenantId = engagement?.attributes?.tenantId || 'acme';

        // Validate line items
        if (!Array.isArray(engagement.lineItems)) {
          this.cycleMeta.logError(
            `Invalid lineItems for engagement ${engagement._id}: not an array`
          );
          return jobCard;
        }

        // Step 1: Calculate fulfillment (UOM + Inventory)
        const fulfillmentResults = await this.bridge.fulfillment_calculateFulfillmentForEngagement(
          tenantId,
          engagement.lineItems
        );

        // Step 2: Calculate pricing with fulfillment results
        const pricingResults = await this.bridge.pricing_calculatePricingForEngagement(
          tenantId,
          accountId,
          fulfillmentResults.lineItems
        );

        // Step 3: Update engagement with results
        engagement.lineItems = pricingResults.lineItems;

        // Step 4: Calculate totals from aggregates
        const aggregate = pricingResults.aggregate;
        const totalExTax = aggregate.totalExTax / 100; // Convert cents to dollars
        const discountTotal = aggregate.discount_total / 100;
        const aggregateDiscountTotal = aggregate.aggregate_discount_total / 100;

        const taxTotal = totalExTax * 0.15; // 15% tax
        const subtotal = totalExTax - discountTotal + taxTotal;
        const shippingTotal = 20;
        const total = subtotal + shippingTotal;

        engagement.totals = {
          total_items: aggregate.total_items,
          totalExTax,
          discount_total: discountTotal,
          aggregate_discount_total: aggregateDiscountTotal,
          shipping_total: shippingTotal,
          subtotal,
          total,
          taxTotal,
        };

        // Update version if provided
        if (jobCard.inputs.version) {
          engagement.version = jobCard.inputs.version;
        }

        jobCard.data.calculatedEngagement = engagement;
      } catch (error: any) {
        this.cycleMeta.logError(
          `Pricing/fulfillment failed for engagement ${engagement._id}: ${error?.message || error}`
        );
      }

      return jobCard;
    }, jobCards);
  }

  /**
   * Phase 3: Load - Save updated engagements to database
   */
  protected async saveProcessedData(jobCards: JobCard[]): Promise<JobCard[]> {
    return this.cycleMeta.processJobs(async (jobCard) => {

      // Bulk update all engagements
      await this.bridge.engagement_updateEngagement(jobCard.inputs.engagementId, jobCard.data.calculatedEngagement);

      return jobCard;
    }, jobCards);
  }
