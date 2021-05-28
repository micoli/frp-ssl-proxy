const envTypes = {
    int: 'int',
    string: 'string',
    bool: 'bool',
    json: 'json',
};

const getEnv = (envPrefix, tag, defaultValue, type) => {
    const environmentName = `${envPrefix}${tag}`
    if (process.env.hasOwnProperty(environmentName)) {
        const value = process.env[environmentName];
        switch (type) {
            case envTypes.int:
                return parseInt(value)
            case envTypes.string:
                return value;
            case envTypes.bool:
                switch(value.toLowerCase().trim()){
                    case "true": case "yes": case "1": return true;
                    case "false": case "no": case "0": case null: return false;
                    default: return Boolean(value);
                }
            case envTypes.json:
                return JSON.parse(value);
        }
    }
    return defaultValue;
}

module.exports = (prefix) => {
    return {
        envTypes,
        getEnv: (tag, defaultValue, type) => getEnv(prefix, tag, defaultValue, type)
    }
}
