class NotificationService {
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.error("This browser does not support desktop notification");
      return "denied";
    }
    return Notification.requestPermission();
  }

  sendNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission === 'default') {
      console.log('User has not granted or denied notification permission yet.');
    }
  }
}

export const notificationService = new NotificationService();