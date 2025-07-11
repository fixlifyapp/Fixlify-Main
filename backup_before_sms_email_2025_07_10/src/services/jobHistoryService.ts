
import { supabase } from '@/integrations/supabase/client';
import { PaymentMethod } from '@/types/payment';

export const recordStatusChange = async (
  jobId: string,
  oldStatus: string,
  newStatus: string,
  userName?: string,
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('job_history')
      .insert({
        job_id: jobId,
        type: 'status-change',
        title: 'Job Status Changed',
        description: `Status changed from "${oldStatus}" to "${newStatus}"`,
        user_name: userName,
        user_id: userId,
        old_value: { status: oldStatus },
        new_value: { status: newStatus }
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Status change recorded:', data);
    return data;
  } catch (error) {
    console.error('❌ Error recording status change:', error);
    throw error;
  }
};

export const recordNoteAdded = async (
  jobId: string,
  note: string,
  userName?: string,
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('job_history')
      .insert({
        job_id: jobId,
        type: 'note',
        title: 'Note Added',
        description: note,
        user_name: userName,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Note recorded:', data);
    return data;
  } catch (error) {
    console.error('❌ Error recording note:', error);
    throw error;
  }
};

export const recordPayment = async (
  jobId: string,
  amount: number,
  method: PaymentMethod,
  userName?: string,
  userId?: string,
  reference?: string
) => {
  try {
    console.log('🔄 Recording payment in history:', {
      jobId,
      amount,
      method,
      userName,
      userId,
      reference
    });

    const { data, error } = await supabase
      .from('job_history')
      .insert({
        job_id: jobId,
        type: 'payment',
        title: 'Payment Received',
        description: `Payment of $${amount} received via ${method}${reference ? ` (Ref: ${reference})` : ''}`,
        user_name: userName,
        user_id: userId,
        meta: {
          amount,
          method,
          reference
        }
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error recording payment history:', error);
      throw error;
    }

    console.log('✅ Payment recorded in history:', data);
    return data;
  } catch (error) {
    console.error('❌ Error in recordPayment:', error);
    throw error;
  }
};

export const recordTechnicianChange = async (
  jobId: string,
  oldTechnician: string,
  newTechnician: string,
  userName?: string,
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('job_history')
      .insert({
        job_id: jobId,
        type: 'technician',
        title: 'Technician Assigned',
        description: `Technician changed from "${oldTechnician}" to "${newTechnician}"`,
        user_name: userName,
        user_id: userId,
        old_value: { technician: oldTechnician },
        new_value: { technician: newTechnician }
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Technician change recorded:', data);
    return data;
  } catch (error) {
    console.error('❌ Error recording technician change:', error);
    throw error;
  }
};

export const recordFileAttached = async (
  jobId: string,
  fileName: string,
  fileUrl: string,
  userName?: string,
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('job_history')
      .insert({
        job_id: jobId,
        type: 'file',
        title: 'File Attached',
        description: `File "${fileName}" was attached to the job`,
        user_name: userName,
        user_id: userId,
        meta: {
          fileName,
          fileUrl
        }
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ File attachment recorded:', data);
    return data;
  } catch (error) {
    console.error('❌ Error recording file attachment:', error);
    throw error;
  }
};

export const recordCommunication = async (
  jobId: string,
  type: 'call' | 'email' | 'sms',
  description: string,
  userName?: string,
  userId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('job_history')
      .insert({
        job_id: jobId,
        type: 'communication',
        title: `${type.toUpperCase()} Communication`,
        description,
        user_name: userName,
        user_id: userId,
        meta: {
          communicationType: type
        }
      })
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Communication recorded:', data);
    return data;
  } catch (error) {
    console.error('❌ Error recording communication:', error);
    throw error;
  }
};
