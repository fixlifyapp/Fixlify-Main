/**
 * Cost Optimization Agent for Fixlify
 * Use with Claude Code: @file:cost-agent.ts
 */

export class CostAgent {
  private costs = {
    supabase: { database: 0, storage: 0, functions: 0 },
    telnyx: { calls: 0, sms: 0 },
    ai: { openai: 0, claude: 0 },
    total: 0
  }

  async analyzeCosts() {
    console.log('💰 Analyzing Costs...\n')
    
    await this.checkSupabaseCosts()
    await this.checkTelnyxCosts()
    await this.checkAICosts()
    
    return this.generateReport()
  }

  async checkSupabaseCosts() {
    // Database size
    const { data: dbSize } = await window.supabase.rpc('get_database_size')
    this.costs.supabase.database = this.calculateDatabaseCost(dbSize)
    
    // Storage usage
    const { data: storageSize } = await window.supabase.storage.from('uploads').list()
    this.costs.supabase.storage = this.calculateStorageCost(storageSize)
    
    // Function invocations
    const { data: invocations } = await window.supabase
      .from('webhook_logs')
      .select('count')
      .gte('created_at', new Date(Date.now() - 2592000000)) // Last 30 days
    
    this.costs.supabase.functions = invocations * 0.00002 // $0.02 per 1000
  }

  async checkTelnyxCosts() {
    // Call costs
    const { data: calls } = await window.supabase
      .from('ai_dispatcher_call_logs')
      .select('duration')
      .gte('created_at', new Date(Date.now() - 2592000000))
    
    const totalMinutes = calls?.reduce((sum, call) => sum + (call.duration / 60), 0) || 0
    this.costs.telnyx.calls = totalMinutes * 0.025 // $0.025 per minute
    
    // SMS costs
    const { data: messages } = await window.supabase
      .from('sms_messages')
      .select('count')
      .gte('created_at', new Date(Date.now() - 2592000000))
    
    this.costs.telnyx.sms = (messages?.length || 0) * 0.004 // $0.004 per SMS
  }

  async checkAICosts() {
    // Estimate based on usage
    const { data: aiCalls } = await window.supabase
      .from('webhook_logs')
      .select('*')
      .eq('webhook_name', 'ai-assistant-webhook')
      .gte('created_at', new Date(Date.now() - 2592000000))
    
    this.costs.ai.openai = (aiCalls?.length || 0) * 0.002 // Estimate
    this.costs.ai.claude = 0 // Included in Telnyx
  }

  calculateDatabaseCost(sizeInMB) {
    const freeLimit = 500 // 500MB free
    if (sizeInMB <= freeLimit) return 0
    return (sizeInMB - freeLimit) * 0.125 // $0.125 per GB
  }

  calculateStorageCost(files) {
    const totalSizeMB = files?.reduce((sum, file) => sum + file.metadata?.size || 0, 0) / 1048576 || 0
    const freeLimit = 1000 // 1GB free
    if (totalSizeMB <= freeLimit) return 0
    return (totalSizeMB - freeLimit) * 0.021 // $0.021 per GB
  }

  generateReport() {
    this.costs.total = Object.values(this.costs.supabase).reduce((a, b) => a + b, 0) +
                       Object.values(this.costs.telnyx).reduce((a, b) => a + b, 0) +
                       Object.values(this.costs.ai).reduce((a, b) => a + b, 0)
    
    return {
      monthly: this.costs,
      daily: this.costs.total / 30,
      projectedYearly: this.costs.total * 12,
      optimization: this.getOptimizationTips()
    }
  }

  getOptimizationTips() {
    const tips = []
    
    if (this.costs.supabase.database > 10) {
      tips.push('Consider archiving old jobs to reduce database size')
    }
    
    if (this.costs.telnyx.calls > 50) {
      tips.push('AI calls are high - optimize conversation length')
    }
    
    if (this.costs.supabase.functions > 5) {
      tips.push('High function usage - implement caching')
    }
    
    return tips
  }
}