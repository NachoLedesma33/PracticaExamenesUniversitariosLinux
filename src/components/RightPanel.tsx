import { VFSExplorer } from './VFSExplorer';
import { InodeInspector } from './InodeInspector';

export function RightPanel() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <VFSExplorer />
      <div className="border-t border-surface-700/50" />
      <div className="flex-1 overflow-y-auto min-h-0">
        <InodeInspector />
      </div>
    </div>
  );
}
