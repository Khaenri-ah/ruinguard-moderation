import { Command } from '@ruinguard/core';

export default new Command({
  data: {
    name: 'ban',
    description: 'ban a user',
    options: [
      {
        type: 6,
        name: 'user',
        description: 'the user you want to ban',
        required: true,
      }, {
        type: 3,
        name: 'reason',
        description: 'why you are banning this user',
        required: false,
      },
    ],
  },
  flags: [1<<1],
  permissions: {
    user: [1n<<2n],
    self: [1n<<2n],
  },

  async run(interaction) {
    const user = await interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => {});
    const reason = interaction.options.getString('reason', false) || `banned by ${interaction.user.id}`;

    if (member && interaction.channel.permissionsFor(member).has([1n<<2n]) && member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: 'Sorry, you can\'t ban that user.',
        ephemeral: true,
      });
    }
    if (member && !member.bannable) {
      return interaction.reply({
        content: 'Sorry, I can\'t ban that user.',
        ephemeral: true,
      });
    }

    if (member) {
      /* TODO: change back when markdown parser is done
      ::# You've been banned from ${interaction.guild.name}
      reason: ${reason}
      */
      await user.send(interaction.embed({
        title: `You've been banned from ${interaction.guild.name}`,
        description: `reason: ${reason}`,
      }, { splash: false })).catch(() => {});
    }

    const success = await interaction.guild.members.ban(user, { reason }).catch(() => {});

    if (success) {
      interaction.client.emit('moderation:ban', {
        guild: interaction.guild,
        offender: user,
        moderator: interaction.user,
        timestamp: Date.now(),
        reason,
      });
    }

    return interaction.reply({
      content: success
        ? `Successfully banned ${user.tag}`
        : `Something went wrong trying to ban ${user.tag}`,
      ephemeral: true,
    });
  },
});
