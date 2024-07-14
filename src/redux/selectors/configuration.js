import { createSelector } from 'reselect'

export const getMemoizedConfigurationData = createSelector(
  (state) => state.configuration,
  (configurationState) => {
    const {
      roomLength,
      roomBreath,
      panelPricePerMm,
      perPanelPrice,
      roomSizeLoader,
      roomSizeSuccess,
      isMakeDefaultRoom,
      roomLengthAPI,
      roomBreathAPI,
      roomHeight,
      partitionWallLength,
      partitionLeftWallLength,
      partitionRightWallLength,
      maxValueOfLengthBottomFloating,
      maxValueOfLengthTopFloating,
      movedBottomCornerToTop,
      movedTopCornerToBottom,
      totalPrice,
      numberOfhorizontalFrames,
      doorChannels,
      doorHinges,
      doorHandles,
      films,
      hingeLoader,
      step3HandleApply,
      placeOrderLoader,
      placeOrderSuccess,
      pdfUrl,
      skipThirdStep,
      glassCovering,
      clientWallWidth,
      newDoor,
      newPanels
    } = configurationState

    return {
      roomLength,
      roomBreath,
      panelPricePerMm,
      perPanelPrice,
      roomSizeLoader,
      roomSizeSuccess,
      isMakeDefaultRoom,
      roomLengthAPI,
      roomBreathAPI,
      roomHeight,
      partitionWallLength,
      partitionRightWallLength,
      partitionLeftWallLength,
      maxValueOfLengthBottomFloating,
      maxValueOfLengthTopFloating,
      movedBottomCornerToTop,
      movedTopCornerToBottom,
      totalPrice,
      numberOfhorizontalFrames,
      doorChannels,
      doorHinges,
      doorHandles,
      films,
      hingeLoader,
      step3HandleApply,
      placeOrderLoader,
      placeOrderSuccess,
      pdfUrl,
      skipThirdStep,
      glassCovering,
      clientWallWidth,
      newDoor,
      newPanels
    }
  }
)