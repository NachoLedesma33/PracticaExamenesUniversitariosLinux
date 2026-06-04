import type { CommandHandler } from '../../types';
import { ls } from './ls';
import { cd } from './cd';
import { pwd } from './pwd';
import { mkdir } from './mkdir';
import { touch } from './touch';
import { cat } from './cat';
import { cp } from './cp';
import { mv } from './mv';
import { rm } from './rm';
import { echo } from './echo';
import { grep } from './grep';
import { head } from './head';
import { tail } from './tail';
import { wc } from './wc';
import { sortCmd } from './sort';
import { uniq } from './uniq';
import { cut } from './cut';
import { chmod } from './chmod';
import { find } from './find';
import { which } from './which';
import { whoami } from './whoami';
import { chown } from './chown';
import { clear } from './clear';
import { historyCmd } from './historyCmd';
import { tee } from './tee';
import { less } from './less';
import { rmdir } from './rmdir';
import { more } from './more';

export const commandRegistry: Record<string, CommandHandler> = {};

function register(cmd: CommandHandler) {
  commandRegistry[cmd.name] = cmd;
  if (cmd.aliases) {
    for (const alias of cmd.aliases) {
      commandRegistry[alias] = cmd;
    }
  }
}

register(ls);
register(cd);
register(pwd);
register(mkdir);
register(touch);
register(cat);
register(cp);
register(mv);
register(rm);
register(echo);
register(grep);
register(head);
register(tail);
register(wc);
register(sortCmd);
register(uniq);
register(cut);
register(chmod);
register(find);
register(which);
register(whoami);
register(chown);
register(clear);
register(historyCmd);
register(tee);
register(less);
register(rmdir);
register(more);
