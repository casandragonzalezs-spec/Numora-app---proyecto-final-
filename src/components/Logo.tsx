/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrendingUp } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 font-sans font-semibold text-xl tracking-tight text-neutral-900" id="numora-logo">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 text-white shadow-sm">
        <TrendingUp size={18} />
      </div>
      <span>Numora</span>
    </div>
  );
}
