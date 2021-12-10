import { Event } from '@ruinguard/core';

export default new Event({
  event: 'ready',
  async run(client) {
    setInterval(async () => {
      const unmute = await client.db.Mute.find({ until: { $lt: Date.now() } });
      await client.db.Mute.deleteMany({ until: { $lt: Date.now() } });
      for (const mute of unmute) {
        const guild = client.guilds.resolve(mute.guild);
        const doc = await client.db.Config.findOne({ guild: guild.id });
        const member = await guild.members.fetch(mute.user).catch(() => {});
        if (!member) return;
        await member.roles.remove(doc?.muterole).catch(() => {});
      }
    }, 5000);
  },
});
