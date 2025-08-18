import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Phone, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  customer_name: string;
  phone: string;
  appointment_date: string;
  appointment_time: string;
  device_type: string;
  issue_description: string;
  status: string;
  created_at: string;
}

export const AppointmentsList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
    
    // Set up realtime subscription
    const subscription = supabase
      .channel('appointments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        () => {          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };

  if (loading) {
    return <div className="p-4">Loading appointments...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">AI Dispatcher Appointments</h2>
      
      {appointments.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No appointments scheduled yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Appointments booked through AI dispatcher will appear here
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (            <div
              key={appointment.id}
              className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {appointment.customer_name}
                  </h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Phone className="h-4 w-4" />
                    {appointment.phone}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    appointment.status === 'scheduled'
                      ? 'bg-blue-100 text-blue-800'
                      : appointment.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {appointment.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center gap-2 text-sm">                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{appointment.appointment_time}</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Service:</strong> {appointment.device_type || 'General Service'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Issue:</strong> {appointment.issue_description || 'No description'}
                </p>
              </div>

              {appointment.status === 'scheduled' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => updateStatus(appointment.id, 'completed')}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark Complete
                  </button>
                  <button                    onClick={() => updateStatus(appointment.id, 'cancelled')}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};