import { Command } from '@ruinguard/core';
import ms from 'ms';

export default new Command({
  data: {
    name: 'mute',
    description: 'mute a user',
    options: [
      {
        type: 6,
        name: 'user',
        description: 'the user you want to mute',
        required: true,
      }, {
        type: 3,
        name: 'duration',
        description: 'for how long to mute this user',
      }, {
        type: 3,
        name: 'reason',
        description: 'why you are muting this user',
      },
    ],
  },
  flags: [1<<1],
  permissions: {
    user: [1n<<13n],
    self: [1n<<28n],
  },

  async run(interaction) {
    const user = await interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => {});
    const reason = interaction.options.getString('reason', false)||'no reason provided';
    const duration = ms(interaction.options.getString('duration')||' ');

    if (member && interaction.channel.permissionsFor(member).has([1n<<13n]) && member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: 'Sorry, you can\'t mute that user.',
        ephemeral: true,
      });
    }

    if (member) {
      await user.send(interaction.markdown(`
      ::# You've been muted in ${interaction.guild.name}
      reason: ${reason}
      duration: ${duration ? ms(duration, { long: true }) : 'indefinitely'}
    `, { splash: false }).toMsg()).catch(() => {});
    }

    await interaction.client.db.Mute.updateOne({ user: user.id, guild: interaction.guild.id }, { until: duration ? Date.now() + duration : Infinity }, { upsert: true });

    const doc = await interaction.client.db.Config.findOne({ guild: interaction.guild.id });
    const reply = (!member || await member.roles.add(doc?.muterole, reason).then(() => true).catch(() => false)) ? `Successfully muted ${user.tag} ${duration ? `for ${ms(duration, { long: true })}` : 'indefinitely'}` : `Something went wrong trying to mute ${user.tag}`;

    return interaction.reply({
      content: reply,
      ephemeral: true,
    });
  },
});
