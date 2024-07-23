import React, {useState, useEffect, useLayoutEffect} from 'react';
import { Outlet } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom'
import $ from 'jquery'
import { useDispatch, useSelector } from "react-redux";

import { BP3D } from '../../src/common/blueprint3d';
import { PrivateRoute } from '../routes/privateRoute';
import Rightsiderbar from '../customComponent/sidebar';
import HeaderBar from '../customComponent/header';
import { updateEngineStatesAction } from "../../src/redux/actions/blueprint3d"
import { getMemoizedBlueprint3dData } from "../redux/selectors/blueprint3d"
import { getMemoizedConfigurationData } from "../redux/selectors/configuration"
import { SINGLE_STRUCTURE, FIXED_STRUCTURE, FLOATING_STRUCTURE } from '../../src/common/structure'
import { DataManager } from '../common/utils';
import { getRoomSizeInitiate, updateConfigurationStates } from '../redux/actions/configuration';

let reducerBlueprint = null
export let setdollyInCount = 0
export const ViewTypeContext = React.createContext()
export const updateReducerBlueprintHoc = (data) => { reducerBlueprint = data }

export const forceUpdate = (data) => { setdollyInCount = 0 }
const MainLayout = () => {

  const partitonType = DataManager.getPartitionType()
  const dispatch = useDispatch()
  const { pathname } = useLocation();
  const navigate = useNavigate()
  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const {
    zoomScale3D,
    selectedType
  } = reducerBluePrint

  const reducerConfigurator = useSelector(getMemoizedConfigurationData)
  const {
    roomSizeSuccess
  } = reducerConfigurator

  const configuratorData = useSelector(getMemoizedConfigurationData)
  const {
    toggle3dView,
    newPanels
  } = configuratorData

  let currentStateName = "Design";
  const setCurrentStatesName = (newState) => { return currentStateName = newState }
  const [setCurrentStateOfSideMenu, functionSetCurrentStateOfSideMenu] = useState(null)

  const [blueprint3d, setBlueprint3d] = useState('')

  useEffect(() => {
    document.title = 'Pātishon'

    dispatch(getRoomSizeInitiate())
    console.log("this is type of partition = ", partitonType);
    if (pathname !== '/three' && pathname !== "/payment") {
      const opts = {
        floorplannerElement: "floorplanner-canvas",
        threeElement: "#viewer",
        threeCanvasElement: "three-canvas",
        textureDir: "rooms/textures/",
        widget: false,
      };
      let tempVar = new BP3D.Blueprint3d(opts)
      console.log("this is create instance = ", tempVar?.globals)
      setBlueprint3d(tempVar)
      dispatch(updateEngineStatesAction(tempVar, 'BP3DData'))
    }

  }, [])

  useEffect(() => {
    if (reducerBlueprint?.configurationStep > 2) {
      setCurrentStatesName("Floorplan")
    }
    if (!partitonType) {
      navigate('/')
    }
  }, [reducerBlueprint?.configurationStep])


  const structureForPartition = () => {
    switch (partitonType) {
      case 'single':
        return SINGLE_STRUCTURE

      case 'floating':
        return FLOATING_STRUCTURE

      case 'fixed':
        return FIXED_STRUCTURE

      default:
        break;
    }
  }


  useEffect(() => {
    if (typeof blueprint3d != 'string' && pathname !== '/three') {
      dispatch(updateEngineStatesAction(blueprint3d, 'BP3DData'))
      functionSetCurrentStateOfSideMenu(engine(""));
      // }
      if (typeof blueprint3d != 'string' && blueprint3d?.floorplanner?.floorplan?.walls.length > 0 && roomSizeSuccess) {
        dispatch(updateConfigurationStates(true, 'isMakeDefaultRoom'))
      }
    }

  }, [blueprint3d, roomSizeSuccess])


  /*
   * Loading modal for items
   */
  const modalEffects = (blueprint) => {

    var itemsLoading = 0;


    function update() {
      if (itemsLoading > 0) {
        $("#loading-modal").show();
      } else {
        $("#loading-modal").hide();
      }
    }

    function init() {
      blueprint.model.scene.itemLoadingCallbacks.add(function () {
        itemsLoading += 1;
        update();
      });

      blueprint.model.scene.itemLoadedCallbacks.add(function () {
        itemsLoading -= 1;
        update();
      });

      update();
    }
    init();
    setBlueprint3d(blueprint)
  }

  /*
 * Camera Buttons
 */
  const cameraButtons = (blueprint3d) => {
    var orbitControls = blueprint3d.three.controls;
    var three = blueprint3d.three;

    var panSpeed = 30;
    var directions = {
      UP: 1,
      DOWN: 2,
      LEFT: 3,
      RIGHT: 4,
    };

    function init() {

      // Camera controls
      $("#zoom-in").click(zoomIn);
      $("#zoom-in").on("touchend", zoomIn);
      $("#zoom-out").click(zoomOut);
      $("#zoom-out").on("touchend", zoomOut);

      $("#zoom-in").dblclick(preventDefault);
      $("#zoom-out").dblclick(preventDefault);

      $("#reset-view").click(reset);
      $("#reset-view").on("touchend", reset);

      $("#move-left").click(function () {
        pan(directions.LEFT);
      });
      $("#move-left").on("touchend", function () {
        pan(directions.LEFT);
      });

      $("#move-right").click(function () {
        pan(directions.RIGHT);
      });
      $("#move-right").on("touchend", function () {
        pan(directions.RIGHT);
      });

      $("#move-up").click(function () {
        pan(directions.UP);
      });
      $("#move-up").on("touchend", function () {
        pan(directions.UP);
      });

      $("#move-down").click(function () {
        pan(directions.DOWN);
      });
      $("#move-down").on("touchend", function () {
        pan(directions.DOWN);
      });

      $("#move-left").dblclick(preventDefault);
      $("#move-right").dblclick(preventDefault);
      $("#move-up").dblclick(preventDefault);
      $("#move-down").dblclick(preventDefault);
    }

    function preventDefault(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    function pan(direction) {
      switch (direction) {
        case directions.UP:
          orbitControls.panXY(0, panSpeed);
          break;
        case directions.DOWN:
          orbitControls.panXY(0, -panSpeed);
          break;
        case directions.LEFT:
          orbitControls.panXY(panSpeed, 0);
          break;
        case directions.RIGHT:
          orbitControls.panXY(-panSpeed, 0);
          break;
        default:
          break;
      }
    }

    function reset() {
      three.centerCamera();
      setdollyInCount = 0
      dispatch(updateEngineStatesAction(0, "zoomScale3D"))
    }

    function zoomIn(e) {
      e.stopImmediatePropagation()
      e.preventDefault();
      if (setdollyInCount < 3 && localStorage.getItem("selectedType") === "2D") {
        orbitControls.dollyIn(1.1);
        orbitControls.update();
        setdollyInCount = setdollyInCount + 1
        dispatch(updateEngineStatesAction(setdollyInCount, "zoomScale3D"))
      }
      if (localStorage.getItem("selectedType") === "3D") {
        orbitControls.dollyIn(1.1);
        orbitControls.update();
      }
    }

    function zoomOut(e) {
      // eslint-disable-next-line no-unused-expressions
      e.stopImmediatePropagation()
      e.preventDefault();
      if (setdollyInCount > 0 || localStorage.getItem("selectedType") === "3D") {
        orbitControls.dollyOut(1.1);
        orbitControls.update();
        setdollyInCount = setdollyInCount > 0 ? setdollyInCount - 1 : setdollyInCount
      }
    }

    init();
    setBlueprint3d(blueprint3d)
    // this.setState({ blueprint3d: blueprint3d });
  }

  /*
   * Context menu for selected item
   */
  const contextMenu = (blueprint) => {
    // var scope = this;
    var selectedItem;
    var three = blueprint.three;

    function init() {
      $("#context-menu-delete").click(function (event) {

        selectedItem.remove();
      });
      $("#context-menu-delete").on("touchend", function (event) {
        selectedItem.remove();
      });

      three.itemSelectedCallbacks.add(itemSelected);
      three.itemUnselectedCallbacks.add(itemUnselected);

      initResize();

      $("#fixed").click(function () {

        var checked = $(this).prop("checked");
        selectedItem.setFixed(checked);
      });
    }

    function cmToIn(cm) {
      return cm / 2.54;
    }

    function inToCm(inches) {
      return inches * 2.54;
    }

    function itemSelected(item) {
      selectedItem = item;

      $("#context-menu-name").text(item.metadata.itemName);

      $("#item-width").val(cmToIn(selectedItem.getWidth()).toFixed(0));
      $("#item-height").val(cmToIn(selectedItem.getHeight()).toFixed(0));
      $("#item-depth").val(cmToIn(selectedItem.getDepth()).toFixed(0));
      $("#item-elevation").val(cmToIn(selectedItem.getElevation()).toFixed(0));

      $("texture-context-container").show();
      $("#context-menu").show();

      if (selectedItem.isElevationAdjustable()) {
        $("#item-elevation-div").show();
      } else {
        $("#item-elevation-div").hide();
      }

      $("#fixed").prop("checked", item.fixed);
    }

    function resize() {
      selectedItem.resize(
        inToCm($("#item-height").val()),
        inToCm($("#item-width").val()),
        inToCm($("#item-depth").val())
      );
    }

    function elevate() {
      selectedItem.elevate(inToCm($("#item-elevation").val()));
    }

    function initResize() {
      $("#item-height").change(resize);
      $("#item-width").change(resize);
      $("#item-depth").change(resize);
      $("#item-elevation").change(elevate);
    }

    function itemUnselected() {
      selectedItem = null;
      $("texture-context-container").hide();
      $("#context-menu").hide();
    }

    init();
    setBlueprint3d(blueprint);
  }

  const initItems1 = (blueprint3d, setCurrentState) => {
    // dispatch(updateEngineStatesAction( tab[0]?.id == "update-floorplan" ? "3D" :  '2D', 'selectedType'))
    $("#add-items").find(".add-item").off("click");
    $("#add-items").find(".add-item").click(function (e) {

      var modelUrl = $(this).attr("model-url");
      var itemType = parseInt($(this).attr("model-type"));
      var metadata = {
        itemName: $(this).attr("model-name"),
        resizable: true,
        modelUrl: modelUrl,
        itemType: itemType,
      };

      blueprint3d.model.scene.addItem(itemType, modelUrl, metadata);
      // setCurrentState(
      //   {
      //     div: $("#viewer"),
      //     tab: "",
      //     name: "Design",
      //   },
      //   false
      // );
    });
  }

  // useEffect(() => {
  //   console.log("this is updated = ")
  //   if (reducerBlueprint?.selectedType == "3D") {
  //     floorplanUpdate()
  //   }
  // }, [reducerBlueprint?.selectedType])

  /*
 * Side menu
 */
  const sideMenu = (blueprint, floorplanControls, modalEffects) => {
    // var modalEffects = modalEffectsArg;
    var ACTIVE_CLASS = "active";

    var tabs = {
      FLOORPLAN: $("#floorplan_tab"),
      DESIGN2D: $("#design_2d_tab"),
      BACK2DVIEW: $("#floorplan_tab1"),
      SHOP: $("#items_tab"),
      DESIGN: $("#design_tab"),
    };

    var stateChangeCallbacks = $.Callbacks();

    var states = {
      DEFAULT: {
        div: $("#viewer"),
        tab: tabs.DESIGN,
        name: "Design",
      },
      FLOORPLAN: {
        div: $("#floorplanner"),
        tab: tabs.FLOORPLAN,
        name: "Floorplan",
      },
      FLOORPLAN2: {
        div: $("#floorplanner"),
        tab: tabs.BACK2DVIEW,
        name: "Floorplan2",
      },
      DESIGN2D: {
        div: $("#viewer"),
        tab: tabs.DESIGN2D,
        name: "Design2D",
      }
    };

    // sidebar state
    var currentState = states.FLOORPLAN;

    function init() {
      for (var tab in tabs) {
        var elem = tabs[tab];
        elem.off("click")
        elem.on('click', tabClicked(elem));
      }
      $("#update-floorplan, #update-floorplan2").off('click touched')
      $("#update-floorplan, #update-floorplan2").on('click touchend', () => {
        localStorage.setItem("selectedType", "3D")
        blueprint?.globals?.setGlobal("selectedType", "3D")
        dispatch(updateEngineStatesAction('3D', 'selectedType'))
        // 
        setTimeout(() => {
          setCurrentState(states.DEFAULT)
        }, 100)
      });

      function reset() {
        $("texture-context-container").hide();
        $("#wallTextures").hide();
        $("#floorTexturesDiv").hide();
      }
      stateChangeCallbacks.add(reset);

      initLeftMenu();

      blueprint.three.updateWindowSize();
      // handleWindowResize();

      initItems();
      setCurrentState(states.FLOORPLAN, true);
      localStorage.setItem("selectedType", "2D")
      blueprint?.globals?.setGlobal("selectedType", "2D")

    }

    function tabClicked(tab) {
      return function () {
        localStorage.setItem("selectedType", "2D")
        blueprint?.globals?.setGlobal("selectedType", "2D")
        console.log("this is the tab = ", tab);
        // Stop three from spinning
        initItems();
        blueprint.three.stopSpin();


        // Selected a new tab
        for (var key in states) {
          var state = states[key];

          if (state.tab === tab) {
            setCurrentState(state);
            break;
          }
        }
      };
    }

    var getCurrentState = () => {
      if (currentStateName === "Design") {
        return states.DEFAULT;
      }
      if (currentStateName === "Floorplan") {
        return states.FLOORPLAN;
      }
      if (currentStateName === "Floorplan2") {
        return states.FLOORPLAN2;
      }
      if (currentStateName === "Shop") {
        return states.SHOP;
      }
      if (currentStateName === "Design2D") {
        return states.DESIGN2D;
      }
      return null;
    };

    var updateState = (newState) => {
      console.log("this is the stateeeeee", newState)

      setCurrentStatesName(newState.name)

    };

    const setCurrentState = (newState, firstTime) => {
      currentState = getCurrentState();

      firstTime = firstTime || false;
      console.log("this is the welcum", newState, currentState)

      if (!firstTime && currentState.name === newState.name) {
        return;
      }
      // show the right tab as active
      if (currentState.name !== newState.name) {
        if (currentState.tab != null) {
          currentState.tab.removeClass(ACTIVE_CLASS);
        }
        if (newState.tab != null) {
          newState.tab.addClass(ACTIVE_CLASS);
        }
      }

      if (currentState.name === newState.name) {
        newState.tab.addClass(ACTIVE_CLASS);
      }

      // set item unselected
      if (firstTime || newState.name !== "Design") {
        blueprint.three.getController().setSelectedObject(null);
      }

      // show and hide the right divs
      currentState.div.hide();
      newState.div.show();

      // custom actions
      if (newState.name === states.FLOORPLAN.name) {
        floorplanControls.handleWindowResize();
        floorplanControls.updateFloorplanView();
      }

      if (newState.name === states.DEFAULT.name || newState.name === states.DESIGN2D.name) {
        blueprint.three.updateWindowSize();
      }

      // set new state
      // handleWindowResize();
      currentState = newState;
      updateState(newState);

      blueprint.model.floorplan.update();

      if (newState.name === "Design2D") {
        blueprint.three.controls.enabled = true
      } else {
        blueprint.three.controls.enabled = true
      }
      stateChangeCallbacks.fire(newState);

      //change mobx state-active-tab
    }

    function initLeftMenu() {
      // $(window).resize(handleWindowResize);
      // handleWindowResize();
    }

    var initItems = (tab = {}) => {
      initItems1(blueprint, setCurrentState, tab);
    };

    init();
    setBlueprint3d(blueprint)
    return setCurrentState;
  };




  /*
   * Change floor and wall textures
   */
  const textureSelector = (blueprint3d) => {
    // var scope = this;
    var three = blueprint3d.three;
    // var isAdmin = isAdmin;

    var currentTarget = null;

    function initTextureSelectors() {
      $(".texture-select-thumbnail").off("click");
      $(".texture-select-thumbnail").click(function (e) {
        var textureUrl = $(this).attr("texture-url");
        var textureStretch = $(this).attr("texture-stretch") === "true";
        var textureScale = parseInt($(this).attr("texture-scale"));
        currentTarget.setTexture(textureUrl, textureStretch, textureScale);

        e.preventDefault();
      });
    }

    function init() {
      three.wallClicked.add(wallClicked);
      three.wallClicked.add(initTextureSelectors);
      three.floorClicked.add(floorClicked);
      three.wallClicked.add(initTextureSelectors);
      three.itemSelectedCallbacks.add(reset);
      three.wallClicked.add(initTextureSelectors);
      three.nothingClicked.add(reset);
      three.wallClicked.add(initTextureSelectors);
      // sideMenu.stateChangeCallbacks.add(reset);
      three.wallClicked.add(initTextureSelectors);
      initTextureSelectors();
    }

    function wallClicked(halfEdge) {
      if (currentTarget !== undefined && currentTarget !== null) {
        currentTarget.removeOutline();
      }
      currentTarget = halfEdge;
      currentTarget.drawOutline();
      $("#floorTexturesDiv").hide();
      $("texture-context-container").show();
      $("#wallTextures").show();
      initTextureSelectors();
    }

    function floorClicked(room) {
      if (currentTarget !== undefined && currentTarget !== null) {
        currentTarget.removeOutline();
      }
      currentTarget = room;
      currentTarget.drawOutline();
      $("#wallTextures").hide();
      $("texture-context-container").show();
      $("#floorTexturesDiv").show();
      initTextureSelectors();
    }

    function reset() {
      if (currentTarget !== undefined && currentTarget !== null) {
        currentTarget.removeOutline();
      }
      $("texture-context-container").hide();
      $("#wallTextures").hide();
      $("#floorTexturesDiv").hide();
      initTextureSelectors();
    }

    init();
  }



  const engine = async (viewKey) => {
    /*
     * Floorplanner controls
     */

    const ViewerFloorplanner = () => {
      var canvasWrapper = "#floorplanner";

      // buttons
      var move = "#move";
      var remove = "#delete";
      var draw = "#draw";

      let activeStlye = "btn-primary disabled";

      console.log("this is blue = ", blueprint3d);
      const floorplanner = blueprint3d.floorplanner;
      function init() {
        $(window).resize(handleWindowResize);
        handleWindowResize();

        // mode buttons
        floorplanner.modeResetCallbacks.add(function (mode) {
          $(draw).removeClass(activeStlye);
          $(remove).removeClass(activeStlye);
          $(move).removeClass(activeStlye);
          if (mode === BP3D.Floorplanner.floorplannerModes.MOVE) {
            $(move).addClass(activeStlye);
          } else if (mode === BP3D.Floorplanner.floorplannerModes.DRAW) {
            $(draw).addClass(activeStlye);
          } else if (mode === BP3D.Floorplanner.floorplannerModes.DELETE) {
            $(remove).addClass(activeStlye);
          }

          
          // if (mode === BP3D.Floorplanner.floorplannerModes.DRAW) {
          //   $("#draw-walls-hint").show();
          //   handleWindowResize();
          // } else {
          //   $("#draw-walls-hint").hide();
          // }
        });

        $(move).click(function () {

          floorplanner.setMode(BP3D.Floorplanner.floorplannerModes.MOVE);
        });

        $(draw).click(function () {

          floorplanner.setMode(BP3D.Floorplanner.floorplannerModes.DRAW);
        });

        $(remove).on('click', function () {
          floorplanner.setMode(
            BP3D.Floorplanner.floorplannerModes.DELETE
          );
        });
      }

      const updateFloorplanView = () => {
        floorplanner.reset();
      };

      const handleWindowResize = () => {
        $(canvasWrapper).height(
          // $(".header_list"); 
          window.innerHeight - $(canvasWrapper).offset().top - 20
        );
        $(".horizontal-container").height(
          // $(".header_list"); 
          window.innerHeight - $(canvasWrapper).offset().top - 20
        );

        floorplanner.resizeView();
      };

      init();
      return { floorplanner, updateFloorplanView, handleWindowResize }
    };

    /*
     * Initialize!
     */
    modalEffects(blueprint3d);
    console.log("this = ", blueprint3d);

    cameraButtons(blueprint3d)

    // eslint-disable-next-line no-unused-vars
    contextMenu(blueprint3d);
    let setCurrentStateOfSide = sideMenu(
      blueprint3d,
      ViewerFloorplanner(),
      modalEffects
    );
    let textureSelector2 = textureSelector(
      blueprint3d,
      sideMenu
    );
    blueprint3d.model.loadSerialized(structureForPartition());
    return setCurrentStateOfSide
  }


  useEffect(() => {
    if (newPanels.length > 0) {
      $("#update-floorplan, #update-floorplan2").click();
    }
  }, [configuratorData.toggle3dView]);

  return (
    <ViewTypeContext.Provider value={[blueprint3d, setBlueprint3d]}>
      <div className='wrapper_main'>
        <HeaderBar />
        {pathname !== '/three' && <Rightsiderbar blueprint3d={[blueprint3d, setBlueprint3d]} stepValue={1} setCurrentStateOfSideMenu={setCurrentStateOfSideMenu} />}
        <PrivateRoute>
          <Outlet context={[blueprint3d, setBlueprint3d, currentStateName]} />
        </PrivateRoute>
      </div>
    </ViewTypeContext.Provider>
  )
}

export default MainLayout
