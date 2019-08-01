const events = {
  MESSAGE_REACTION_ADD: "messageReactionAdd"
};

module.exports = async (bot, event) => {
  if (!events.hasOwnProperty(event.t)) return;
  const {
    d: data
  } = event;

  const user = bot.users.get(data.user_id);
  const channel = bot.channels.get(data.channel_id) || await user.createDM();

  if (channel.messages.has(data.message_id)) return;

  const message = await channel.fetchMessage(data.message_id);
  const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
  const reaction = message.reactions.get(emojiKey);
  bot.emit(events[event.t], reaction, user);
};
