const path = require('path'),
fs         = require('fs');

const env = () => {
    let dotenvPath = path.resolve(process.cwd(), '.env'), data;
    try {        
        data = fs.readFileSync(dotenvPath, 'utf8');
    }
    catch (err) {
        return console.log('Could\'t load .env file.');
    }
    importEnv(data);
};

const importEnv = data => {
    data.split('\n').forEach(variable => {
        let keyVal = variable.trim().split('=');
        let value;
        try {
            value = JSON.parse(keyVal[1]);
        } catch {
            value = keyVal[1];
        }
        process.env[keyVal[0]] = value;
    });
};

module.exports = env;