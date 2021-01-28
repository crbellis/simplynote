import os
import sys
import requests
import time
import hashlib
from datetime import datetime
from bson.json_util import dumps
from bson import ObjectId

from pymongo import MongoClient

from pymongo import MongoClient
from flask import Flask, request, jsonify, Response, session, g
from flask_session import Session
from flask_cors import CORS, cross_origin
from secrets import _key, username, pwd

URI = f"mongodb://{username}:{pwd}@localhost:27017/notes?authSource=notes"
client = MongoClient(URI)

app = Flask(__name__)

SESSION_TYPE = "mongodb"
SESSION_MONGODB = MongoClient(URI)
SESSION_MONGODB_DB = "account"
SESSION_MONGODB_COLLECT = "data"
app.config['CORS_HEADERS'] = 'Content-Type'
app.config.from_object(__name__)
app.config['PERMANENT_SESSION_LIFETIME'] = 3*60*60
app.config["SECRET_KEY"] = _key
Session(app)

def hash_f(pw=None, salt=os.urandom(32)):
    ss = hashlib.pbkdf2_hmac(
        'sha256',
        _key.encode('utf-8'),
        salt, 
        100000
    )
    hash = hashlib.pbkdf2_hmac(
        'sha256',
        (bytes(pw, 'utf-8') + ss),
        salt,
        100000
    )
    return hash, salt

@app.route('/api/getSession', methods=["GET"])
def checkSession():
    if(all(key in session for key in ('email', 'ip', 'token'))):
        if(session['token'] == hash_f(session['email'] + session['ip'] + 
                    app.secret_key)[0]):
            return "Authenticated", 200
    return "Invalid authentication", 401

@app.route("/api/signup", methods=["POST"])
def signup():
    db = client.account
    data = request.json
    checkEmail = db.data.find_one({"email": data["email"]})
    hash, salt = hash_f(data['password'])
    # check if no result
    if checkEmail == None:
        db.data.insert_one({
            "email" : data['email'],
            "salt": salt,
            "iteration": 100000,
            "hash": hash
        })
        return "Succesfully added", 200
    return "Email association already exists", 409

@app.route('/api/login', methods=["POST"])
def login():    
    email = request.json['email']
    session['email'] = email
    session['ip'] = request.remote_addr
    db = client.account
    doc = db.data.find_one({'email': email})
    if doc:
        hash_check = hash_f(pw=request.json['password'], salt=doc['salt'])[0]
        if(hash_check== doc['hash']):
            session['token'] = hash_f(session['email'] + session['ip'] + 
                app.secret_key)[0]

            session['uuid'] = doc["_id"]

            return "Valid credentials", 200
    return "Error: invalid user credentials", 401

@app.route('/api/getnotes', methods=['GET'])
def getAllNotes():
    db = client.notes
    docs = db.notes.find({'uuid' : session['uuid']})
    notes = {"notes": list(docs)}
    return dumps(notes), 200

@app.route('/api/savenote', methods=["POST"])
def addNote():
    if (checkSession()[1] == 200):
        body = request.json["body"]
        db = client.notes
        if ("_id" not in body.keys()):
            _id = db.notes.insert(
            {
                "uuid": session["uuid"], 
                "note_name": body["note_name"], 
                "note": body["note"],
                "timestamp": datetime.utcnow()
            })
            return {"_id": str(_id)}, 200
        else:
            _id = body["_id"]
            db.notes.update_one({"_id": ObjectId(_id)},
                {"$set": {
                    "uuid": session["uuid"], 
                    "note_name": body["note_name"], 
                    "note": body["note"],
                    "timestamp": datetime.utcnow()
                }}
            )
            return {"_id": str(_id)}, 200
    return "Unauthorized", 401

@app.route("/api/delete/noteid=<note_id>", methods=["DELETE"])
def deletenoteid(note_id):
    db = client.notes
    deletion = db.notes.delete_one({"_id": ObjectId(note_id)})
    if(deletion.deleted_count>0):
        return "Note deleted", 200
    else:
        return "Note not found", 400

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")