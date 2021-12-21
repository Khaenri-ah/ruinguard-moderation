import { Command } from '@ruinguard/core';

export default new Command({
  data: {
    name: 'kick',
    description: 'kick a user',
    options: [
      {
        type: 6,
        name: 'user',
        description: 'the user you want to kick',
        required: true,
      }, {
        type: 3,
        name: 'reason',
        description: 'why you are kicking this user',
        required: false,
      },
    ],
  },
  flags: [1<<1],
  permissions: {
    user: [1n<<1n],
    self: [1n<<1n],
  },

  async run(interaction) {
    const user = await interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => {});
    if (!member) {
      return interaction.reply({
        content: 'Sorry, I couldn\'t find that member',
        ephemeral: true,
      });
    }
    const reason = interaction.options.getString('reason', false) || `kicked by ${interaction.user.id}`;

    if (member && interaction.channel.permissionsFor(member).has([1n<<1n]) && member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: 'Sorry, you can\'t kick that user.',
        ephemeral: true,
      });
    }
    if (member && !member.kickable) {
      return interaction.reply({
        content: 'Sorry, I can\'t kick that user.',
        ephemeral: true,
      });
    }

    /* TODO: change back when markdown parser is done
    ::# You've been kicked from ${interaction.guild.name}
    reason: ${reason}
    */
    await user.send(interaction.embed({
      title: `You've been kicked from ${interaction.guild.name}`,
      description: `reason: ${reason}`,
    }, { splash: false }).toMsg()).catch(() => {});

    const success = await interaction.guild.members.kick(user, { reason }).catch(() => {});

    if (success) {
      interaction.client.emit('moderation:kick', {
        guild: interaction.guild,
        offender: user,
        moderator: interaction.user,
        timestamp: Date.now(),
        reason,
      });
    }

    return interaction.reply({
      content: success
        ? `Successfully kicked ${user.tag}`
        : `Something went wrong trying to kick ${user.tag}`,
      ephemeral: true,
    });
  },
});
