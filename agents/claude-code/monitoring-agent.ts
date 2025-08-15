/**
 * Monitoring Agent for Fixlify
 * Use with Claude Code: @file:monitoring-agent.ts
 */

export class MonitoringAgent {
  private alerts = []
  private metrics = {
    errors: [],
    performance: [],
    uptime: []
  }

  async startMonitoring() {
    console.log('👁️ Starting Production Monitoring...\n')
    
    // Real-time monitoring
    setInterval(() => this.checkHealth(), 60000) // Every minute
    setInterval(() => this.checkErrors(), 300000) // Every 5 minutes
    setInterval(() => this.checkPerformance(), 600000) // Every 10 minutes
  }

  async checkHealth() {
    const endpoints = [
      { name: 'Frontend', url: process.env.NEXT_PUBLIC_APP_URL },
      { name: 'AI Webhook', url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-assistant-webhook` },
      { name: 'Appointment Handler', url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-appointment-handler` }
    ]

    for (const endpoint of endpoints) {
      try {
        const start = Date.now()
        const response = await fetch(endpoint.url)
        const responseTime = Date.now() - start
        
        if (!response.ok) {
          this.createAlert('ERROR', `${endpoint.name} is down!`)
        } else if (responseTime > 3000) {
          this.createAlert('WARNING', `${endpoint.name} slow: ${responseTime}ms`)
        }
        
        this.metrics.uptime.push({
          endpoint: endpoint.name,
          status: response.ok ? 'up' : 'down',
          responseTime,
          timestamp: new Date()
        })
      } catch (error) {
        this.createAlert('CRITICAL', `${endpoint.name} unreachable!`)
      }
    }
  }

  async checkErrors() {
    // Check Supabase logs
    const { data: errors } = await window.supabase
      .from('webhook_logs')
      .select('*')
      .like('response_body', '%error%')
      .gte('created_at', new Date(Date.now() - 300000).toISOString())
    
    if (errors?.length > 0) {
      this.createAlert('ERROR', `${errors.length} new errors in logs`)
      this.metrics.errors.push(...errors)
    }

    // Check edge function logs
    const { data: functionErrors } = await window.supabase.rpc('get_edge_function_errors')
    if (functionErrors?.length > 0) {
      this.createAlert('ERROR', `Edge function errors detected`)
    }
  }

  async checkPerformance() {
    // Database performance
    const { data: slowQueries } = await window.supabase.rpc('get_slow_queries')
    if (slowQueries?.length > 0) {
      this.createAlert('WARNING', `${slowQueries.length} slow queries detected`)
    }

    // Check memory usage
    if (performance.memory) {
      const usedMemory = performance.memory.usedJSHeapSize / 1048576
      if (usedMemory > 100) {
        this.createAlert('WARNING', `High memory usage: ${usedMemory.toFixed(2)}MB`)
      }
    }
  }

  createAlert(level, message) {
    const alert = {
      level,
      message,
      timestamp: new Date(),
      resolved: false
    }
    
    this.alerts.push(alert)
    console.log(`[${level}] ${message}`)
    
    // Send notifications
    if (level === 'CRITICAL') {
      this.sendNotification(alert)
    }
  }

  async sendNotification(alert) {
    // SMS alert via Telnyx
    await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: process.env.ADMIN_PHONE,
        message: `🚨 CRITICAL: ${alert.message}`
      })
    })
  }

  getDashboard() {
    return {
      status: this.getSystemStatus(),
      alerts: this.alerts.filter(a => !a.resolved),
      metrics: this.metrics,
      uptime: this.calculateUptime()
    }
  }

  getSystemStatus() {
    const criticalAlerts = this.alerts.filter(a => a.level === 'CRITICAL' && !a.resolved)
    if (criticalAlerts.length > 0) return 'CRITICAL'
    
    const errorAlerts = this.alerts.filter(a => a.level === 'ERROR' && !a.resolved)
    if (errorAlerts.length > 0) return 'ERROR'
    
    const warningAlerts = this.alerts.filter(a => a.level === 'WARNING' && !a.resolved)
    if (warningAlerts.length > 0) return 'WARNING'
    
    return 'HEALTHY'
  }

  calculateUptime() {
    const last24Hours = this.metrics.uptime.filter(
      m => m.timestamp > new Date(Date.now() - 86400000)
    )
    
    const upCount = last24Hours.filter(m => m.status === 'up').length
    const totalCount = last24Hours.length
    
    return totalCount > 0 ? (upCount / totalCount * 100).toFixed(2) + '%' : 'N/A'
  }
}

// Auto-start monitoring
if (typeof window !== 'undefined') {
  window.monitoringAgent = new MonitoringAgent()
  window.monitoringAgent.startMonitoring()
}