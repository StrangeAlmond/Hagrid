const events = {
  MESSAGE_REACTION_ADD: "messageReactionAdd"
};

module.exports = async (bot, event) => {
  if (!events.hasOwnProperty(event.t)) return;

  const {
    d: data
  } = event;

  const user = bot.users.cache.get(data.user_id);
  const channel = bot.channels.cache.get(data.channel_id) || await user.createDM();

  if (channel.messages.cache.has(data.message_id)) return;

  const message = await channel.messages.fetch(data.message_id);
  const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
  const reaction = message.reactions.cache.get(emojiKey);
  bot.emit(events[event.t], reaction, user);
};