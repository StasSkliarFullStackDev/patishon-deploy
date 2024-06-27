import { engineAction } from "../actionTypes";

const initialState = {
  BP3DSuccess: false,
  BP3DLoader: false,
  BP3DData: null,
  selectedType: '2D',
  deviceType: null,
  sidebarCollapsed: true,
  perCmEqualToMm: 0,
  configurationStep: 0,
  numberOfPanels: 0,
  numberOfPanelsRight: 0,
  selectedPanelSize: 900,
  selectedPanelSizeRight: 900,
  indicatorFont : null,
  zoomScale3D:0,
  doorChannelTabSelected: "1",
  selectedDoorSize: null,
  configuration2D: {
    isZoomIn: false,
    zoomScale: 1,
    partitionType: 'vertical',
    connectWith: 'top',
    partionHeightAdjustFrom: 'topToBottom',
    minimumWallLength: 40.0156 //this value for minimumWall length check and also max distance from partition wall to opposite wall
  },
  importedModels: {
    handle: [],
    hinge: null
  },
  importedTextures: {
    film: []
  },
  environmentMap: null,
  infoPopUp: false
};

export default function blueprint3dModule(
  state = initialState,
  { payload, type, key }
) {
  switch (type) {
    case engineAction.ENGINE_LOAD_INITIATE:
      return {
        ...state,
        BP3DLoader: true,
        BP3DSuccess: false,
      };

    case engineAction.ENGINE_LOAD_SUCCESS:
      return {
        ...state,
        BP3DLoader: false,
        BP3DData: payload,
        BP3DSuccess: true,
      };

    case engineAction.ENGINE_LOAD_FAILURE:
      return {
        ...state,
        BP3DLoader: false,
      };

    case engineAction.UPDATE_ENGINE_STATE:
      if (typeof (key) == 'object') {
        state[key[0]][key[1]] = payload
      } else {
        state[key] = payload
      }
      return { ...state, }

    default:
      return state;
  }
}
