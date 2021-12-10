import { Command } from '@ruinguard/core';

export default new Command({
  data: {
    name: 'unmute',
    description: 'unmute a user',
    options: [
      {
        type: 6,
        name: 'user',
        description: 'the user you want to unmute',
        required: true,
      }, {
        type: 3,
        name: 'reason',
        description: 'why you are unmuting this user',
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

    if (member && interaction.channel.permissionsFor(member).has([1n<<13n]) && member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: 'Sorry, you can\'t unmute that user.',
        ephemeral: true,
      });
    }

    await interaction.client.db.Mute.deleteOne({ user: user.id });

    const doc = await interaction.client.db.Config.findOne({ guild: interaction.guild.id });
    const reply = (!member || await member.roles.remove(doc?.muterole, reason).then(() => true).catch(() => false)) ? `Successfully unmuted ${user.tag}` : `Something went wrong trying to unmute ${user.tag}`;

    return interaction.reply({
      content: reply,
      ephemeral: true,
    });
  },
});
