newman run getReqCSA_heroku.json -d getReqCSA_updated.csv -e heroku_environment.json
newman run getReqCSA_heroku.json -d getReqCSA_inject.csv -e heroku_environment.json
newman run checkQueStatus_heroku.json -d checkQueStatus_updated.csv -e heroku_environment.json 
newman run endChatInstance_heroku.json -d endChatInstance_updated.csv -e heroku_environment.json 
# newman run superCreateNew_heroku.json -d superCreateNew_updated.csv -e heroku_environment.json 
# newman run superTerminate_heroku.json -d superTerminate_updated.csv -e heroku_environment.json