import { Command } from '@ruinguard/core';

export default new Command({
  data: {
    name: 'userinfo',
    description: 'shows info about a user',
    options: [
      {
        type: 6,
        name: 'member',
        description: 'the member you want information on, defaults to yourself',
      },
    ],
  },

  async run(interaction) {
    const user = interaction.options.getUser('user')??interaction.user;
    await user.fetch(true);
    return interaction.markdown(`
      tmb:${user.displayAvatarURL({ dynamic: true, format: 'png', size: 512 })}
      clr:0x${user.accentColor.toString(16)}
      ::# ${user.tag}
      #-User ID
      ${user.id}
    `);
  },
});
