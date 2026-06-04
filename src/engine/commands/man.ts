import type { CommandHandler } from '../../types';
export const man: CommandHandler = {
  name: 'man',
  execute: (args) => {
    const topic = args[0] || 'general';
    return {
      stdout: `Manual page for: ${topic}\n\nNo hay entrada manual para "${topic}".\n`,
      stderr: '',
      exitCode: 0,
    };
  },
};
