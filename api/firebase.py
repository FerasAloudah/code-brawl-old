import firebase_admin
import time
import questions
from firebase_admin import credentials, auth, firestore
from datetime import datetime, timedelta

cred = credentials.Certificate('code-brawl-service-account.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
transaction = db.transaction()
