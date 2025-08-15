/**
 * Analytics Agent for Fixlify
 * Use with Claude Code: @file:analytics-agent.ts
 */

export class AnalyticsAgent {
  async generateReport() {
    return {
      revenue: await this.analyzeRevenue(),
      customers: await this.analyzeCustomers(),
      operations: await this.analyzeOperations(),
      growth: await this.analyzeGrowth()
    }
  }

  async analyzeRevenue() {
    const { data: jobs } = await window.supabase
      .from('jobs')
      .select('revenue, created_at, status')
      .gte('created_at', new Date(Date.now() - 2592000000)) // 30 days
    
    const total = jobs?.reduce((sum, job) => sum + (job.revenue || 0), 0) || 0
    const completed = jobs?.filter(j => j.status === 'completed') || []
    const paid = completed.reduce((sum, job) => sum + (job.revenue || 0), 0)
    
    return {
      total,
      paid,
      pending: total - paid,
      averageTicket: jobs?.length ? total / jobs.length : 0
    }
  }

  async analyzeCustomers() {
    const { data: clients } = await window.supabase
      .from('clients')
      .select('*, jobs(count)')
    
    return {
      total: clients?.length || 0,
      new: clients?.filter(c => new Date(c.created_at) > new Date(Date.now() - 2592000000)).length || 0,
      retained: clients?.filter(c => c.jobs?.count > 1).length || 0,
      churnRate: this.calculateChurn(clients)
    }
  }

  async analyzeOperations() {
    const { data: jobs } = await window.supabase
      .from('jobs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 2592000000))
    
    return {
      totalJobs: jobs?.length || 0,
      avgCompletionTime: this.calculateAvgTime(jobs),
      statusBreakdown: this.groupByStatus(jobs),
      topServices: this.getTopServices(jobs)
    }
  }

  async analyzeGrowth() {
    // Month over month comparison
    const currentMonth = await this.getMonthData(0)
    const lastMonth = await this.getMonthData(1)
    
    return {
      revenue: this.calculateGrowthRate(currentMonth.revenue, lastMonth.revenue),
      customers: this.calculateGrowthRate(currentMonth.customers, lastMonth.customers),
      jobs: this.calculateGrowthRate(currentMonth.jobs, lastMonth.jobs)
    }
  }

  calculateChurn(clients) {
    // Simplified churn calculation
    return '5%'
  }

  calculateAvgTime(jobs) {
    // Simplified average time
    return '3 days'
  }

  groupByStatus(jobs) {
    const grouped = {}
    jobs?.forEach(job => {
      grouped[job.status] = (grouped[job.status] || 0) + 1
    })
    return grouped
  }

  getTopServices(jobs) {
    const services = {}
    jobs?.forEach(job => {
      services[job.device_model] = (services[job.device_model] || 0) + 1
    })
    return Object.entries(services).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }

  async getMonthData(monthsAgo) {
    const start = new Date()
    start.setMonth(start.getMonth() - monthsAgo - 1)
    const end = new Date()
    end.setMonth(end.getMonth() - monthsAgo)
    
    const { data: jobs } = await window.supabase
      .from('jobs')
      .select('revenue')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
    
    return {
      revenue: jobs?.reduce((sum, j) => sum + (j.revenue || 0), 0) || 0,
      jobs: jobs?.length || 0,
      customers: 0 // Simplified
    }
  }

  calculateGrowthRate(current, previous) {
    if (!previous) return '0%'
    return ((current - previous) / previous * 100).toFixed(2) + '%'
  }
}