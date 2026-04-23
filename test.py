from app import Score
import json

def loadJSON_db():
    filePath='Score.json'

    #db_saveScore(Score(username='a',score=81,accuracy=76,wpm=34))
    
    with open(filePath,'r') as f:
        data:dict
        data=json.load(f)
        print(type(data))
        print(data.items())
        for key,value in data.items():
            print(key,value)
            
            print(repr(Score(username=key,score=value[0],accuracy=value[1],wpm=value[2])))
            #db_saveScore(Score(username=key,score=value[0],accuracy=value[1],wpm=value[2]))
            
        print(data)
    return "Successfully loading"         


    
print(loadJSON_db())