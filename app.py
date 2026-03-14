from flask import Flask, render_template, request, jsonify, url_for, session, redirect
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
# from mysql.connector import pooling
from functools import wraps
from datetime import datetime
from init_db import init_database
import os



app = Flask(__name__)
CORS(app, supports_credentials=True)

app.secret_key = os.getenv("SECRET_KEY", "beatmatch_super_secret")

app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

from mysql.connector import pooling

# ==============================
# DATABASE CONNECTION POOL
# ==============================

dbconfig = {
    "host": os.getenv("MYSQLHOST", "localhost"),
    "user": os.getenv("MYSQLUSER", "root"),
    "password": os.getenv("MYSQLPASSWORD", "12345"),
    "database": os.getenv("MYSQLDATABASE", "beatmatch"),
    "port": int(os.getenv("MYSQLPORT", 3306))
}

# Create a connection pool with 5 connections
connection_pool = pooling.MySQLConnectionPool(
    pool_name="beatmatch_pool",
    pool_size=5,
    pool_reset_session=True,
    **dbconfig
)

def get_db_connection():
    try:
        return connection_pool.get_connection()
    except Exception as e:
        print(f"Error getting connection from pool: {e}")
        return None

def get_cursor(dictionary=False):
    db = get_db_connection()
    if db:
        cursor = db.cursor(dictionary=dictionary)
        return cursor, db
    return None, None


# ==============================
# LOGIN REQUIRED DECORATOR
# ==============================

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):

        if "user_id" not in session:
            return redirect(url_for("home"))

        return f(*args, **kwargs)

    return decorated_function


# ==============================
# PAGES
# ==============================

@app.route("/")
def home():
    return render_template("about.html")


@app.route("/game")
@login_required
def game():
    return render_template("index.html")


# ==============================
# SIGNUP
# ==============================

@app.route("/signup", methods=["POST"])
def signup():

    data = request.json
    username = data["username"]
    email = data["email"]
    password = data["password"]

    password_hash = generate_password_hash(password)

    cursor, db = get_cursor()

    cursor.execute("""
        INSERT INTO users (username,email,password_hash)
        VALUES (%s,%s,%s)
    """, (username, email, password_hash))

    user_id = cursor.lastrowid

    cursor.execute(
        "INSERT INTO player_stats (user_id) VALUES (%s)",
        (user_id,)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({"message": "User created"})


# ==============================
# LOGIN
# ==============================

@app.route("/login", methods=["POST"])
def login():

    data = request.json

    identifier = data["identifier"]
    password = data["password"]

    cursor, db = get_cursor(True)

    cursor.execute("""
        SELECT user_id, username, password_hash
        FROM users
        WHERE username=%s OR email=%s
    """, (identifier, identifier))

    user = cursor.fetchone()

    cursor.close()
    db.close()

    if user and check_password_hash(user["password_hash"], password):

        session["user_id"] = user["user_id"]
        session["username"] = user["username"]

        return jsonify({
            "success": True,
            "user_id": user["user_id"]
        })

    return jsonify({"error": "Invalid login"}), 401


# ==============================
# LOGOUT
# ==============================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(url_for("home"))


# ==============================
# PROFILE DROPDOWN API
# ==============================

@app.route("/profile/<int:user_id>")
def profile(user_id):

    cursor, db = get_cursor(True)

    cursor.execute("""
        SELECT 
            u.username,
            u.email,
            p.highest_score,
            p.highest_combo,
            p.highest_level
        FROM users u
        LEFT JOIN player_stats p
        ON u.user_id = p.user_id
        WHERE u.user_id=%s
    """, (user_id,))

    user = cursor.fetchone()

    cursor.execute("""
        SELECT COUNT(*) + 1 AS player_rank
        FROM player_stats
        WHERE highest_score >
        (SELECT highest_score FROM player_stats WHERE user_id=%s)
    """, (user_id,))

    rank_data = cursor.fetchone()

    user["rank"] = rank_data["player_rank"]

    cursor.close()
    db.close()

    return jsonify(user)


# ==============================
# SAVE SCORE
# ==============================

@app.route("/save_score", methods=["POST"])
def save_score():

    data = request.json

    user_id = int(data["user_id"])
    score = int(data["score"])
    level = int(data["level"])
    accuracy = float(data["accuracy"])
    combo = int(data["combo"])

    cursor, db = get_cursor(True)
    stats_cursor = db.cursor(dictionary=True)

    cursor.execute("""
        INSERT INTO game_sessions
        (user_id, score, accuracy, level_reached, max_combo)
        VALUES (%s,%s,%s,%s,%s)
    """, (user_id, score, accuracy, level, combo))

    cursor.execute("""
        INSERT INTO player_stats
        (user_id, highest_score, highest_accuracy, highest_combo,
         highest_level, total_score, avg_accuracy, games_played)

        VALUES (%s,%s,%s,%s,%s,%s,%s,1)

        ON DUPLICATE KEY UPDATE

        highest_score = GREATEST(highest_score,%s),
        highest_accuracy = GREATEST(highest_accuracy,%s),
        highest_combo = GREATEST(highest_combo,%s),
        highest_level = GREATEST(highest_level,%s),

        total_score = total_score + %s,
        games_played = games_played + 1,

        avg_accuracy =
        ((avg_accuracy * games_played) + %s) / (games_played + 1)

    """, (
        user_id, score, accuracy, combo, level, score, accuracy,
        score, accuracy, combo, level,
        score, accuracy
    ))

    db.commit()

    stats_cursor.execute("""
        SELECT games_played,
               highest_combo,
               highest_score,
               highest_accuracy,
               highest_level
        FROM player_stats
        WHERE user_id=%s
    """, (user_id,))

    stats = stats_cursor.fetchone()

    check_achievements(user_id, stats)

    cursor.close()
    db.close()
    stats_cursor.close()

    return jsonify({"message": "Score saved"})


# ==============================
# LEADERBOARD PAGE
# ==============================

@app.route("/leaderboard")
@login_required
def leaderboard():

    cursor, db = get_cursor(True)

    cursor.execute("""
        SELECT u.username,
               p.highest_score,
               p.highest_accuracy,
               p.highest_combo,
               p.highest_level
        FROM player_stats p
        JOIN users u ON u.user_id = p.user_id
        ORDER BY p.highest_score DESC
        LIMIT 20
    """)

    results = cursor.fetchall()

    cursor.close()
    db.close()

    return render_template("leaderboard.html", leaderboard=results)


# ==============================
# LEADERBOARD API
# ==============================

@app.route("/get_leaderboard/<int:user_id>")
def get_leaderboard(user_id):

    cursor, db = get_cursor(True)

    cursor.execute("""
        SELECT 
            u.username,
            p.highest_score,
            p.highest_level
        FROM player_stats p
        JOIN users u ON u.user_id = p.user_id
        ORDER BY p.highest_score DESC
        LIMIT 20
    """)

    top_players = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify({
        "top": top_players
    })


# ==============================
# PROFILE PAGE
# ==============================

@app.route("/profile_page")
@login_required
def profile_page():

    user_id = session["user_id"]

    cursor, db = get_cursor(True)

    cursor.execute("""
    SELECT 
        u.username,
        u.email,
        u.created_at,
        ps.highest_score,
        ps.total_score,
        ps.avg_accuracy,
        ps.highest_level,
        ps.highest_combo,
        ps.games_played,
        ps.highest_accuracy
    FROM users u
    JOIN player_stats ps
    ON u.user_id = ps.user_id
    WHERE u.user_id = %s
    """, (user_id,))

    user = cursor.fetchone()

    cursor.execute("""
    SELECT 
        score,
        accuracy,
        level_reached,
        max_combo
    FROM game_sessions
    WHERE user_id=%s
    ORDER BY session_id DESC
    LIMIT 5
    """, (user_id,))

    matches = cursor.fetchall()

    cursor.execute("""
    SELECT 
        a.id,
        a.name,
        a.description,
        ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua
    ON a.id = ua.achievement_id
    AND ua.user_id = %s
    """, (user_id,))

    achievements = cursor.fetchall()

    cursor.execute("""
        SELECT COUNT(*) + 1 AS player_rank
        FROM player_stats
        WHERE highest_score >
        (SELECT highest_score FROM player_stats WHERE user_id=%s)
    """, (user_id,))

    rank_data = cursor.fetchone()
    rank = rank_data["player_rank"]

    user["rank"] = rank

    cursor.execute("SELECT COUNT(*) AS total_players FROM users")
    total_data = cursor.fetchone()
    total_players = total_data["total_players"]

    top_percent = round((rank / total_players) * 100, 2)

    if user and user["created_at"]:
        user["joined"] = user["created_at"].strftime("%b %Y")

    cursor.close()
    db.close()

    return render_template(
        "profile.html",
        user=user,
        total_players=total_players,
        top_percent=top_percent,
        matches=matches,
        achievements=achievements
    )


# ==============================
# RECENT MATCHES API
# ==============================

@app.route("/api/recent_matches")
def recent_matches():

    if "user_id" not in session:
        return jsonify([])

    user_id = session["user_id"]

    cursor, db = get_cursor(True)

    cursor.execute("""
        SELECT 
            user_id,
            score,
            accuracy,
            level_reached,
            max_combo
        FROM game_sessions
        WHERE user_id=%s
        ORDER BY session_id DESC
        LIMIT 5
    """, (user_id,))

    matches = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(matches)


# ==============================
# ACHIEVEMENTS SYSTEM
# ==============================

def check_achievements(user_id, stats):

    if stats["games_played"] >= 10:
        unlock_achievement(user_id, 1)

    if stats["highest_combo"] >= 15:
        unlock_achievement(user_id, 2)

    if stats["highest_score"] >= 5000:
        unlock_achievement(user_id, 3)

    if stats["highest_accuracy"] >= 95:
        unlock_achievement(user_id, 4)

    if stats["highest_level"] >= 15:
        unlock_achievement(user_id, 7)

    if stats["highest_combo"] >= 20 and stats["highest_accuracy"] >= 95:
        unlock_achievement(user_id, 8)


def unlock_achievement(user_id, achievement_id):

    cursor, db = get_cursor()

    cursor.execute("""
        INSERT IGNORE INTO user_achievements
        (user_id, achievement_id)
        VALUES (%s,%s)
    """, (user_id, achievement_id))

    db.commit()

    cursor.close()
    db.close()


@app.route("/api/achievements")
@login_required
def get_achievements():

    cursor, db = get_cursor(True)

    cursor.execute("""
        SELECT 
            a.id,
            a.name,
            a.description,
            ua.unlocked_at
        FROM achievements a
        LEFT JOIN user_achievements ua
        ON a.id = ua.achievement_id
        AND ua.user_id = %s
    """, (session["user_id"],))

    achievements = cursor.fetchall()

    cursor.close()
    db.close()

    return jsonify(achievements)


# ==============================
# RUN
# ==============================

if __name__ == "__main__":
    app.run(debug=True)