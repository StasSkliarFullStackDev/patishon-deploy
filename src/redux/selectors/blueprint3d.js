import { createSelector } from 'reselect'

export const getMemoizedBlueprint3dData = createSelector(
    (state) => state.blueprint3d,
    (blueprint3dState) => {
        const {
            BP3DData,
            BP3DLoader,
            selectedType,
            sidebarCollapsed,
            deviceType,
            perCmEqualToMm,
            configuration2D,
            partitionType,
            configurationStep,
            numberOfPanels,
            numberOfPanelsRight,
            indicatorFont,
            zoomScale3D,
            selectedPanelSize,
            selectedPanelSizeRight,
            doorChannelTabSelected,
            selectedDoorSize,
            importedModels,
            importedTextures,
            environmentMap,
            infoPopUp
        } = blueprint3dState

        return {
            BP3DData,
            BP3DLoader,
            selectedType,
            sidebarCollapsed,
            deviceType,
            perCmEqualToMm,
            configuration2D,
            partitionType,
            configurationStep,
            numberOfPanels,
            numberOfPanelsRight,
            indicatorFont,
            zoomScale3D,
            selectedPanelSize,
            selectedPanelSizeRight,
            doorChannelTabSelected,
            selectedDoorSize,
            importedModels,
            importedTextures,
            environmentMap,
            infoPopUp
        }
    }
)