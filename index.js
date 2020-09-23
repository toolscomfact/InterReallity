const mongoose = require("mongoose");
const schema = mongoose.Schema;

const express = require("express");

const mongodb_url = "mongodb://localhost";
const mongodb_db = "weblogger";

const open = async () => {
    try{
        var client = await mongoose.connect(mongodb_url + "/" + mongodb_db);
        var logSchema = new schema({
            date : {
                type : Date, 
                default : Date.now
            },
            title : String,
            details : Object
        });
    
        var modelDictionary = {};

        var app = express();

        app.get("/signal", async (req, res) => {
            var typeIsNew = undefined;
            var isDone = true;
            var isDoneError = undefined;

            try{
                var typeName = req.query.typeName;

                if (modelDictionary[typeName] === undefined){
                    modelDictionary[typeName] = mongoose.model(typeName, logSchema);
                    typeIsNew = true;
                }

                var usingModel = modelDictionary[typeName];
                var signalTitle = req.query.signalTitle;
                var signalDetails = JSON.parse(req.query.signalDetails);

                usingModel.create({
                    title : signalTitle,
                    details : signalDetails
                });

            }catch (error){
                isDone = false;
                isDoneError = error;
            }

            res.json({
                typeIsNew : typeIsNew,
                ok : isDone,
                error : isDoneError
            });
        });
        
        app.get("", async (req, res) => {
            var result = undefined;
            var typeIsNew = undefined;
            var isDone = true;
            var isDoneError = undefined;
            
            try{
                var typeName = req.query.typeName;

                if (modelDictionary[typeName] === undefined){
                    modelDictionary[typeName] = mongoose.model(typeName, logSchema);
                    typeIsNew = true;
                }

                var usingModel = modelDictionary[typeName];
                result = await usingModel.find({});
            }catch(error){
                isDone = false;
                isDoneError = error.message; 
            }

            res.json({
                result : result,
                ok : isDone,
                error : isDoneError,
                typeIsNew : typeIsNew
            });
        });

        var server = app.listen(80, () => {
    
        });
        
    }catch (error){
        console.error("RUNTIME ERROR!!");
        console.error(error);
    }
}

open();