from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all origins

socketio = SocketIO(app, cors_allowed_origins="*")  # Enable WebSockets

from app import routes