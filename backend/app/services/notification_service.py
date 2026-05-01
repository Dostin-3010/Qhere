import os
import smtplib
from email.message import EmailMessage
from datetime import datetime

from ..supabase_client import get_supabase_client


supabase = get_supabase_client()


def _smtp_settings():
    host = os.getenv('SMTP_HOST')
    port = int(os.getenv('SMTP_PORT', '587'))
    username = os.getenv('SMTP_USERNAME')
    password = os.getenv('SMTP_PASSWORD')
    sender = os.getenv('SMTP_FROM_EMAIL')
    use_tls = os.getenv('SMTP_USE_TLS', 'True').lower() == 'true'

    if not host or not sender:
        raise RuntimeError('Faltan SMTP_HOST o SMTP_FROM_EMAIL para enviar notificaciones.')

    return {
        'host': host,
        'port': port,
        'username': username,
        'password': password,
        'sender': sender,
        'use_tls': use_tls,
    }


def _get_pending_email_notifications(limit=20):
    result = (
        supabase.table('notification_queue')
        .select('*')
        .eq('channel', 'email')
        .eq('status', 'pending')
        .order('priority', desc=False)
        .order('created_at', desc=False)
        .limit(limit)
        .execute()
    )
    return result.data or []


def _get_profile(profile_id):
    result = (
        supabase.table('profiles')
        .select('id, email, full_name')
        .eq('id', profile_id)
        .limit(1)
        .execute()
    )
    rows = result.data or []
    return rows[0] if rows else None


def _get_profile_by_email(email):
    if not email:
        return None

    result = (
        supabase.table('profiles')
        .select('id, email, full_name')
        .eq('email', str(email).strip().lower())
        .limit(1)
        .execute()
    )
    rows = result.data or []
    return rows[0] if rows else None


def _mark_processing(notification_id):
    supabase.table('notification_queue').update({
        'status': 'processing',
        'locked_at': datetime.utcnow().isoformat(),
    }).eq('id', notification_id).execute()


def _mark_sent(notification_id, attempt_count):
    supabase.table('notification_queue').update({
        'status': 'sent',
        'attempt_count': attempt_count,
        'sent_at': datetime.utcnow().isoformat(),
        'error_message': None,
    }).eq('id', notification_id).execute()


def _mark_failed(notification_id, attempt_count, error_message):
    supabase.table('notification_queue').update({
        'status': 'failed',
        'attempt_count': attempt_count,
        'failed_at': datetime.utcnow().isoformat(),
        'error_message': error_message[:500],
    }).eq('id', notification_id).execute()


def _build_message(notification, recipient, sender):
    payload = notification.get('payload') or {}
    student_name = payload.get('student_name') or 'Estudiante'
    body = payload.get('message') or payload.get('body') or ''
    school_name = payload.get('school_name') or 'QHERE'

    message = EmailMessage()
    message['Subject'] = notification.get('subject') or f'Notificacion de asistencia - {student_name}'
    message['From'] = sender
    message['To'] = recipient['email']
    message.set_content(
        '\n'.join([
            f'Hola {recipient.get("full_name") or "usuario"},',
            '',
            body or 'Tienes una nueva notificacion relacionada con asistencia escolar.',
            '',
            f'Estudiante: {student_name}',
            f'Sistema: {school_name}',
        ])
    )
    return message


def _send_message(message, settings):
    with smtplib.SMTP(settings['host'], settings['port']) as smtp:
        smtp.ehlo()
        if settings['use_tls']:
            smtp.starttls()
            smtp.ehlo()
        if settings['username']:
            smtp.login(settings['username'], settings['password'] or '')
        smtp.send_message(message)


def queue_panel_notification(recipient_email, subject, body_lines, payload=None):
    recipient = _get_profile_by_email(recipient_email)
    queue_payload = {
        'subject': subject,
        'body': '\n'.join(body_lines),
        'message': '\n'.join(body_lines),
        'recipient_email': recipient_email,
        **(payload or {}),
    }

    result = supabase.table('notification_queue').insert({
        'recipient_id': recipient.get('id') if recipient else None,
        'channel': 'panel',
        'subject': subject,
        'payload': queue_payload,
        'priority': 1,
        'status': 'pending',
        'scheduled_for': datetime.utcnow().isoformat(),
    }).execute()

    rows = result.data or []
    return rows[0] if rows else {'subject': subject, 'recipient_email': recipient_email}


def send_direct_email(recipient_email, subject, body_lines):
    try:
        settings = _smtp_settings()
        message = EmailMessage()
        message['Subject'] = subject
        message['From'] = settings['sender']
        message['To'] = recipient_email
        message.set_content('\n'.join(body_lines))
        _send_message(message, settings)
        return {'channel': 'email', 'recipient_email': recipient_email, 'subject': subject}
    except Exception as exc:
        queued = queue_panel_notification(
            recipient_email,
            subject,
            body_lines,
            payload={
                'fallback_reason': str(exc),
                'delivery': 'panel',
            },
        )
        return {
            'channel': 'panel',
            'recipient_email': recipient_email,
            'subject': subject,
            'queued': queued,
            'fallback_reason': str(exc),
        }


def process_pending_email_notifications(limit=20):
    settings = _smtp_settings()
    pending = _get_pending_email_notifications(limit=limit)
    processed = []

    for notification in pending:
        attempt_count = int(notification.get('attempt_count') or 0) + 1
        notification_id = notification['id']
        recipient = _get_profile(notification.get('recipient_id'))

        _mark_processing(notification_id)

        try:
            if not recipient or not recipient.get('email'):
                raise RuntimeError('El destinatario no tiene correo electronico disponible.')

            message = _build_message(notification, recipient, settings['sender'])
            _send_message(message, settings)
            _mark_sent(notification_id, attempt_count)
            processed.append({
                'id': notification_id,
                'status': 'sent',
                'recipient': recipient['email'],
            })
        except Exception as exc:
            _mark_failed(notification_id, attempt_count, str(exc))
            processed.append({
                'id': notification_id,
                'status': 'failed',
                'error': str(exc),
            })

    return processed
