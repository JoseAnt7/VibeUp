from extensions import db
from datetime import datetime

# TABLA INTERMEDIA ALBUM - SONGS
album_songs = db.Table(
    'album_songs',
    db.Column('album_id', db.Integer, db.ForeignKey('albums.id'), primary_key=True),
    db.Column('song_id', db.Integer, db.ForeignKey('songs.id'), primary_key=True)
)

# TABLA INTERMEDIA PLAYLIST - SONGS
playlist_songs = db.Table(
    'playlist_songs',
    db.Column('playlist_id', db.Integer, db.ForeignKey('playlists.id'), primary_key=True),
    db.Column('song_id', db.Integer, db.ForeignKey('songs.id'), primary_key=True)
)


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 🔥 Relación con artistas
    artists = db.relationship('Artist', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat()
        }


class Artist(db.Model):
    __tablename__ = 'artists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    img = db.Column(db.String(500))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # 🔥 Relación con canciones
    songs = db.relationship('Song', backref='artist', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "img": self.img,
            "user_id": self.user_id
        }

    def subscriber_count(self):
        return Subscription.query.filter_by(artist_id=self.id).count()


class Subscription(db.Model):
    __tablename__ = 'subscriptions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    artist_id = db.Column(db.Integer, db.ForeignKey('artists.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'artist_id', name='uq_user_artist_subscription'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'artist_id': self.artist_id,
            'created_at': self.created_at.isoformat()
        }


class Song(db.Model):
    __tablename__ = 'songs'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    duration = db.Column(db.Integer)
    category = db.Column(db.String(80))
    url = db.Column(db.String(500))
    img = db.Column(db.String(500))
    likes = db.Column(db.Integer, default=0, nullable=False)
    plays = db.Column(db.Integer, default=0, nullable=False)
    total_listen_seconds = db.Column(db.Float, default=0, nullable=False)
    listen_events = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 🔥 CAMBIO IMPORTANTE
    artist_id = db.Column(db.Integer, db.ForeignKey('artists.id'), nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "duration": self.duration,
            "category": self.category,
            "url": self.url,
            "img": self.img,
            "likes": self.likes,
            "plays": self.plays,
            "avg_listen_seconds": round(self.total_listen_seconds / self.listen_events, 2) if self.listen_events else 0,
            "artist_id": self.artist_id
        }


class Album(db.Model):
    __tablename__ = 'albums'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    img = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    artist_id = db.Column(db.Integer, db.ForeignKey('artists.id'), nullable=False)

    songs = db.relationship(
        'Song',
        secondary=album_songs,
        backref=db.backref('albums', lazy='dynamic')
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "img": self.img,
            "artist_id": self.artist_id,
            "songs": [s.to_dict() for s in self.songs]
        }


class Playlist(db.Model):
    __tablename__ = 'playlists'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    songs = db.relationship(
        'Song',
        secondary=playlist_songs,
        backref=db.backref('playlists', lazy='dynamic')
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user_id
        }


class SongLike(db.Model):
    __tablename__ = 'song_likes'

    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False, index=True)
    ip_address = db.Column(db.String(120), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('song_id', 'ip_address', name='uq_song_like_ip'),
    )


class UserSongLike(db.Model):
    __tablename__ = 'user_song_likes'

    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('song_id', 'user_id', name='uq_user_song_like'),
    )


class SongPlay(db.Model):
    __tablename__ = 'song_plays'

    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False, index=True)
    ip_address = db.Column(db.String(120), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('song_id', 'ip_address', name='uq_song_play_ip'),
    )


class UserSongPlay(db.Model):
    __tablename__ = 'user_song_plays'

    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('song_id', 'user_id', name='uq_user_song_play'),
    )


class SongListenEvent(db.Model):
    __tablename__ = 'song_listen_events'

    id = db.Column(db.Integer, primary_key=True)
    song_id = db.Column(db.Integer, db.ForeignKey('songs.id'), nullable=False, index=True)
    ip_address = db.Column(db.String(120), nullable=False, index=True)
    listened_seconds = db.Column(db.Float, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)


class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, default='')
    img = db.Column(db.String(500))
    location = db.Column(db.String(500), nullable=False)
    starts_at = db.Column(db.DateTime, nullable=False, index=True)
    ends_at = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    artist_id = db.Column(db.Integer, db.ForeignKey('artists.id'), nullable=False, index=True)

    artist = db.relationship('Artist', backref=db.backref('events', lazy=True))
    rsvps = db.relationship('EventAttendee', backref='event', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description or '',
            'img': self.img,
            'location': self.location,
            'starts_at': self.starts_at.isoformat() if self.starts_at else None,
            'ends_at': self.ends_at.isoformat() if self.ends_at else None,
            'artist_id': self.artist_id,
        }

    def attendee_count(self):
        return EventAttendee.query.filter_by(event_id=self.id).count()


class EventAttendee(db.Model):
    __tablename__ = 'event_attendees'

    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('event_rsvps', lazy=True))

    __table_args__ = (
        db.UniqueConstraint('event_id', 'user_id', name='uq_event_attendee_user'),
    )

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }