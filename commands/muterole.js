import { Command } from '@ruinguard/core';

export default new Command({
  data: {
    name: 'muterole',
    description: 'change the muterole for this server',
    options: [
      {
        type: 8,
        name: 'role',
        description: 'the role that should be the muterole',
        required: true,
      },
    ],
  },
  flags: [1<<1],
  permissions: { user: [1n<<28n] },

  async run(interaction) {
    await interaction.client.db.Config.updateOne({ guild: interaction.guild.id }, { muterole: interaction.options.getRole('role').id }, { upsert: true });
    return interaction.reply({
      content: 'muterole updated!',
      ephemeral: true,
    });
  },
});
