// src/api/messagesApi.js
import { supabase } from "./supabaseClient";

// ✅ Get all messages
export const fetchMessages = async () => {
  const { data, error } = await supabase
    .from('global_messages')
    .select('*')
    .eq('id', 1);

  if (error) throw error;
  return data[0].messages;
};

// ✅ Insert new message
export const insertMessage = async ({ username, text }) => {
  const { error } = await supabase
    .from('global_messages')
    .insert([{ username, text }]);

  if (error) throw error;
};

// ✅ Append a new message to the 'messages' array in a specific row
export const appendMessageToArray = async (rowId, newMessage, columnName = 'messages') => {
    try {
      // 1. Fetch the current array
      const { data, error: fetchError } = await supabase
        .from('global_messages')
        .select(columnName)
        .eq('id', rowId)
        .single();
  
      if (fetchError) throw fetchError;
  
      // 2. Prepare the updated array
      const currentArray = data[columnName] || [];
      const updatedArray = [...currentArray, newMessage];
  
      // 3. Update the row using Supabase's JSON operator
      const { error: updateError } = await supabase
        .from('global_messages')
        .update({ [columnName]: updatedArray })
        .eq('id', rowId);
  
      if (updateError) throw updateError;
  
      return updatedArray;
    } catch (error) {
      console.error('Error appending message:', error);
      throw error;
    }
  };

// services/messageService.js
export const setupRealtimeUpdates = (callback) => {
    const subscription = supabase
      .channel('global_messages_changes')  // Important: Use same channel name
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'global_messages',
          filter: '*'  // Receive all inserts
        },
        (payload) => {
          // console.log('Realtime payload received:', payload); // Debug
          callback({
            eventType: 'INSERT',
            new: payload.new
          });
        }
      )
      .subscribe((status, err) => {
        // console.log('Subscription status:', status);
        if (err) console.error('Subscription error:', err);
      });
  
    return subscription;
  };