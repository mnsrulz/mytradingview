'use client'

import { useState } from 'react'
import { Position } from '@/lib/types'
import { HoldingsToolbar } from './HoldingsToolbar'
import { PositionsTable } from './PositionsTable'
import { PositionsPieChart } from './PositionsPieChart'
import { PositionFormDialog } from './PositionFormDialog'
import { usePortfolio } from '@/lib/usePortfolio'

export const Portfolio = () => {
    const { accounts, positions, isLoading, reloadAccounts, reloadPositions } = usePortfolio();

    const [selectedAccountId, setSelectedAccountId] = useState<string>('')
    const [viewMode, setViewMode] = useState<'table' | 'pie'>('table')

    const [editingPosition, setEditingPosition] = useState<Position | null>(null)
    const [positionFormOpen, setPositionFormOpen] = useState(false)

    return (
        <>
            <HoldingsToolbar
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onAccountChange={setSelectedAccountId}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onAddPosition={() => {
                    setEditingPosition(null)
                    setPositionFormOpen(true)
                }}
                onRefresh={reloadAccounts}
            />

            {viewMode === 'pie' ? (
                <PositionsPieChart
                    positions={positions}
                    selectedAccountId={selectedAccountId}
                />
            ) : (
                <PositionsTable
                    loading={isLoading}
                    positions={positions}
                    selectedAccountId={selectedAccountId}
                    onEdit={pos => {
                        setEditingPosition(pos)
                        setPositionFormOpen(true)
                    }}
                    onDeleted={reloadPositions}
                />
            )}

            <PositionFormDialog
                open={positionFormOpen}
                onClose={() => setPositionFormOpen(false)}
                position={editingPosition}
                accounts={accounts}
                onSaved={reloadPositions}
                defaultAccountId={selectedAccountId}
            />
        </>
    )
}
