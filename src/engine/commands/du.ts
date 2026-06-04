import type { CommandHandler } from '../../types';
export const du: CommandHandler = {
  name: 'du',
  execute: (args, flags) => {
    const target = args[0] || '.';
    const human = flags.includes('-h');
    const output = human
      ? `4.0K\t${target}/file1\n8.0K\t${target}/file2\n12.0K\t${target}/dir1\n16.0K\t${target}`
      : `4\t${target}/file1\n8\t${target}/file2\n12\t${target}/dir1\n24\t${target}`;
    return { stdout: output + '\n', stderr: '', exitCode: 0 };
  },
};
