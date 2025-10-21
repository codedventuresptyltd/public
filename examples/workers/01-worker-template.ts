import { BaseWorker, JobCard } from '@commercebridge/core'


class MyWorker extends BaseWorker { //Extend the base worker model
  constructor(worker: any) {
    super(worker);
    this.workerType = "my-worker"; //Set the worker type
  }

  async work(): Promise<void> { //The man worker loop

    // Jobcards are fetched automatically from the queue and passed into the work task list
    // If a jobCard is in an error state it is automatically skipped

    // Add your work tasks here. Each job will be processed through this work task list
    this.cycleMeta.jobCards = await this.processData(this.cycleMeta.jobCards)

}

protected async processData(jobCards: JobCard[]): Promise<JobCard[]> {
  return this.cycleMeta.processJobs(async (jobCard: JobCard) => {

    // Each jobcard is passed into this loop as jobCard: jobModel

    // Your business logic here
    jobCard.data.engagement = await this.engagement_getEngagement(jobCard.data.engagement) //Do some task
    // Your business logic here

    jobCard.status = "Processed"  //Set the status to Processed when all processing is completed
    
    return jobCard //Always return the resulting jobCard
  }, 
    jobCards, //This is the batch of jobCards to process
    {
        maxRetries: 3, //This is the number of retries to attempt
        retryDelay: 1000, //This is the delay between retries
        timeout: 5000, //This is the timeout for the job
    }
  ) 

}
}