from flask import Flask,render_template,request,redirect,url_for,jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc
from datetime import datetime
from Words import MyDict
import random
app=Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///database2.sqlite3'

db=SQLAlchemy(app)

class Score2(db.Model):
    id      =db.Column(db.Integer,primary_key=True)
    username=db.Column(db.String(200),nullable=False)
    score   =db.Column(db.Integer,nullable=False,default=0)
    accuracy=db.Column(db.Integer,nullable=False,default=0)
    wpm     =db.Column(db.Integer,nullable=False,default=0)
    date    =db.Column(db.DateTime,default=datetime.now)
    
    def __repr__(self):
        return f'Score< username:{self.username}, score:{self.score}>'
    
def init_db():
    with app.app_context():
        db.create_all()
    
def db_save_score(score:Score2):
    db.session.add(score)
    db.session.commit()

def db_leaderboard():
    all_record=Score2.query.order_by(desc(Score2.score)).all()
    seen={}
    for record in all_record:
        if record.username not in seen:
            seen[record.username]=record
        if len(seen)==10:
            break
    return list(seen.values())


@app.route('/',methods=['GET'])
def index():
    print('dad')
    return render_template('index2.html')

@app.route('/game',methods=['POST'])
def game():
    name        =request.form.get('Username','').strip()
    difficulty  =request.form.get('difficulty','easy').strip()
    if not name:
        return redirect(url_for('index'))
    if difficulty not in {'easy','medium','hard','asian'}:
        difficulty='easy'
    if bool(db.session.query(Score2.username).filter_by(username=name).first()):
        return redirect(url_for('index'))
    return render_template('game2.html',player_name=name, difficulty=difficulty)

@app.route('/get-word/<difficulty>')
def get_word(difficulty):
    if difficulty not in MyDict:
        return jsonify({'error':'invalid difficulty'}) , 400
    word=random.choice(MyDict[difficulty])
    return jsonify({'word':word}),200
@app.route('/save-score',methods=['POST'])
def save_score():
    data=request.get_json()
    if not data :
        return jsonify({'error':'no data'}),400
    db_save_score(Score2(
        username=data.get('username','Anonymous'),
        score   =data.get('score',0),
        accuracy=data.get('accuracy',0),
        wpm     =data.get('wpm',0)
    ))
    return jsonify({'status':'saved'}),200

@app.route('/leaderboard', methods=['GET'])
def leaderboard():
    top10=db_leaderboard()
    data={e.username:e.score for e in top10}
    return jsonify(data)

@app.route('/checkUser',methods=['POST'])
def checkUser():
    data=request.get_json()
    if not data or 'UserName' not in data:
        return jsonify({'status':False}),400
    exists=bool(db.session.query(Score2.username)
                .filter_by(username=data['UserName'])
                .first())
    return jsonify({'status':exists}),200

@app.route('/delete/<name>')
def delete_score(name):
    print(name)
    if  name=='all':
        db.session.query(Score2).delete()
    else:
        db.session.query(Score2).filter(Score2.username==name).delete()
    db.session.commit()
    return f'Deleted : {name}'



if __name__=='__main__':
    init_db()
    app.run(port=81,debug=True)