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
        required: true,
      }, {
        type: 3,
        name: 'reason',
        description: 'why you are muting this user',
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
    const reason = interaction.options.getString('reason', false) || `muted by ${interaction.user}`;
    const duration = ms(interaction.options.getString('duration')||' ');

    if (member && interaction.channel.permissionsFor(member).has([1n<<13n]) && member.roles.highest.position >= interaction.member.roles.highest.position) {
      return interaction.reply({
        content: 'Sorry, you can\'t mute that user.',
        ephemeral: true,
      });
    }

    if (duration > 4 * 7 * 24 * 3_600_000) {
      return interaction.reply({
        content: 'Sorry, you can\'t mute for longer than 4 weeks',
        ephemeral: true,
      });
    }

    if (member) {
      /* TODO: change back when markdown parser is done
      ::# You've been muted in ${interaction.guild.name}
      reason: ${reason}
      duration: ${duration ? ms(duration, { long: true }) : 'indefinitely'}
      */
      await user.send(interaction.embed({
        title: `You've been muted in ${interaction.guild.name}`,
        description: `reason: ${reason}\nduration: ${duration ? ms(duration, { long: true }) : 'indefinitely'}`,
      }, { splash: false }).toMsg()).catch(() => {});
    }

    // eslint-disable-next-line camelcase
    const success = await interaction.client.api.guilds(interaction.guild.id).members(user.id).patch({ reason, data: { communication_disabled_until: new Date(Date.now() + duration) } }).catch(() => {});

    if (success) {
      interaction.client.emit('moderation:mute', {
        guild: interaction.guild,
        offender: user,
        moderator: interaction.user,
        timestamp: Date.now(),
        reason, duration,
      });
    }

    return interaction.reply({
      content: success
        ? `Successfully muted ${user.tag} ${duration ? `for ${ms(duration, { long: true })}` : 'indefinitely'}`
        : `Something went wrong trying to mute ${user.tag}`,
      ephemeral: true,
    });
  },
});
