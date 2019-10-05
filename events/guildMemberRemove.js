module.exports = async (bot, member) => {
	if (member.user.bot) return;

	if (bot.userInfo.has(member.id)) {
		bot.userInfo.delete(member.id);
	}
};
