let dataStore = undefined, story_db = undefined, story_store = null;

loadJSON("../game/config.json").then(async (CONFIG) => {
    const db = await openDatabase(CONFIG['project-name']);
    story_db = await openDatabase(`${CONFIG['project-name']}_story`);

    // Exported localStorage-like object
    const myLocalStorage = {
        setItem: (key, value) => addData(db, { key, value }),
        getItem: async (key) => {
            const data = await getData(db, key);
            return data ? data.value : null;
        },
        removeItem: (key) => deleteData(db, key),
        clear: () => clearData(db),
        key: (index) => getKeyAt(db, index),
        get length() {
            return getDataLength(db);
        },
    };
    
    
    dataStore = myLocalStorage;

    const storage = {
        setItem: (key, value) => addData(story_db, { key, value }),
        getItem: async (key) => {
            const data = await getData(story_db, key);
            return data ? data.value : null;
        },
        removeItem: (key) => deleteData(story_db, key),
        clear: () => clearData(story_db),
        key: (index) => getKeyAt(story_db, index),
        get length() {
            return getDataLength(story_db);
        },
    }

    story_store = storage;
});