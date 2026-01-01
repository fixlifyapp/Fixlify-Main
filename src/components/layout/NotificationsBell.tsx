import { useState, useEffect, useCallback } from 'react';
import { Bell, Phone, PhoneMissed, MessageSquare, Mail, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  type: 'call' | 'message' | 'email' | 'system' | 'voicemail';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  data?: {
    phoneNumber?: string;
    clientName?: string;
    clientId?: string;
    jobId?: string;
    callControlId?: string;
    recordingUrl?: string;
  };
}

export const NotificationsBell = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Count unread by type
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadCalls = notifications.filter(n => !n.isRead && (n.type === 'call' || n.type === 'voicemail')).length;
  const unreadMessages = notifications.filter(n => !n.isRead && (n.type === 'message' || n.type === 'email')).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch from user_notifications table
      const { data: dbNotifications, error: notifError } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notifError) {
        console.error('Error fetching notifications:', notifError);
      }

      // Fetch recent missed calls (last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data: missedCalls, error: callsError } = await supabase
        .from('telnyx_calls')
        .select('*')
        .in('status', ['missed', 'voicemail_received', 'no_answer'])
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (callsError) {
        console.error('Error fetching missed calls:', callsError);
      }

      // Fetch recent inbound messages (sms_messages table doesn't have read tracking)
      const { data: unreadSms, error: smsError } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('direction', 'inbound')
        .gte('created_at', yesterday.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (smsError) {
        console.error('Error fetching SMS messages:', smsError);
      }

      // Combine all notifications
      const allNotifications: NotificationItem[] = [];

      // Add database notifications
      if (dbNotifications) {
        dbNotifications.forEach(n => {
          allNotifications.push({
            id: `notif-${n.id}`,
            type: n.type === 'call' ? 'call' : n.type === 'message' ? 'message' : 'system',
            title: n.title,
            description: n.message,
            timestamp: n.created_at,
            isRead: n.is_read,
            data: n.data
          });
        });
      }

      // Add missed calls
      if (missedCalls) {
        missedCalls.forEach(call => {
          const isVoicemail = call.status === 'voicemail_received';
          allNotifications.push({
            id: `call-${call.id}`,
            type: isVoicemail ? 'voicemail' : 'call',
            title: isVoicemail ? 'New Voicemail' : 'Missed Call',
            description: formatPhoneNumber(call.from_number || 'Unknown'),
            timestamp: call.created_at,
            isRead: call.metadata?.notification_read || false,
            data: {
              phoneNumber: call.from_number,
              callControlId: call.call_control_id,
              recordingUrl: call.recording_url
            }
          });
        });
      }

      // Add recent SMS messages
      if (unreadSms) {
        unreadSms.forEach(sms => {
          const messageContent = sms.content || sms.message || 'New message';
          allNotifications.push({
            id: `sms-${sms.id}`,
            type: 'message',
            title: formatPhoneNumber(sms.from_number),
            description: messageContent.substring(0, 80) + (messageContent.length > 80 ? '...' : ''),
            timestamp: sms.created_at || new Date().toISOString(),
            isRead: false,
            data: {
              phoneNumber: sms.from_number
            }
          });
        });
      }

      // Sort by timestamp
      allNotifications.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to real-time updates
      const notifChannel = supabase
        .channel('notifications-realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          fetchNotifications();
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'sms_messages',
          filter: 'direction=eq.inbound'
        }, (payload) => {
          // Add new SMS notification
          const sms = payload.new as { id: string; from_number: string; body?: string; created_at: string };
          const newNotif: NotificationItem = {
            id: `sms-${sms.id}`,
            type: 'message',
            title: formatPhoneNumber(sms.from_number),
            description: sms.body?.substring(0, 80) || 'New message',
            timestamp: sms.created_at,
            isRead: false,
            data: { phoneNumber: sms.from_number }
          };
          setNotifications(prev => [newNotif, ...prev]);

          // Show toast
          toast.info('New message received', {
            description: newNotif.description
          });
        })
        .subscribe();

      // Subscribe to incoming calls channel for missed call notifications
      const callChannel = supabase
        .channel('call-notifications')
        .on('broadcast', { event: 'call_missed' }, (payload) => {
          const newNotif: NotificationItem = {
            id: `call-${Date.now()}`,
            type: 'call',
            title: 'Missed Call',
            description: formatPhoneNumber(payload.payload.from),
            timestamp: new Date().toISOString(),
            isRead: false,
            data: { phoneNumber: payload.payload.from }
          };
          setNotifications(prev => [newNotif, ...prev]);

          toast.warning('Missed call', {
            description: `From ${newNotif.description}`
          });
        })
        .on('broadcast', { event: 'new_voicemail' }, (payload) => {
          const newNotif: NotificationItem = {
            id: `vm-${Date.now()}`,
            type: 'voicemail',
            title: 'New Voicemail',
            description: 'Tap to listen',
            timestamp: new Date().toISOString(),
            isRead: false,
            data: { recordingUrl: payload.payload.recordingUrl }
          };
          setNotifications(prev => [newNotif, ...prev]);

          toast.info('New voicemail received');
        })
        .subscribe();

      return () => {
        supabase.removeChannel(notifChannel);
        supabase.removeChannel(callChannel);
      };
    }
  }, [user, fetchNotifications]);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'Unknown';
    const cleaned = phone.replace(/^\+1/, '').replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 2880) return 'Yesterday';
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const markAsRead = async (notification: NotificationItem) => {
    // Update local state immediately
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );

    // Update database based on notification type
    if (notification.id.startsWith('notif-')) {
      const id = notification.id.replace('notif-', '');
      await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
    } else if (notification.id.startsWith('sms-')) {
      // Note: sms_messages table doesn't have read tracking columns
      // Just mark as read in local state only
    } else if (notification.id.startsWith('call-')) {
      const id = notification.id.replace('call-', '');
      // Update call metadata
      const { data: call } = await supabase
        .from('telnyx_calls')
        .select('metadata')
        .eq('id', id)
        .single();

      if (call) {
        await supabase
          .from('telnyx_calls')
          .update({ metadata: { ...call.metadata, notification_read: true } })
          .eq('id', id);
      }
    }
  };

  const markAllAsRead = async () => {
    // Update local state
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    // Update database
    if (user) {
      await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);
    }

    toast.success('All notifications marked as read');
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markAsRead(notification);
    setIsOpen(false);

    // Navigate based on type
    if (notification.type === 'message' && notification.data?.clientId) {
      navigate(`/clients/${notification.data.clientId}`);
    } else if (notification.type === 'message') {
      navigate('/connect?tab=messages');
    } else if (notification.type === 'call' || notification.type === 'voicemail') {
      navigate('/connect?tab=calls');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <PhoneMissed className="h-4 w-4 text-red-500" />;
      case 'voicemail':
        return <Phone className="h-4 w-4 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <Mail className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    if (activeTab === 'calls') return n.type === 'call' || n.type === 'voicemail';
    if (activeTab === 'messages') return n.type === 'message' || n.type === 'email';
    return true;
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 shadow-xl border-0 rounded-xl overflow-hidden"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-lg">Notifications</h3>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-gray-300 hover:text-white hover:bg-white/10 h-8 px-2"
                >
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-gray-300 hover:text-white hover:bg-white/10 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b bg-gray-50 dark:bg-gray-900">
            <TabsList className="w-full h-11 bg-transparent p-0 rounded-none">
              <TabsTrigger
                value="all"
                className="flex-1 h-11 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                All
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 bg-gray-200 text-gray-700">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="calls"
                className="flex-1 h-11 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <Phone className="h-4 w-4 mr-1.5" />
                Calls
                {unreadCalls > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 bg-red-100 text-red-700">
                    {unreadCalls}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="flex-1 h-11 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <MessageSquare className="h-4 w-4 mr-1.5" />
                Messages
                {unreadMessages > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 bg-blue-100 text-blue-700">
                    {unreadMessages}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Content */}
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="h-6 w-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Bell className="h-10 w-10 mb-2 opacity-30" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "flex items-start gap-3 p-4 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/10"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                      notification.type === 'call' && "bg-red-100 dark:bg-red-900/30",
                      notification.type === 'voicemail' && "bg-orange-100 dark:bg-orange-900/30",
                      notification.type === 'message' && "bg-blue-100 dark:bg-blue-900/30",
                      notification.type === 'email' && "bg-purple-100 dark:bg-purple-900/30",
                      notification.type === 'system' && "bg-gray-100 dark:bg-gray-800"
                    )}>
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !notification.isRead ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-300"
                        )}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                      {notification.type === 'voicemail' && notification.data?.recordingUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="h-auto p-0 mt-1 text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(notification.data?.recordingUrl, '_blank');
                          }}
                        >
                          Play voicemail
                        </Button>
                      )}
                    </div>

                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <div className="border-t bg-gray-50 dark:bg-gray-900 p-2">
          <Button
            variant="ghost"
            className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => {
              setIsOpen(false);
              navigate('/connect');
            }}
          >
            View all activity
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
