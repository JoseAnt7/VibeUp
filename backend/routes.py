import logging
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
from extensions import db
from models import Artist, User
from models import Song, Album, SongLike, SongPlay, Subscription, SongListenEvent, Event, EventAttendee, UserSongLike, UserSongPlay
from datetime import datetime, timedelta
from sqlalchemy import text, func
from functools import wraps

from sanitize_input import sanitize_email, sanitize_optional_url, sanitize_text
from mail import notifications as mail_notifications
from mail import settings as mail_settings

logger = logging.getLogger(__name__)

def artist_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())

        artist = Artist.query.filter_by(user_id=user_id).first()
        if not artist:
            return jsonify({'msg': 'Debes ser artista'}), 403

        return fn(*args, **kwargs)
    return wrapper


api_bp = Blueprint('api', __name__)

def get_client_ip():
    forwarded_for = request.headers.get('X-Forwarded-For', '')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.remote_addr or '0.0.0.0'


def parse_iso_datetime(value):
    if not value:
        return None
    s = value.strip()
    if s.endswith('Z'):
        s = s[:-1] + '+00:00'
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None


def _mail_event_image_url(img):
    if not img:
        return None
    s = str(img).strip()
    if s.startswith("http://") or s.startswith("https://"):
        return s
    base = mail_settings.APP_PUBLIC_URL.rstrip("/")
    return f"{base}/{s.lstrip('/')}"


def _fmt_event_dt(dt):
    if not dt:
        return "—"
    return dt.strftime("%d/%m/%Y, %H:%M UTC")


def _try_mail(action: str, fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
    except Exception:
        logger.exception("Fallo al enviar correo: %s", action)


def normalize_event_end_after_start(starts_at, ends_at):
    """
    Permite un evento que el mismo día calendario tiene hora de fin más tarde.
    Si la hora de fin es menor que la de inicio pero el día calendario coincide
    (p. ej. 21:00 → 00:00), se interpreta como fin al día siguiente a esa hora.
    """
    if not starts_at or not ends_at:
        return ends_at
    if ends_at > starts_at:
        return ends_at
    if ends_at < starts_at and starts_at.date() == ends_at.date():
        return ends_at + timedelta(days=1)
    return ends_at


def _serialize_public_event(ev, artist_name=None):
    if artist_name is None:
        ar = Artist.query.get(ev.artist_id)
        artist_name = ar.name if ar else ''
    return {
        **ev.to_dict(),
        'artist_name': artist_name,
        'attendee_count': ev.attendee_count(),
    }


@api_bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = sanitize_text(data.get('username'), 80)
    email = sanitize_email(data.get('email'))
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'msg': 'Faltan campos o el email no es válido'}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'msg': 'Usuario o email ya existe'}), 400

    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()

    _try_mail(
        "bienvenida",
        mail_notifications.send_registration_welcome,
        user.email,
        user.username,
    )

    return jsonify({'msg': 'Usuario creado', 'user': user.to_dict()}), 201

@api_bp.route('/api/user', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404

    data = request.get_json() or {}

    # 🔹 Actualizar username
    if 'username' in data:
        un = sanitize_text(data.get('username'), 80)
        if not un:
            return jsonify({'msg': 'Username no válido'}), 400
        if User.query.filter(User.username == un, User.id != user_id).first():
            return jsonify({'msg': 'Username ya en uso'}), 400
        user.username = un

    # 🔹 Actualizar email
    if 'email' in data:
        em = sanitize_email(data.get('email'))
        if not em:
            return jsonify({'msg': 'Email no válido'}), 400
        if User.query.filter(User.email == em, User.id != user_id).first():
            return jsonify({'msg': 'Email ya en uso'}), 400
        user.email = em

    # 🔹 Actualizar password
    password_changed = False
    if 'password' in data:
        user.password_hash = generate_password_hash(data['password'])
        password_changed = True

    db.session.commit()

    if password_changed:
        ua = (request.headers.get("User-Agent") or "—")[:240]
        _try_mail(
            "contraseña actualizada",
            mail_notifications.send_password_changed,
            user.email,
            user.username,
            device=ua,
            approx_location=get_client_ip(),
        )

    return jsonify({
        'msg': 'Usuario actualizado',
        'user': user.to_dict()
    })

@api_bp.route('/api/artists', methods=['POST'])
@jwt_required()
def create_artist():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    name = sanitize_text(data.get('name'), 200)
    if not name:
        return jsonify({'msg': 'Nombre obligatorio'}), 400
    raw_img = data.get('img')
    img = sanitize_optional_url(raw_img, 500) if raw_img not in (None, '') else None
    if raw_img not in (None, '') and img is None:
        return jsonify({'msg': 'URL de imagen no válida'}), 400

    artist = Artist(
        name=name,
        img=img,
        user_id=user_id
    )

    db.session.add(artist)
    db.session.commit()

    return jsonify({'artist': artist.to_dict()}), 201


@api_bp.route('/api/me/artist', methods=['GET'])
@jwt_required()
def my_artist():
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()

    return jsonify({
        "is_artist": artist is not None,
        "artist": artist.to_dict() if artist else None
    })


@api_bp.route('/api/me/channel-stats', methods=['GET'])
@jwt_required()
def my_channel_stats():
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()
    if not artist:
        return jsonify({'subscriber_count': 0})
    count = Subscription.query.filter_by(artist_id=artist.id).count()
    return jsonify({'subscriber_count': count})


@api_bp.route('/api/artists/<int:artist_id>/subscribe', methods=['POST'])
@jwt_required()
def subscribe_to_artist(artist_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.get(artist_id)
    if not artist:
        return jsonify({'msg': 'Artista no encontrado'}), 404
    if artist.user_id == user_id:
        return jsonify({'msg': 'No puedes suscribirte a tu propio canal'}), 400

    existing = Subscription.query.filter_by(user_id=user_id, artist_id=artist_id).first()
    if existing:
        count = Subscription.query.filter_by(artist_id=artist_id).count()
        return jsonify({'subscribed': True, 'subscriber_count': count}), 200

    db.session.add(Subscription(user_id=user_id, artist_id=artist_id))
    db.session.commit()
    count = Subscription.query.filter_by(artist_id=artist_id).count()
    return jsonify({'subscribed': True, 'subscriber_count': count}), 201


@api_bp.route('/api/artists/<int:artist_id>/subscribe', methods=['DELETE'])
@jwt_required()
def unsubscribe_from_artist(artist_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.get(artist_id)
    if not artist:
        return jsonify({'msg': 'Artista no encontrado'}), 404

    sub = Subscription.query.filter_by(user_id=user_id, artist_id=artist_id).first()
    if not sub:
        count = Subscription.query.filter_by(artist_id=artist_id).count()
        return jsonify({'subscribed': False, 'subscriber_count': count}), 200

    db.session.delete(sub)
    db.session.commit()
    count = Subscription.query.filter_by(artist_id=artist_id).count()
    return jsonify({'subscribed': False, 'subscriber_count': count}), 200


@api_bp.route('/api/artists/<int:artist_id>/subscribe/me', methods=['GET'])
@jwt_required()
def my_subscription_to_artist(artist_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.get(artist_id)
    if not artist:
        return jsonify({'msg': 'Artista no encontrado'}), 404

    sub = Subscription.query.filter_by(user_id=user_id, artist_id=artist_id).first()
    count = Subscription.query.filter_by(artist_id=artist_id).count()
    return jsonify({
        'subscribed': sub is not None,
        'subscriber_count': count
    })

@api_bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier_raw = data.get('username') or data.get('email')
    password = data.get('password')

    if not identifier_raw or not password:
        return jsonify({'msg': 'Faltan credenciales'}), 400

    em = sanitize_email(identifier_raw)
    identifier = em if em else sanitize_text(str(identifier_raw), 254)

    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'msg': 'Credenciales inválidas'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': access_token, 'user': user.to_dict()})


@api_bp.route('/api/validate-token', methods=['GET'])
@jwt_required()
def validate_token():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404
    return jsonify({'msg': 'Token válido', 'user': user.to_dict()})


@api_bp.route('/api/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'msg': 'Usuario no encontrado'}), 404
    return jsonify({'user': user.to_dict()})


@api_bp.route('/api/songs', methods=['POST'])
@jwt_required()
@artist_required
def create_song():
    user_id = int(get_jwt_identity())

    artist = Artist.query.filter_by(user_id=user_id).first()

    data = request.get_json() or {}
    category = sanitize_text(data.get('category'), 80)
    if not category:
        return jsonify({'msg': 'La categoría es obligatoria'}), 400

    title = sanitize_text(data.get('title'), 200)
    if not title:
        return jsonify({'msg': 'Título obligatorio'}), 400

    raw_url = data.get('url')
    url = sanitize_optional_url(raw_url, 500) if raw_url not in (None, '') else None
    if raw_url not in (None, '') and url is None:
        return jsonify({'msg': 'URL de audio no válida'}), 400
    raw_img = data.get('img')
    img = sanitize_optional_url(raw_img, 500) if raw_img not in (None, '') else None
    if raw_img not in (None, '') and img is None:
        return jsonify({'msg': 'URL de imagen no válida'}), 400

    song = Song(
        title=title,
        url=url,
        img=img,
        duration=data.get('duration'),
        category=category,
        artist_id=artist.id
    )

    db.session.add(song)
    db.session.commit()

    return jsonify({'song': song.to_dict()}), 201


@api_bp.route('/api/songs/<int:song_id>', methods=['PUT'])
@jwt_required()
@artist_required
def update_song(song_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()

    song = Song.query.get(song_id)
    if not song:
        return jsonify({'msg': 'Canción no encontrada'}), 404
    if song.artist_id != artist.id:
        return jsonify({'msg': 'No tienes permiso para editar esta canción'}), 403

    data = request.get_json() or {}

    if 'title' in data:
        title = sanitize_text(data.get('title'), 200)
        if not title:
            return jsonify({'msg': 'Título obligatorio'}), 400
        song.title = title

    if 'duration' in data:
        song.duration = data.get('duration')

    if 'category' in data:
        category = sanitize_text(data.get('category'), 80)
        if not category:
            return jsonify({'msg': 'La categoría es obligatoria'}), 400
        song.category = category

    if 'img' in data:
        raw_img = data.get('img')
        img = sanitize_optional_url(raw_img, 500) if raw_img not in (None, '') else None
        if raw_img not in (None, '') and img is None:
            return jsonify({'msg': 'URL de imagen no válida'}), 400
        song.img = img

    if 'url' in data:
        raw_url = data.get('url')
        url = sanitize_optional_url(raw_url, 500) if raw_url not in (None, '') else None
        if raw_url not in (None, '') and url is None:
            return jsonify({'msg': 'URL de audio no válida'}), 400
        song.url = url

    db.session.commit()
    return jsonify({'song': song.to_dict()}), 200


@api_bp.route('/api/songs/<int:song_id>', methods=['DELETE'])
@jwt_required()
@artist_required
def delete_song(song_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()

    song = Song.query.get(song_id)
    if not song:
        return jsonify({'msg': 'Canción no encontrada'}), 404
    if song.artist_id != artist.id:
        return jsonify({'msg': 'No tienes permiso para borrar esta canción'}), 403

    db.session.delete(song)
    db.session.commit()
    return jsonify({'deleted': True}), 200


@api_bp.route('/api/albums', methods=['POST'])
@jwt_required()
@artist_required
def create_album():
    user_id = int(get_jwt_identity())

    artist = Artist.query.filter_by(user_id=user_id).first()
    data = request.get_json() or {}

    title = sanitize_text(data.get('title'), 200)
    if not title:
        return jsonify({'msg': 'Título obligatorio'}), 400
    raw_img = data.get('img')
    img = sanitize_optional_url(raw_img, 200) if raw_img not in (None, '') else None
    if raw_img not in (None, '') and img is None:
        return jsonify({'msg': 'URL de imagen no válida'}), 400

    album = Album(
        title=title,
        img=img,
        artist_id=artist.id
    )

    song_ids = data.get('song_ids', [])

    if song_ids:
        songs = Song.query.filter(Song.id.in_(song_ids)).all()
        for s in songs:
            album.songs.append(s)

    db.session.add(album)
    db.session.commit()

    return jsonify({'album': album.to_dict()}), 201


@api_bp.route('/api/albums/<int:album_id>', methods=['PUT'])
@jwt_required()
@artist_required
def update_album(album_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()

    album = Album.query.get(album_id)
    if not album:
        return jsonify({'msg': 'Álbum no encontrado'}), 404
    if album.artist_id != artist.id:
        return jsonify({'msg': 'No tienes permiso para editar este álbum'}), 403

    data = request.get_json() or {}

    if 'title' in data:
        title = sanitize_text(data.get('title'), 200)
        if not title:
            return jsonify({'msg': 'Título obligatorio'}), 400
        album.title = title

    if 'img' in data:
        raw_img = data.get('img')
        img = sanitize_optional_url(raw_img, 200) if raw_img not in (None, '') else None
        if raw_img not in (None, '') and img is None:
            return jsonify({'msg': 'URL de imagen no válida'}), 400
        album.img = img

    if 'song_ids' in data:
        song_ids = data.get('song_ids') or []
        songs = Song.query.filter(
            Song.id.in_(song_ids),
            Song.artist_id == artist.id
        ).all() if song_ids else []

        album.songs = []
        for s in songs:
            album.songs.append(s)

    db.session.commit()
    return jsonify({'album': album.to_dict()}), 200


@api_bp.route('/api/albums/<int:album_id>', methods=['DELETE'])
@jwt_required()
@artist_required
def delete_album(album_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()

    album = Album.query.get(album_id)
    if not album:
        return jsonify({'msg': 'Álbum no encontrado'}), 404
    if album.artist_id != artist.id:
        return jsonify({'msg': 'No tienes permiso para borrar este álbum'}), 403

    db.session.delete(album)
    db.session.commit()
    return jsonify({'deleted': True}), 200


@api_bp.route('/api/songs', methods=['GET'])
@jwt_required()
def list_songs():
    user_id = int(get_jwt_identity())

    artist = Artist.query.filter_by(user_id=user_id).first()
    if not artist:
        return jsonify({'songs': []})

    songs = Song.query.filter_by(artist_id=artist.id).all()

    return jsonify({'songs': [s.to_dict() for s in songs]})

@api_bp.route('/api/public/songs', methods=['GET'])
def list_public_songs():
    songs = Song.query.all()
    return jsonify({'songs': [s.to_dict() for s in songs]})


@api_bp.route('/api/public/songs/<int:song_id>/like', methods=['POST'])
def like_public_song(song_id):
    song = Song.query.get(song_id)
    if not song:
        return jsonify({'msg': 'Canción no encontrada'}), 404

    verify_jwt_in_request(optional=True)
    user_id = get_jwt_identity()

    if user_id is not None:
        user_id = int(user_id)
        already_liked = UserSongLike.query.filter_by(song_id=song.id, user_id=user_id).first()
        if already_liked:
            return jsonify({'liked': False, 'likes': song.likes, 'msg': 'Ya diste like con tu usuario'}), 200
        db.session.add(UserSongLike(song_id=song.id, user_id=user_id))
    else:
        ip_address = get_client_ip()
        already_liked = SongLike.query.filter_by(song_id=song.id, ip_address=ip_address).first()
        if already_liked:
            return jsonify({'liked': False, 'likes': song.likes, 'msg': 'Ya diste like desde esta IP'}), 200
        db.session.add(SongLike(song_id=song.id, ip_address=ip_address))

    song.likes = (song.likes or 0) + 1
    db.session.commit()
    return jsonify({'liked': True, 'likes': song.likes}), 200

@api_bp.route('/api/public/songs/<int:song_id>/play', methods=['POST'])
def register_public_song_play(song_id):
    song = Song.query.get(song_id)
    if not song:
        return jsonify({'msg': 'Canción no encontrada'}), 404

    verify_jwt_in_request(optional=True)
    user_id = get_jwt_identity()

    if user_id is not None:
        user_id = int(user_id)
        existing_play = UserSongPlay.query.filter_by(song_id=song.id, user_id=user_id).first()
        if existing_play:
            return jsonify({'counted': False, 'plays': song.plays}), 200
        db.session.add(UserSongPlay(song_id=song.id, user_id=user_id))
    else:
        ip_address = get_client_ip()
        existing_play = SongPlay.query.filter_by(song_id=song.id, ip_address=ip_address).first()
        if existing_play:
            return jsonify({'counted': False, 'plays': song.plays}), 200
        db.session.add(SongPlay(song_id=song.id, ip_address=ip_address))

    song.plays = (song.plays or 0) + 1
    db.session.commit()
    return jsonify({'counted': True, 'plays': song.plays}), 200

@api_bp.route('/api/public/songs/<int:song_id>/listen', methods=['POST'])
def register_public_song_listen_time(song_id):
    song = Song.query.get(song_id)
    if not song:
        return jsonify({'msg': 'Canción no encontrada'}), 404

    data = request.get_json() or {}
    listened_seconds = data.get('listened_seconds')
    try:
        listened_seconds = float(listened_seconds)
    except (TypeError, ValueError):
        return jsonify({'msg': 'Tiempo de reproducción inválido'}), 400

    if listened_seconds <= 0:
        return jsonify({'msg': 'Tiempo de reproducción inválido'}), 400

    listened_seconds = min(listened_seconds, 60 * 60 * 10)
    song.total_listen_seconds = (song.total_listen_seconds or 0) + listened_seconds
    song.listen_events = (song.listen_events or 0) + 1
    db.session.add(SongListenEvent(song_id=song.id, ip_address=get_client_ip(), listened_seconds=listened_seconds))
    db.session.commit()

    avg = round(song.total_listen_seconds / song.listen_events, 2) if song.listen_events else 0
    return jsonify({'ok': True, 'avg_listen_seconds': avg}), 200


@api_bp.route('/api/me/analytics', methods=['GET'])
@jwt_required()
@artist_required
def my_analytics():
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()
    days = request.args.get('days', 28)
    try:
        days = int(days)
    except ValueError:
        days = 28
    days = max(7, min(days, 90))

    today = datetime.utcnow().date()
    start_date = today - timedelta(days=days - 1)
    start_dt = datetime.combine(start_date, datetime.min.time())

    date_list = [(start_date + timedelta(days=i)).isoformat() for i in range(days)]
    idx = {d: i for i, d in enumerate(date_list)}

    views = [0] * days
    subs = [0] * days
    avg_listen = [0] * days
    total_listen_seconds = 0.0

    # Views (plays) per day: visitantes por IP + usuarios por cuenta
    play_rows = db.session.execute(text("""
        SELECT strftime('%Y-%m-%d', sp.created_at) AS day, COUNT(*) AS c
        FROM song_plays sp
        JOIN songs s ON s.id = sp.song_id
        WHERE s.artist_id = :artist_id AND sp.created_at >= :start_dt
        GROUP BY day
    """), {"artist_id": artist.id, "start_dt": start_dt}).fetchall()
    for day, c in play_rows:
        if day in idx:
            views[idx[day]] = int(c or 0)

    user_play_rows = db.session.execute(text("""
        SELECT strftime('%Y-%m-%d', usp.created_at) AS day, COUNT(*) AS c
        FROM user_song_plays usp
        JOIN songs s ON s.id = usp.song_id
        WHERE s.artist_id = :artist_id AND usp.created_at >= :start_dt
        GROUP BY day
    """), {"artist_id": artist.id, "start_dt": start_dt}).fetchall()
    for day, c in user_play_rows:
        if day in idx:
            views[idx[day]] += int(c or 0)

    # Subs per day
    sub_rows = db.session.execute(text("""
        SELECT strftime('%Y-%m-%d', created_at) AS day, COUNT(*) AS c
        FROM subscriptions
        WHERE artist_id = :artist_id AND created_at >= :start_dt
        GROUP BY day
    """), {"artist_id": artist.id, "start_dt": start_dt}).fetchall()
    for day, c in sub_rows:
        if day in idx:
            subs[idx[day]] = int(c or 0)

    # Avg listen seconds per day (average of listen events)
    listen_rows = db.session.execute(text("""
        SELECT strftime('%Y-%m-%d', created_at) AS day, AVG(listened_seconds) AS a
        FROM song_listen_events
        WHERE song_id IN (SELECT id FROM songs WHERE artist_id = :artist_id)
          AND created_at >= :start_dt
        GROUP BY day
    """), {"artist_id": artist.id, "start_dt": start_dt}).fetchall()
    for day, a in listen_rows:
        if day in idx:
            avg_listen[idx[day]] = round(float(a or 0), 2)

    total_listen_row = db.session.execute(text("""
        SELECT COALESCE(SUM(listened_seconds), 0)
        FROM song_listen_events
        WHERE song_id IN (SELECT id FROM songs WHERE artist_id = :artist_id)
          AND created_at >= :start_dt
    """), {"artist_id": artist.id, "start_dt": start_dt}).fetchone()
    total_listen_seconds = float(total_listen_row[0] or 0)

    max_views = max(views) if views else 0
    total_views = int(sum(views))
    total_subs = int(sum(subs))

    return jsonify({
        "range_days": days,
        "dates": date_list,
        "views": views,
        "avg_listen_seconds": avg_listen,
        "subs": subs,
        "max_views": max_views,
        "total_views": total_views,
        "total_subs": total_subs,
        "total_listen_seconds": round(total_listen_seconds, 2)
    })


@api_bp.route('/api/me/analytics/week-summary', methods=['GET'])
@jwt_required()
@artist_required
def my_analytics_week_summary():
    """Métricas de la semana calendario actual (lunes 00:00 UTC – domingo inclusive). Cambia al iniciarse la nueva semana."""
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()

    today = datetime.utcnow().date()
    week_start = today - timedelta(days=today.weekday())
    week_end_inclusive = week_start + timedelta(days=6)
    week_start_dt = datetime.combine(week_start, datetime.min.time())
    week_end_exclusive = week_start + timedelta(days=7)
    week_end_dt = datetime.combine(week_end_exclusive, datetime.min.time())

    plays_ip = (
        db.session.query(func.count(SongPlay.id))
        .join(Song, SongPlay.song_id == Song.id)
        .filter(
            Song.artist_id == artist.id,
            SongPlay.created_at >= week_start_dt,
            SongPlay.created_at < week_end_dt,
        )
        .scalar()
    )
    plays_ip = int(plays_ip or 0)

    plays_user = (
        db.session.query(func.count(UserSongPlay.id))
        .join(Song, UserSongPlay.song_id == Song.id)
        .filter(
            Song.artist_id == artist.id,
            UserSongPlay.created_at >= week_start_dt,
            UserSongPlay.created_at < week_end_dt,
        )
        .scalar()
    )
    plays_user = int(plays_user or 0)
    plays = plays_ip + plays_user

    listen_count = (
        db.session.query(func.count(SongListenEvent.id))
        .join(Song, SongListenEvent.song_id == Song.id)
        .filter(
            Song.artist_id == artist.id,
            SongListenEvent.created_at >= week_start_dt,
            SongListenEvent.created_at < week_end_dt,
        )
        .scalar()
    )
    listen_count = int(listen_count or 0)

    avg_listen_seconds = None
    if listen_count:
        avg_row = (
            db.session.query(func.avg(SongListenEvent.listened_seconds))
            .join(Song, SongListenEvent.song_id == Song.id)
            .filter(
                Song.artist_id == artist.id,
                SongListenEvent.created_at >= week_start_dt,
                SongListenEvent.created_at < week_end_dt,
            )
            .scalar()
        )
        avg_listen_seconds = round(float(avg_row or 0), 2)

    new_subscriptions = (
        db.session.query(func.count(Subscription.id))
        .filter(
            Subscription.artist_id == artist.id,
            Subscription.created_at >= week_start_dt,
            Subscription.created_at < week_end_dt,
        )
        .scalar()
    )
    new_subscriptions = int(new_subscriptions or 0)

    return jsonify({
        "week_start": week_start.isoformat(),
        "week_end": week_end_inclusive.isoformat(),
        "plays": plays,
        "avg_listen_seconds": avg_listen_seconds,
        "new_subscriptions": new_subscriptions,
        "listen_events_count": listen_count,
    })

@api_bp.route('/api/public/albums', methods=['GET'])
def list_public_albums():
    albums = Album.query.all()
    return jsonify({'albums': [a.to_dict() for a in albums]})

@api_bp.route('/api/public/albums-with-songs', methods=['GET'])
def list_public_albums_with_songs():
    albums = Album.query.all()
    albums_data = []

    for album in albums:
        artist = Artist.query.get(album.artist_id)
        albums_data.append({
            **album.to_dict(),
            "artist_name": artist.name if artist else "Artista desconocido",
            "songs": [song.to_dict() for song in album.songs]
        })

    return jsonify({'albums': albums_data})

@api_bp.route('/api/public/artists-with-songs', methods=['GET'])
def get_artists_with_songs():
    artists = Artist.query.join(Song).distinct().all()

    return jsonify({
        "artists": [a.to_dict() for a in artists]
    })

@api_bp.route('/api/public/artist/<path:artist_name>', methods=['GET'])
def get_public_artist_profile(artist_name):
    artist = Artist.query.filter(Artist.name.ilike(artist_name)).first()
    if not artist:
        return jsonify({'msg': 'Artista no encontrado'}), 404

    songs = Song.query.filter_by(artist_id=artist.id).all()
    albums = Album.query.filter_by(artist_id=artist.id).all()

    albums_data = []
    for album in albums:
        albums_data.append({
            **album.to_dict(),
            "artist_name": artist.name,
            "songs": [song.to_dict() for song in album.songs]
        })

    subscriber_count = Subscription.query.filter_by(artist_id=artist.id).count()

    evs = Event.query.filter_by(artist_id=artist.id).order_by(Event.starts_at.desc()).all()
    events_data = [_serialize_public_event(e, artist.name) for e in evs]

    return jsonify({
        "artist": artist.to_dict(),
        "subscriber_count": subscriber_count,
        "songs": [song.to_dict() for song in songs],
        "albums": albums_data,
        "events": events_data,
    })


@api_bp.route('/api/public/events', methods=['GET'])
def list_public_events():
    events = Event.query.order_by(Event.starts_at.asc()).all()
    out = []
    for ev in events:
        ar = Artist.query.get(ev.artist_id)
        out.append(_serialize_public_event(ev, ar.name if ar else ''))
    return jsonify({'events': out})


@api_bp.route('/api/public/events/<int:event_id>', methods=['GET'])
@jwt_required(optional=True)
def get_public_event(event_id):
    ev = Event.query.get(event_id)
    if not ev:
        return jsonify({'msg': 'Evento no encontrado'}), 404
    ar = Artist.query.get(ev.artist_id)
    data = _serialize_public_event(ev, ar.name if ar else '')
    uid = get_jwt_identity()
    data['is_attending'] = False
    if uid is not None:
        uid = int(uid)
        data['is_attending'] = EventAttendee.query.filter_by(event_id=ev.id, user_id=uid).first() is not None
    return jsonify({'event': data})


@api_bp.route('/api/public/events/<int:event_id>/attend', methods=['POST'])
@jwt_required()
def attend_event(event_id):
    user_id = int(get_jwt_identity())
    ev = Event.query.get(event_id)
    if not ev:
        return jsonify({'msg': 'Evento no encontrado'}), 404
    artist = Artist.query.get(ev.artist_id)
    if artist and artist.user_id == user_id:
        return jsonify({'msg': 'No puedes apuntarte a tu propio evento'}), 400
    existing = EventAttendee.query.filter_by(event_id=event_id, user_id=user_id).first()
    if existing:
        return jsonify({
            'msg': 'Ya estás apuntado',
            'attendee_count': ev.attendee_count(),
            'attending': True,
        }), 200
    db.session.add(EventAttendee(event_id=event_id, user_id=user_id))
    db.session.commit()

    user = User.query.get(user_id)
    artist = Artist.query.get(ev.artist_id) if ev else None
    now = datetime.utcnow()
    row = EventAttendee.query.filter_by(event_id=event_id, user_id=user_id).first()
    if user and artist:
        _try_mail(
            "confirmación RSVP",
            mail_notifications.send_event_rsvp_confirmation,
            user.email,
            user.username,
            ev.title,
            artist.name,
            ev.location,
            _fmt_event_dt(ev.starts_at),
            _fmt_event_dt(ev.ends_at),
            ev.attendee_count(),
            _fmt_event_dt(row.created_at if row else now),
            _mail_event_image_url(ev.img),
        )

    return jsonify({
        'msg': 'Te has apuntado al evento',
        'attendee_count': ev.attendee_count(),
        'attending': True,
    }), 201


@api_bp.route('/api/public/events/<int:event_id>/attend', methods=['DELETE'])
@jwt_required()
def unattend_event(event_id):
    user_id = int(get_jwt_identity())
    ev = Event.query.get(event_id)
    if not ev:
        return jsonify({'msg': 'Evento no encontrado'}), 404
    row = EventAttendee.query.filter_by(event_id=event_id, user_id=user_id).first()
    if not row:
        return jsonify({'msg': 'No estabas apuntado', 'attendee_count': ev.attendee_count(), 'attending': False}), 200
    db.session.delete(row)
    db.session.commit()
    return jsonify({
        'msg': 'Has cancelado tu asistencia',
        'attendee_count': ev.attendee_count(),
        'attending': False,
    }), 200


@api_bp.route('/api/me/events', methods=['GET'])
@jwt_required()
@artist_required
def list_my_events():
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()
    events = Event.query.filter_by(artist_id=artist.id).order_by(Event.starts_at.desc()).all()
    return jsonify({
        'events': [{**e.to_dict(), 'attendee_count': e.attendee_count()} for e in events]
    })


@api_bp.route('/api/me/events', methods=['POST'])
@jwt_required()
@artist_required
def create_my_event():
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()
    data = request.get_json() or {}
    title = sanitize_text(data.get('title'), 300)
    location = sanitize_text(data.get('location'), 500)
    description = sanitize_text(data.get('description'), 10_000)
    raw_img = data.get('img')
    img = sanitize_optional_url(raw_img, 500) if raw_img not in (None, '') else None
    if raw_img not in (None, '') and img is None:
        return jsonify({'msg': 'URL de imagen no válida'}), 400
    starts_at = parse_iso_datetime(data.get('starts_at'))
    ends_at = parse_iso_datetime(data.get('ends_at'))
    if not title or not location or not starts_at or not ends_at:
        return jsonify({'msg': 'Faltan campos obligatorios (título, ubicación, inicio y fin)'}), 400
    ends_at = normalize_event_end_after_start(starts_at, ends_at)
    if ends_at <= starts_at:
        return jsonify({'msg': 'La hora de fin debe ser posterior a la de inicio (mismo u otro día).'}), 400
    ev = Event(
        title=title,
        description=description,
        img=img,
        location=location,
        starts_at=starts_at,
        ends_at=ends_at,
        artist_id=artist.id,
    )
    db.session.add(ev)
    db.session.commit()
    return jsonify({'event': {**ev.to_dict(), 'attendee_count': 0}}), 201


@api_bp.route('/api/me/events/<int:event_id>', methods=['PUT'])
@jwt_required()
@artist_required
def update_my_event(event_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()
    ev = Event.query.get(event_id)
    if not ev or ev.artist_id != artist.id:
        return jsonify({'msg': 'Evento no encontrado'}), 404
    data = request.get_json() or {}
    if 'title' in data:
        t = sanitize_text(data.get('title'), 300)
        ev.title = t or ev.title
    if 'description' in data:
        ev.description = sanitize_text(data.get('description'), 10_000)
    if 'location' in data:
        loc = sanitize_text(data.get('location'), 500)
        ev.location = loc or ev.location
    if 'img' in data:
        raw_img = data.get('img')
        im = sanitize_optional_url(raw_img, 500) if raw_img not in (None, '') else None
        if raw_img not in (None, '') and im is None:
            return jsonify({'msg': 'URL de imagen no válida'}), 400
        ev.img = im
    if 'starts_at' in data:
        dt = parse_iso_datetime(data.get('starts_at'))
        if dt:
            ev.starts_at = dt
    if 'ends_at' in data:
        dt = parse_iso_datetime(data.get('ends_at'))
        if dt:
            ev.ends_at = dt
    ev.ends_at = normalize_event_end_after_start(ev.starts_at, ev.ends_at)
    if ev.ends_at <= ev.starts_at:
        return jsonify({'msg': 'La hora de fin debe ser posterior a la de inicio (mismo u otro día).'}), 400
    db.session.commit()
    return jsonify({'event': {**ev.to_dict(), 'attendee_count': ev.attendee_count()}})


@api_bp.route('/api/me/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
@artist_required
def delete_my_event(event_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()
    ev = Event.query.get(event_id)
    if not ev or ev.artist_id != artist.id:
        return jsonify({'msg': 'Evento no encontrado'}), 404
    db.session.delete(ev)
    db.session.commit()
    return jsonify({'msg': 'Evento eliminado'})


@api_bp.route('/api/me/events/<int:event_id>/attendees', methods=['GET'])
@jwt_required()
@artist_required
def list_event_attendees(event_id):
    user_id = int(get_jwt_identity())
    artist = Artist.query.filter_by(user_id=user_id).first()
    ev = Event.query.get(event_id)
    if not ev or ev.artist_id != artist.id:
        return jsonify({'msg': 'Evento no encontrado'}), 404
    rows = db.session.query(EventAttendee, User).join(
        User, EventAttendee.user_id == User.id
    ).filter(EventAttendee.event_id == event_id).order_by(EventAttendee.created_at.asc()).all()
    attendees = [{'user_id': u.id, 'username': u.username} for _, u in rows]
    return jsonify({
        'event': {**ev.to_dict(), 'attendee_count': len(attendees)},
        'attendees': attendees,
        'total': len(attendees),
    })


@api_bp.route('/api/albums', methods=['GET'])
@jwt_required()
def list_albums():
    user_id = int(get_jwt_identity())

    artist = Artist.query.filter_by(user_id=user_id).first()
    if not artist:
        return jsonify({'albums': []})

    albums = Album.query.filter_by(artist_id=artist.id).all()

    return jsonify({'albums': [a.to_dict() for a in albums]})


@api_bp.route('/api/albums/<int:album_id>/songs', methods=['POST'])
@jwt_required()
@artist_required
def add_songs_to_album(album_id):
    user_id = int(get_jwt_identity())

    # 🔹 Obtener artista del usuario
    artist = Artist.query.filter_by(user_id=user_id).first()

    # 🔹 Obtener álbum
    album = Album.query.get(album_id)
    if not album:
        return jsonify({'msg': 'Álbum no encontrado'}), 404

    # 🔐 Seguridad: el álbum debe ser del artista
    if album.artist_id != artist.id:
        return jsonify({'msg': 'No tienes permiso para modificar este álbum'}), 403

    data = request.get_json() or {}
    song_ids = data.get('song_ids', [])

    if not song_ids:
        return jsonify({'msg': 'No se han proporcionado canciones'}), 400

    # 🔹 Obtener canciones válidas del artista
    songs = Song.query.filter(
        Song.id.in_(song_ids),
        Song.artist_id == artist.id
    ).all()

    if not songs:
        return jsonify({'msg': 'No se encontraron canciones válidas'}), 404

    # 🔹 Añadir canciones al álbum (evitando duplicados)
    for song in songs:
        if song not in album.songs:
            album.songs.append(song)

    db.session.commit()

    return jsonify({
        'msg': 'Canciones añadidas al álbum',
        'album': album.to_dict(),
        'songs_added': [s.to_dict() for s in songs]
    }), 200
