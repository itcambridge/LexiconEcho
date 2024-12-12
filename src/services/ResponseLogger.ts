class ResponseLogger {
  async logInteraction(
    query: string, 
    responses: AgentResponse[]
  ): Promise<void> {
    const interaction = {
      timestamp: new Date(),
      query,
      responses,
      interactionId: uuid()
    };

    await this.writeToFile(
      `logs/${format(new Date(), 'yyyy-MM-dd')}/interactions.json`,
      interaction
    );
  }
} 