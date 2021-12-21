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
    user: [1n<<40n],
    self: [1n<<40n],
  },

  async run(interaction) {
    const user = await interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => {});
    const reason = interaction.options.getString('reason', false) || `unmuted by ${interaction.user.id}`;

    if (member && interaction.channel.permissionsFor(member).has([1n<<13n]) && member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: 'Sorry, you can\'t unmute that user.',
        ephemeral: true,
      });
    }

    // eslint-disable-next-line camelcase
    const success = await interaction.client.api.guilds(interaction.guild.id).members(user.id).patch({ reason, data: { communication_disabled_until: null } }).catch(() => {});

    if (success) {
      interaction.client.emit('moderation:unmute', {
        guild: interaction.guild,
        offender: user,
        moderator: interaction.user,
        timestamp: Date.now(),
        reason,
      });
    }

    return interaction.reply({
      content: success
        ? `Successfully unmuted ${user.tag}`
        : `Something went wrong trying to unmute ${user.tag}`,
      ephemeral: true,
    });
  },
});
