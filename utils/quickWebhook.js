async function quickWebhook(channel, message, options) {
  if (typeof message !== "string" && ["RichEmbed", "MessageEmbed"].includes(message.constructor.name)) {
    options.embeds = [message];
    message = null;
  } else if (typeof message !== "string" && ["Attachment", "MessageAttachment"].includes(message.constructor.name)) {
    options.files = [message];
    message = null;
  }

  const webhooks = await channel.fetchWebhooks();
  let hook = webhooks.find(w => w.name === options.username);
  if (!hook) hook = await channel.createWebhook(options.username, options.avatar);

  const msgObject = await hook.send(message, {
    username: options.name,
    avatar: options.icon,
    embeds: options.embeds,
    files: options.files
  });

  if (options.deleteAfterUse) hook.delete();

  return msgObject;
}

module.exports = quickWebhook;
