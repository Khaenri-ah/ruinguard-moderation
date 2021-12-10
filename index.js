import { Module } from '@ruinguard/core';
import { getDir } from 'file-ez';
import models from './models.js';

export default await new Module({
  commands: getDir('commands').path,
  events: getDir('events').path,
  intents: [1<<0],
  options: {
    mongoose: { models }
  }
});
