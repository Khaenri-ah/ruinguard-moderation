import { Command } from '@ruinguard/core';

export default new Command({
  data: {
    name: 'unban',
    description: 'unban a user',
    options: [
      {
        type: 6,
        name: 'user',
        description: 'the user you want to unban',
        required: true,
      }, {
        type: 3,
        name: 'reason',
        description: 'why you are unbanning this user',
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
    const reason = interaction.options.getString('reason', false)||'no reason provided';

    const reply = await interaction.guild.members.unban(user, { reason }).then(() => `Successfully unbanned ${user.tag}`).catch(() => `Something went wrong trying to unban ${user.tag}`);

    return interaction.reply({
      content: reply,
      ephemeral: true,
    });
  },
});
