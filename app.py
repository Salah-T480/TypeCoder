from flask import Flask,render_template,make_response,Response,jsonify,request,redirect,url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import desc,asc,delete
from datetime import datetime
import random
from Words import MyDict
import json


app=Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///database.sqlite3'

db=SQLAlchemy(app)

class Score(db.Model):
    id      =db.Column(db.Integer,primary_key=True)
    username=db.Column(db.String(200),nullable=False)
    score   =db.Column(db.Integer,nullable=False,default=0)
    accuracy=db.Column(db.Integer,nullable=False,default=0)
    wpm     =db.Column(db.Integer,nullable=False,default=0)
    date    =db.Column(db.DateTime,default=datetime.now())
    
    def __repr__(self):
        return "<Score: username:%r , score:%r>" %(self.username,self.score)


def init_db():
    app.app_context().push()
    db.create_all()


def db_saveScore(score:Score):                          #it's working
    db.session.add(score)
    db.session.commit()

def db_retrieveScores(id:int,isAll=False):              #not tested Yet 
    if isAll:
        return  Score.query.all()
    return  Score.query.get_or_404(id)
    
def db_leaderboard():                                   # it's working 
    return Score.query.order_by(desc(Score.score)).limit(10).all()



#for testing 
def loadJSON_db():
    filePath='Score.json'
    try:
        #db_saveScore(Score(username='a',score=81,accuracy=76,wpm=34))
        
        with open(filePath,'r') as f:
            data=json.load(f)
            data:dict
            for key,value in data.items():
                #repr(Score(username=key,score=value[0],accuracy=value[1],wpm=value[2]))
                db_saveScore(Score(username=key,score=value[0],accuracy=value[1],wpm=value[2]))
        return "Successfully loading"         
    except:
        return "error in loading data from JSON"




#App's Routes
@app.route('/') # for the home page
def index():
    
    print(request.method)
    if request.method=='GET':
        isExist=request.args.get("isExist","None")
        #print(isExist)
        return render_template('index.html',isExist=True)
    return render_template('index.html',isExist=False)

@app.route('/game',methods=['POST']) #for the game page
def game():
    name=request.form.get('name')
    print(name)
    isExist=bool(db.session.query(Score.username).filter_by(username=name).first())
    if isExist:
        return redirect(url_for('warning'))
    return render_template('game.html')

@app.route('/get-word/<difficulty>') # to get a random word
def getWord(difficulty):
    word=random.choice(MyDict[difficulty])
    return jsonify({"word":word})

@app.route('/save-score',methods=['POST']) # for saving score
def saveScore():
    data=request.get_json()
    print(data)
    db_saveScore(Score(username=data['userName'],score=data['score']))
    return  jsonify({"salah":2005})           # not finished yet

@app.route('/leaderboard',methods=['GET'])  # get the 10 top scores             it's working
def leaderBoard():
    leaderboard=db_leaderboard()
    print(f"{leaderboard}")
    data={}
    for e in list(leaderboard):
        data[e.username]=e.score
    print(data)
    return jsonify(data)      #for returning a list I think hhhh
    return render_template('index.html',leaderboard=leaderboard)




#for testing 
@app.route('/load') # it's just for testing if the dataBase is worked properly
def load():
    return loadJSON_db()


@app.route('/delete/<name>')
def delete(name):
    if name=='all':
        db.session.query(Score).delete()
        db.session.commit()
        print("all data deleted")
    else:
        db.session.query(Score).filter(Score.username==name).delete()
        db.session.commit()
    return "delete"

@app.route('/checkUser',methods=['POST'])
def checkUser():
    userName=request.get_json()
    print()
    return jsonify({
        "status":bool(db.session.query(Score.username).filter_by(username=userName['userName']).first())
    })

@app.route('/warning')
def warning():
    return render_template('index_warning.html')


if __name__=='__main__':
    app.run(port=82,debug=True)
