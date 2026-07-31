import type { CommandHandler } from '../../types';

const PRINTERS = [
  'HP_LaserJet_Pro_M404 -idle -accepting-jobs -device-uri://localhost:631/ipp/print/HP_LaserJet_Pro_M404',
  'Epson_L3150 -idle -accepting-jobs -device-uri://localhost:631/ipp/print/Epson_L3150',
  'Xerox_WorkCentre -processing -accepting-jobs -device-uri://localhost:631/ipp/print/Xerox_WorkCentre',
];

export const lpstat: CommandHandler = {
  name: 'lpstat',
  execute: (args, flags) => {
    if (flags.includes('-p') || flags.includes('-a') || (args.length === 0 && flags.length === 0)) {
      return {
        stdout: PRINTERS.join('\n') + '\n',
        stderr: '',
        exitCode: 0,
      };
    }

    if (flags.includes('-t')) {
      return {
        stdout: 'scheduler is running\n' + PRINTERS.map(p => `printer ${p.split(' -')[0]} is idle`).join('\n') + '\n',
        stderr: '',
        exitCode: 0,
      };
    }

    if (flags.includes('-d')) {
      return { stdout: 'system default destination: HP_LaserJet_Pro_M404\n', stderr: '', exitCode: 0 };
    }

    return { stdout: '', stderr: 'lpstat: opción no soportada', exitCode: 1 };
  },
};
