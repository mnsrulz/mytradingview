'use client'

import { useState } from 'react'
import { Position, PositionPayload } from '@/lib/types'
import { HoldingsToolbar } from './HoldingsToolbar'
import { PositionsDataGrid } from './PositionsTable'
import { PositionsPieChart } from './PositionsPieChart'
import { PositionFormDialog } from './PositionFormDialog'
import { usePortfolio } from '@/lib/usePortfolio'
import { HoldingsSummary } from './HoldingsSummary'
import { useDialogs } from '@toolpad/core'

export const Portfolio = () => {
    const { accounts, aggregatedPositions, isLoading, reloadAccounts, reloadPositions, deletePosition, addPosition, updatePosition, addAccount, selectedAccountId, changeAccountFilter } = usePortfolio();
    const [viewMode, setViewMode] = useState<'table' | 'pie'>('table')

    const dialog = useDialogs();

    const handleEdit = async (position?: PositionPayload) => {
        const result = await dialog.open(PositionFormDialog, {
            accounts: accounts,
            position: position,
            onAdd: addPosition,
            onUpdate: updatePosition
        });
        if (result) {
            await reloadPositions();
        }
    }

    return (
        <>
            <HoldingsToolbar
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                onAccountChange={changeAccountFilter}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onAddPosition={() => handleEdit()}
                onAddAccount={addAccount}
                onRefresh={reloadAccounts}
            />
            <HoldingsSummary positions={aggregatedPositions} mode={selectedAccountId ? 'account' : 'portfolio'} />

            {viewMode === 'pie' ? (
                <PositionsPieChart
                    positions={aggregatedPositions}
                />
            ) : (
                <PositionsDataGrid
                    loading={isLoading}
                    aggregatedPositions={aggregatedPositions}
                    onEdit={handleEdit}
                    onDelete={deletePosition}
                    onDeleted={reloadPositions}
                />
            )}
        </>
    )
}
