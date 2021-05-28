const fs = require('fs');
const recursiveAssign = require('recursive-object-assign');

const retrieve = (storePath, defaultData) => {
    if (fs.existsSync(storePath)) {
        return persist(
            storePath,
            recursiveAssign(
                defaultData,
                JSON.parse(fs.readFileSync(storePath, {encoding: 'utf8', flag: 'r'}))
            )
        );
    } else {
        persist(storePath, defaultData);
        return defaultData;
    }
}

const persist = (storePath, data) => {
    try {
        fs.writeFileSync(storePath, JSON.stringify(data, null, 4));
    } catch (err) {
        console.error(err);
    }
    return data;
}

module.exports = {
    retrieve,
    persist
}
