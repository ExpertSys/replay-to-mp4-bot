const fs = require('fs');
const shell = require('shelljs');
var robot = require("robotjs");
const fetch = require('node-fetch');
var mv = require('mv');
let fm = require ('fs.extra');
const osuReplayParser = require('osureplayparser');
const osu = require('node-osu');

let apiPrefix = "https://osu.ppy.sh/api/";
let key = '{MyKey}';

let filename1 = 'C:/Users/{osrPath}';
let filename2 = 'C:/Users/{mp4Path}';

let currReplay = 0;
let currReplayIndex = 0;

let getFiles = function(dir) {
    let results = [];
    let list = fs.readdirSync(dir);

    list.forEach(function(file) {
        file = dir + '/' + file;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(getFiles(file));
        } else { 
            results.push(file);
        }
    });
    return dir = results;
}

let removeRegex = (filename) => {
    let indexOfLastPara = filename.lastIndexOf('(');
    let newStr = filename.substring(0, indexOfLastPara - 1);
    return newStr;
}

let osrDirectory = getFiles(filename1);
let mp4Directory = getFiles(filename2);

let startReplay = (fileIndex) => {
    let filename = '"'+osrDirectory[fileIndex]+'"';
    shell.exec(filename);
    console.log('Now playing: ' + filename);
    startRecording();
}

let startRecording = () => {
    robot.keyTap("numpad_8");
    robot.keyTap("numpad_5");
}

let stopRecording = () => {
    robot.keyTap("numpad_9");
}

function secondsToMs(input){
    return input * 1000;
}

function msConversion(ms) {
    let sec = Math.floor(ms / 1000);
    let hrs = Math.floor(sec / 3600);
    sec -= hrs * 3600;
    let min = Math.floor(sec / 60);
    sec -= min * 60;
    sec = '' + sec;
    sec = ('00' + sec).substring(sec.length);
  
    if (hrs > 0) {
      min = '' + min;
      min = ('00' + min).substring(min.length);
      return hrs + ":" + min + ":" + sec;
    }
    else {
      return min + ":" + sec;
    }
}

let mods = {
    "None": 0,
    "NoFail": 1,
    "Easy": 2,
    "Hidden": 8,
    "HardRock": 16,
    "SuddenDeath": 32,
    "DoubleTime": 64,
    "Relax": 128,
    "HalfTime": 256,
    "Nightcore": 576,
}

let currentMods = [];
let modEnum;

let activeMods = (firstMod, secondMod, thirdMod) => {
    for(let [mod, value] of Object.entries(mods)) {
        if(firstMod === value && secondMod !== firstMod && thirdMod !== firstMod){
            currentMods.push({mod, value});
        }
        if(firstMod === value && secondMod == firstMod && thirdMod !== firstMod){
            currentMods.push({mod, value});
        }
        else if(firstMod === value || secondMod === value || thirdMod === value){
           if(firstMod < modEnum){
               let newVal = modEnum - firstMod;
               for(let [mod, value] of Object.entries(mods)) {
                    if(firstMod === value || newVal === value || secondMod === value || thirdMod === value){
                        currentMods.push({mod, value});
                    }
                }
            }
        }
    }
    return currentMods;
};

let checkMod = (number) => {
    let underChosenNumber = [];
    let largestArr = Math.max.apply(Math, underChosenNumber);
    let modType;
    
    if(number === 0   || number === 1   || 
       number === 2   || number === 8   || 
       number === 16  || number === 32  || 
       number === 64  || number === 256 || 
       number === 512 || number === 128 )  
       {number *= 2;}

       console.log(number);

    Object.keys(mods).reduce(function(a, b){ 
        if(mods[b] <= number){
            modType = b;
            underChosenNumber.push(mods[b]);
        }
    });
    
    for (let [key, value] of Object.entries(mods)) {
        if(largestArr < number){
            if(modEnum === 0){
                return activeMods(value); 
            }
            if(key === modType){
                let newVal = number - value;
                let thirdModValue = newVal / 3;
                let sum = value + newVal;
                let total = sum - value - thirdModValue;
                return activeMods(value, total, thirdModValue); 
            }
        }
    }
}

function doubleTime(baseTime){
    let oneThird = baseTime *= (1 - 0.33); /* Doubletime = 33% or 1/3 length of a song */
    return oneThird;
}

function halfTime(baseTime){
    let oneThird = baseTime *= (1 - 0.33); /* Halftime = +33% or 1/3 length of a song */
    let increase = oneThird + baseTime;
    return increase;
}

const getSongLength = async () => {
    const replayPath = getFiles(filename1);
    let arr = [];
    let actualReturnData;
    let modType = [];

    for(let x = 0; x < replayPath.length; x++){
        currPath = replayPath[x];
        console.log('Loading Replay: ' + currPath);
        const replay = osuReplayParser.parseReplay(currPath);
        let hash = replay.beatmapMD5;
        let requestURL = `${apiPrefix}get_beatmaps?h=${hash}&k=${key}`;
        let returnData = await fetch(requestURL);
        actualReturnData = await returnData.json();
        checkMod(replay.mods);
        modEnum = replay.mods;

        function removeDuplicates(arrName){
            var noDuplicate = arrName.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            });
            return noDuplicate;
        }

        console.log(replay.mods);

        if(replay.mods === 0 || replay.mods === 8 || replay.mods === 24 || replay.mods === 32
        || replay.mods === 16 || replay.mods === 128){
            arr.push(actualReturnData[0].total_length * 1000 + 7000);
        }
        else if(replay.mods < 64){
            arr.push(actualReturnData[0].total_length * 1000 + 7000);
        }
        else if(replay.mods >= 64 && replay.mods <= 127){
            arr.push(doubleTime(actualReturnData[0].total_length * 1000 + 7000));
        }
        else if(replay.mods >= 128 && replay.mods <= 400){
            arr.push(actualReturnData[0].total_length * 1000 + 7000);
        }
        else if(replay.mods >= 570 && replay.mods <= 700){
            arr.push(doubleTime(actualReturnData[0].total_length * 1000 + 7000));
      985  }
        else{
            arr.push(actualReturnData[0].total_length * 1000 + 7000);
        }
    }
    console.log(removeDuplicates(arr));
    return arr;
};

// getSongLength();

const initializeReplay = () => {
    getSongLength().then(val => {
        let x = 0;
        var myFunction = async =() => {
            currReplayIndex++;
            currReplay++;
            x++;
            stopRecording();
            startReplay(currReplay);
            
            if(currReplay === osrDirectory.length){
                robot.keyTap("numpad_9"); 
                robot.keyTap("numpad_6");
                robot.keyTap("numpad_6");
                shell.exec('"'+'C:/Users/Madara Uchiha/Desktop/renameBot.bat'+'"');
                robot.keyTap("escape");
                robot.keyTap("escape");
                clearInterval(start);   
            }
            console.log("Current Replay: " + currReplay);
            console.log("Song Length: " + msConversion(val[x]));
            setTimeout(myFunction, val[x]);
        }
        setTimeout(myFunction, val[x]);
    })
    .catch(err => console.log(err));
}

initializeReplay();
startReplay(currReplay);

