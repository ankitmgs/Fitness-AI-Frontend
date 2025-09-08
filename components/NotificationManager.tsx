import React, { useEffect } from 'react';
import { useData } from '../hooks/useData';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

// This component is a "manager" that handles app-wide effects like notifications.
// It doesn't render any UI.
const NotificationManager: React.FC = () => {
    const { user } = useAuth();
    const { profile } = useData();

    // Water Reminder Effect
    useEffect(() => {
        if (!profile || !profile.reminderSettings.water.enabled) {
            return; // Exit if no profile or water reminders are disabled
        }

        const frequencyInMs = profile.reminderSettings.water.frequency * 60 * 1000;
        
        // Interval to check if a reminder should be sent
        const intervalId = setInterval(() => {
            const now = new Date();
            const currentHour = now.getHours();
            
            // Only send reminders during typical waking hours (e.g., 8 AM to 10 PM)
            if (currentHour < 8 || currentHour > 22) {
                return;
            }
            
            const lastWaterReminderKey = `lastWaterReminder_${user?.uid}`;
            const lastReminderTimestamp = sessionStorage.getItem(lastWaterReminderKey);

            if (!lastReminderTimestamp) {
                // If no reminder has been sent this session, send one and set the timestamp.
                notificationService.sendNotification("💧 Time to Hydrate!", { body: `Don't forget to drink some water.` });
                sessionStorage.setItem(lastWaterReminderKey, Date.now().toString());
            } else {
                const timeSinceLastReminder = Date.now() - parseInt(lastReminderTimestamp, 10);
                if (timeSinceLastReminder > frequencyInMs) {
                    notificationService.sendNotification("💧 Time to Hydrate!", { body: `Don't forget to drink some water.` });
                    sessionStorage.setItem(lastWaterReminderKey, Date.now().toString());
                }
            }
        // Check every 5 minutes to be efficient but responsive enough
        }, 5 * 60 * 1000); 

        // Cleanup function to clear the interval when the component unmounts or settings change
        return () => clearInterval(intervalId);

    }, [profile, user?.uid]);

    return null; // This component doesn't render anything
}

export default NotificationManager;