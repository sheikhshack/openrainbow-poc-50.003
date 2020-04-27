newman run HerokuEntrySequence.json -d dataset1.csv -e heroku_environment.json 
newman run HerokuQueueSequence.json -d dataset2.csv -e heroku_environment.json 
newman run HerokuEndSequence.json -d dataset3.csv -e heroku_environment.json 

