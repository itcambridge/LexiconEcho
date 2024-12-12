class AgentOrchestrator {
  private readonly openAiService: OpenAIService;
  private readonly maxAgents: number = 2; // Limiting to 2 agents initially

  async processQuery(userQuery: string): Promise<OrchestrationResult> {
    // Step 1: CEO determines which agents to involve
    const agentSelection = await this.openAiService.getCeoAgentSelection(userQuery);
    
    // Step 2: Select top N agents based on confidence
    const selectedAgents = this.selectTopAgents(agentSelection, this.maxAgents);
    
    // Step 3: Process agent queries in parallel
    const agentResponses = await Promise.all(
      selectedAgents.map(agent => 
        this.openAiService.getAgentResponse(agent, userQuery)
      )
    );

    // Step 4: Save responses to log
    await this.logResponses(userQuery, agentResponses);

    return {
      originalQuery: userQuery,
      responses: agentResponses
    };
  }
} 