module.exports = (...args) => {
    if (process.env.DEBUG === 'true') console.log(...args);
};