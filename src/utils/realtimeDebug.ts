// Debug utility for real-time connections
export const debugRealtime = () => {
  const channels = (window as any).supabaseChannels || [];
  console.group('🔍 Real-time Debug Info');
  console.log('Active channels:', channels.length);
  channels.forEach((channel: any, index: number) => {
    console.log(`Channel ${index}:`, {
      topic: channel.topic,
      state: channel.state,
      joinedOnce: channel.joinedOnce,
      params: channel.params
    });
  });
  console.groupEnd();
};

// Add to window for easy debugging
if (typeof window !== 'undefined') {
  (window as any).debugRealtime = debugRealtime;
}

// Monitor real-time connection issues
export const monitorRealtimeHealth = () => {
  let lastHeartbeat = Date.now();
  let connectionIssues = 0;

  setInterval(() => {
    const now = Date.now();
    const timeSinceLastHeartbeat = now - lastHeartbeat;
    
    if (timeSinceLastHeartbeat > 60000) { // 1 minute without heartbeat
      connectionIssues++;
      console.warn(`⚠️ Real-time connection issue detected. Issues: ${connectionIssues}`);
      
      if (connectionIssues > 3) {
        console.error('❌ Real-time connection appears to be dead. Consider refreshing.');
      }
    }
  }, 30000); // Check every 30 seconds

  // Update heartbeat on any real-time activity
  const originalOn = WebSocket.prototype.send;
  WebSocket.prototype.send = function(...args) {
    lastHeartbeat = Date.now();
    return originalOn.apply(this, args);
  };
};

// Start monitoring
monitorRealtimeHealth();
