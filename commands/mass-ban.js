import { Command } from '@ruinguard/core';

export default new Command({
  data: {
    name: 'mass-ban',
    description: 'mass bans given list of IDs',
    options: [
      {
        type: 3,
        name: 'ids',
        description: 'list of IDs',
        required: true,
      },
      {
        type: 3,
        name: 'reason',
        description: 'why you are banning these users',
      },
    ],
  },
  flags: [1<<1],
  permissions: {
    user: [1n<<2n],
    self: [1n<<2n],
  },

  async run(interaction) {
    await interaction.deferReply();

    // set removes duplicates
    const ids = new Set(interaction.options.getString('ids').split(/\D+/));
    const reason = interaction.options.getString('reason', false)|| `mass banned by ${interaction.user.id}`;

    const success = [];
    const fail = [];
    for (const id of ids) {
      await interaction.guild.members.ban(id, { reason })
        .then(() => success.push(id))
        .catch(() => fail.push(id));
    }

    interaction.client.emit('moderation:massBan', {
      guild: interaction.guild,
      offenders: ids,
      moderator: interaction.user,
      timestamp: Date.now(),
      success, fail, reason,
    });

    return interaction.edit({
      content: `
        banned ${success.length} users
        failed to ban ${fail.length} users
      `,
      ephemeral: true,
    });
  },
});