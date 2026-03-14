import mysql.connector
import os

def init_database():
    conn = mysql.connector.connect(
        host=os.getenv("MYSQLHOST"),
        user=os.getenv("MYSQLUSER"),
        password=os.getenv("MYSQLPASSWORD"),
        database=os.getenv("MYSQLDATABASE"),
        port=int(os.getenv("MYSQLPORT"))
    )

    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS achievements (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        description TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS game_sessions (
        session_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        score INT,
        accuracy FLOAT,
        level_reached INT,
        max_combo INT,
        played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS player_stats (
        user_id INT PRIMARY KEY,
        highest_score INT DEFAULT 0,
        total_score INT DEFAULT 0,
        avg_accuracy FLOAT DEFAULT 0,
        highest_level INT DEFAULT 0,
        highest_combo INT DEFAULT 0,
        games_played INT DEFAULT 0,
        highest_accuracy FLOAT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_achievements (
        user_id INT,
        achievement_id INT,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, achievement_id)
    )
    """)

    cursor.execute("SELECT COUNT(*) FROM achievements")
    count = cursor.fetchone()[0]

    if count == 0:
        cursor.executemany("""
                           INSERT INTO achievements (name, description) VALUES (%s,%s)
                            """, [
                                ("Rhythm Beginner","Complete 10 total games"),
                                ("Combo Starter","Achieve a 15+ streak in a single game"),
                                ("Score Hunter","Score 5000+ points in one game"),
                                ("Accuracy Master","Achieve 95%+ accuracy for 5 consecutive games"),
                                ("Top Contender","Reach Top 3 on leaderboard"),
                                ("BeatMatch Champion","Stay Rank #1 for 10 days"),
                                ("Survival Pro","Survive 15 levels without losing both wrong attempts"),
                                ("Rhythm Dominator","Achieve 20+ streak and 95% accuracy in same game")
                            ]
        )

    conn.commit()
    cursor.close()
    conn.close()

    print("Database initialized successfully")