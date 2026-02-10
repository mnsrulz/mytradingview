'use client'

import { useState } from 'react'
import { Position } from '@/lib/types'
import { HoldingsToolbar } from './HoldingsToolbar'
import { PositionsDataGrid } from './PositionsTable'
import { PositionsPieChart } from './PositionsPieChart'
import { PositionFormDialog } from './PositionFormDialog'
import { usePortfolio } from '@/lib/usePortfolio'

export const Portfolio = () => {
    const { accounts, positions, isLoading, reloadAccounts, reloadPositions, deletePosition, addPosition, updatePosition, addAccount } = usePortfolio();

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
                onAddAccount={addAccount}
                onRefresh={reloadAccounts}
            />

            {viewMode === 'pie' ? (
                <PositionsPieChart
                    positions={positions}
                    selectedAccountId={selectedAccountId}
                />
            ) : (
                <PositionsDataGrid
                    loading={isLoading}
                    positions={positions}
                    selectedAccountId={selectedAccountId}
                    onEdit={pos => {
                        setEditingPosition(pos)
                        setPositionFormOpen(true)
                    }}
                    onDelete={deletePosition}
                    onDeleted={reloadPositions}
                />
            )}

            <PositionFormDialog
                open={positionFormOpen}
                onClose={() => setPositionFormOpen(false)}
                position={editingPosition}
                accounts={accounts}
                onSaved={reloadPositions}
                onAdd={addPosition}
                onUpdate={updatePosition}
                defaultAccountId={selectedAccountId}
            />
        </>
    )
}
