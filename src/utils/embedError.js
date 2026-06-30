const { EmbedBuilder } = require("discord.js");

module.exports = function embedError(title, message) {
    return new EmbedBuilder()
        .setColor(0xED4245) // Rouge
        .setTitle(title)
        .setDescription(message)
        .setTimestamp(); 
};