import firebase_admin
import time
from firebase_admin import credentials, auth, firestore
from datetime import datetime, timedelta

cred = credentials.Certificate('code-brawl-service-account.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
transaction = db.transaction()

def get_problems(challenge_id):
    challenge_ref = db.collection(u'challenges').document(challenge_id)
    try:
        data = challenge_ref.get().to_dict()['questions']
        return data
    except:
        print(u'No such document!')

    return None
