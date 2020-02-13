const fs = require('fs');

let filename1 = 'C:/Users/{MyPath}';
let filename2 = 'C:/Users/{MyPath}';

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

let renameFiles = () => {
    let count = 0;
    for(let x = 0; x < osrDirectory.length; x++){

        let newFileName = removeRegex(osrDirectory[x]);
        let res = newFileName.replace(/[-]/g, '~');
        let y = res.replace(/[\[']+/g,'(');
        let z = y.replace(/[\]']+/g,')');

        fs.rename(mp4Directory[x], z+'.mp4', function(err) {
            if (err) throw err;
            console.log('File Renamed.'); 
        });
        const path = getFiles(filename1)[count];
        fs.copyFile(path, 'C:/Users/{myPath}/Desktop/completed/'+count+'.osr', (err) => {
            if (err) throw err;
            console.log('source.txt was copied to destination.txt');
        });
        count+=2;
    }
}
renameFiles();
