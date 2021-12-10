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
        description: 'Enter a common reason. (Default is Banned by <you> on <today>)',
      },
    ],
  },
  flags: [1<<1],
  permissions: {
    user: [1n<<3n],
    self: [1n<<2n],
  },

  async run(interaction) {
    await interaction.deferReply();

    // set removes duplicates
    const ids = new Set(interaction.options.getString('ids').split(/\D+/));
    const reason = interaction.options.getString('reason', false)|| `Banned by ${interaction.user.tag} on ${new Date().toLocaleDateString()}`;

    let valid = 0;
    let invalid = 0;
    for (const id of ids) {
      await interaction.guild.members.ban(id, { reason })
        .then(() => valid++)
        .catch(() => invalid++);
    }
    return interaction.edit({
      content: `
        banned ${valid} users
        failed to ban ${invalid} users
      `,
      ephemeral: true,
    });
  },
});
