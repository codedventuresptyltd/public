/**
 * Translator Worker Example
 * 
 * Shows how to use translators in a worker to convert engagements to external formats (cXML, EDI, etc.)
 * 
 * Pattern:
 * 1. Fetch engagement
 * 2. Check translator exists
 * 3. Run translator
 * 4. Return/send output
 */

import { BaseWorker, JobCard } from '@commercebridge/core'

class TranslatorWorker extends BaseWorker {
  constructor(worker: any) {
    super(worker);
    this.workerType = "translator-worker";
  }

  async work(): Promise<void> {
    // Job cards are fetched automatically from the queue
    // Each job card contains: engagementId, translatorKey, outputDestination

    // Phase 1: Fetch engagements
    this.cycleMeta.jobCards = await this.getSourceData(this.cycleMeta.jobCards)

    // Phase 2: Run translators
    this.cycleMeta.jobCards = await this.translateEngagements(this.cycleMeta.jobCards)

    // Phase 3: Save output
    // Not provided in this example
  }

  /**
   * Phase 1: Fetch engagements from database
   */
  protected async getSourceData(jobCards: JobCard[]): Promise<JobCard[]> {
    // Batch fetch all engagements
    const engagements = await this.bridge.engagement_getEngagements(
      jobCards.map(job => ({
        engagementId: job.inputs.engagementId,
        requestingEntity: job.requestingEntity
      }))
    );

    // Attach engagements to job cards
    return this.cycleMeta.processJobs(async (jobCard: JobCard) => {
      const matchingEngagement = engagements.find(
        eng => eng._id.toString() === jobCard.inputs.engagementId
      );

      if (!matchingEngagement) {
        jobCard.status = "Error";
        jobCard.error = `Engagement not found: ${jobCard.inputs.engagementId}`;
      } else {
        jobCard.data.sourceEngagement = matchingEngagement;
      }

      return jobCard;
    }, jobCards);
  }

  /**
   * Phase 2: Run translators on engagements
   */
  protected async translateEngagements(jobCards: JobCard[]): Promise<JobCard[]> {
    return this.cycleMeta.processJobs(async (jobCard: JobCard) => {

      // 1. Check if translator exists
      const translatorKey = jobCard.inputs.translatorKey 

      
      if (!this.bridge.translators.has(translatorKey)) {
        jobCard.status = "Error";
        jobCard.error = `Translator not found: ${translatorKey}`;
        return jobCard;
      }

      // 2. Run the translator
      const output = this.bridge.translators.run(translatorKey, jobCard.data.sourceEngagement);
      

      // 3. Store output in job card
      jobCard.data.translatedOutput = output;
      jobCard.data.translatorUsed = translatorKey;

      jobCard.status = "Processed";
      return jobCard;

    }, jobCards, {
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 10000,
    });
  }

}

export { TranslatorWorker };

