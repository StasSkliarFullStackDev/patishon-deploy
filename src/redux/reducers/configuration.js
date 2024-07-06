import { configurationAction } from "../actionTypes";

const initialState = {
  roomLength: 457.36,
  roomBreath: 457.36,
  roomLengthAPI: 0,
  roomBreathAPI: 0,
  roomSizeLoader: false,
  roomSizeSuccess: false,
  isMakeDefaultRoom: false,
  roomHeight: 1500,
  partitionWallLength: 0,
  partitionLeftWallLength: 0,
  partitionRightWallLength: 0,
  maxValueOfLengthBottomFloating: 0,
  maxValueOfLengthTopFloating: 0,
  movedBottomCornerToTop: 0,
  movedTopCornerToBottom: 0,
  panelPricePerMm: 0,
  perPanelPrice: 0,
  totalPrice: 0,
  numberOfhorizontalFrames: 1,
  selectedMetalFrameType: "",
  doorChannels: [],
  doorHinges: [],
  doorHandles: [],
  films: [],
  hingeLoader: false,
  step3HandleApply: false,
  placeOrderLoader: false,
  placeOrderSuccess: false,
  pdfUrl: null,
  skipThirdStep: false,
  glassCovering: 'clear',
  clientWallWidth: 0
};

export default function configurationModule(
  state = initialState,
  { payload, type, key }
) {
  switch (type) {

    case configurationAction.GET_ROOM_SIZE_INITIATE:
      return {
        ...state,
        roomSizeLoader: true,
        roomSizeSuccess: false,
      };

    case configurationAction.GET_ROOM_SIZE_SUCCESS:
      payload?.globals?.setGlobal("frameTypes", payload?.frameType)
      payload?.globals?.setGlobal("frameVariants", payload?.frameVariant)
      payload?.globals?.setGlobal("doorHandles", payload?.doorHandles)
      payload?.globals?.setGlobal("films", payload?.films)
      for (const i of payload?.frameVariant) {
        if (i.isDefault) {
          payload?.globals?.setGlobal("selectedColorVariant", i.type)
        }
      }

      return {
        ...state,
        roomSizeLoader: false,
        roomLengthAPI: payload?.length,
        roomBreathAPI: payload?.breadth,
        roomSizeSuccess: true,
        panelPricePerMm: payload?.panelPricePermm,
        perPanelPrice: payload?.perPanelPrice,
        doorChannels: payload?.doorchannels,
        doorHinges: payload?.doorHinges,
        doorHandles: payload?.doorHandles,
        films: payload?.films
      };

    case configurationAction.GET_ROOM_SIZE_FAILURE:
      return {
        ...state,
        roomSizeLoader: false,
      };

    case configurationAction.GET_HINGES_INITIATE:
      return {
        ...state,
        hingeLoader: true
      };

    case configurationAction.GET_HINGES_SUCCESS:
      return {
        ...state,
        hingeLoader: false,
      };

    case configurationAction.GET_HINGES_FAILURE:
      return {
        ...state,
        hingeLoader: false,
      };

    case configurationAction.PLACE_ORDER_INITIATE:
      return {
        ...state,
        placeOrderLoader: true
      };

    case configurationAction.PLACE_ORDER_SUCCESS:

      return {
        ...state,
        placeOrderLoader: false,
        placeOrderSuccess: true,
        pdfUrl: payload
      };

    case configurationAction.PLACE_ORDER_FAILURE:
      return {
        ...state,
        placeOrderLoader: false,
        placeOrderSuccess: false
      };


    case configurationAction.UPDATE_CONFIGURATION_STATE:
      state[key] = payload
      return { ...state, }

    default:
      return state;
  }
}
