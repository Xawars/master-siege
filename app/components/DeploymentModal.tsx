import { useRef, useEffect } from 'react';
import { Check, X, Swords, ShieldHalf } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { OperatorDisplay } from './OperatorDisplay';
import { Operator, Loadout, Platform } from '../data/types';

interface DeploymentModalProps {
    isOpen: boolean;
    operator: Operator | null;
    loadout: Loadout | null;
    matchType?: string | null;
    platform?: Platform | null;
    targetKills?: number;
    role?: string;
    onAccept: () => void;
    onReject: () => void;
}

export function DeploymentModal({ isOpen, operator, loadout, matchType, platform, targetKills, role, onAccept, onReject }: DeploymentModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onReject();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onReject]);

    if (!isOpen || !operator) return null;

    const isAttacker = operator.side === 'attacker';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className="relative bg-zinc-900 border border-zinc-700/50 rounded-lg shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 slide-in-from-bottom-4"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-brand-500 uppercase tracking-wider">
                        Confirm Deployment
                    </h2>
                    <Button variant="ghost" size="sm" onClick={onReject} icon={X}>
                        <span className="sr-only">Close</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col items-center">
                    {/* Info badges */}
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        <Badge variant={isAttacker ? 'attack' : 'defense'} size="sm" className="gap-1.5">
                            {isAttacker ? <Swords className="w-3 h-3" aria-hidden="true" /> : <ShieldHalf className="w-3 h-3" aria-hidden="true" />}
                            {isAttacker ? 'Attacker' : 'Defender'}
                        </Badge>
                        {matchType && <Badge variant="default" size="sm">{matchType}</Badge>}
                        {platform && <Badge variant="default" size="sm">{platform}</Badge>}
                        {targetKills && targetKills > 0 && (
                            <Badge variant="success" size="sm">{`Target: ${targetKills} Kills`}</Badge>
                        )}
                        {role && <Badge variant="warning" size="sm">{role}</Badge>}
                    </div>

                    {/* Operator card */}
                    <div className="w-full mb-4">
                        <OperatorDisplay
                            operator={operator}
                            loadout={loadout}
                            isRolling={false}
                            targetKills={targetKills}
                            operatorKills={0}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <Button
                            onClick={onReject}
                            variant="outline"
                            className="flex-1"
                            icon={X}
                        >
                            Reject
                        </Button>
                        <Button
                            onClick={onAccept}
                            variant="primary"
                            className="flex-1"
                            icon={Check}
                        >
                            Deploy Operator
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

