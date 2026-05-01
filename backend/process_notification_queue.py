from app.services.notification_service import process_pending_email_notifications


if __name__ == '__main__':
    results = process_pending_email_notifications()
    print({'processed': results, 'count': len(results)})
