import React, { useState, useEffect, useLayoutEffect } from 'react'
import Icon, {
  ArrowDownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  HomeOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";

import Breadcrumbs from '../../customComponent/breadcrumbs';
import Loading from '../../customComponent/loader'
import { ViewTypeContext } from '../../hoc/mainLayout'
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d"
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d"
import { getRoomSizeInitiate, updateConfigurationStates } from '../../redux/actions/configuration';

const View2D = (props) => {
  const {
    dispatch,
    zoomScale,
    isZoomIn,
    BP3DData
  } = props
  return (
    <div className="horizontal-container">

      {/* <div className="sidebar">
        <div>
          <ul className="nav nav-sidebar vertical-container">
            <li id="floorplan_tab">
              <button
                placement="right"
              >
                Edit FloorPlan
              </button>
            </li>
            <li id="design_tab">
              <button
                placement="right"
              >
                Design
              </button>
            </li>
            <li id="items_tab">
              <button
                placement="right"
              >
                Items
              </button>
            </li>
          </ul>
        </div>
        <div>
          <ul className="nav nav-sidebar vertical-container">
            <li>
              <button
                placement="right"
              >
                New Plain
              </button>
            </li>
          </ul>
        </div>
      </div> */}
      <div id="texture-context-container">
        {/* Context Menu */}
        <div id="context-menu">
          {/* <ContextMenu /> */}
        </div>
        {/* Floor Textures */}
        <div id="floorTexturesDiv" style={{ display: "none" }}>
          {/* <FloorTextureList loggedIn={store.getLoggedIn} /> */}
        </div>

        {/* Wall Textures */}
        <div id="wallTextures" style={{ display: "none" }}>
          {/* <WallTextureList loggedIn={store.getLoggedIn} /> */}
        </div>
      </div>
      {/* End Left Column */}

      {/* Right Column */}
      <div className="right-container">
        {/* 3D Viewer */}
        <div id="viewer">
          <div id={(BP3DData?.globals?.getGlobal("selectedStep") == '3' && BP3DData?.globals?.getGlobal("selectedType") == "2D") ? "draw-walls-hint_2d" : "draw-walls-hint_3d"}>
            {(BP3DData?.globals?.getGlobal("selectedStep") == '3' && BP3DData?.globals?.getGlobal("selectedType") == "2D") ? "Drag your door into the correct position on the Pātishon" : "This model is a close representation it is not completely accurate"}
          </div>
          <div id="camera-controls">
            <button
              id="zoom-out"
              className={"basic-button"}
            >
              <ZoomOutOutlined />
            </button>
            <button
              id="reset-view"
              className={"basic-button"}
            >
              <HomeOutlined />
            </button>
            <button
              id="zoom-in"
              className={"basic-button"}
            >
              <ZoomInOutlined />
            </button>

            {/* <button
              id="move-left"
              className={"basic-button"}
            >
              <ArrowLeftOutlined />
            </button>
            <div className="vertical-controls-container">
              <button
                id="move-up"
                className="basic-button"
              >
                <ArrowUpOutlined />
              </button>
              <button
                id="move-down"
                className="basic-button"
              >
                <ArrowDownOutlined />
              </button>
            </div>
            <button
              id="move-right"
              className="basic-button"
            >
              <ArrowRightOutlined />
            </button> */}
          </div>
          {/* <div id="loading-modal">
            <h1>Loading...</h1>
          </div> */}
        </div>
        {/*2D Floorplanner */}
        {/* style={{ transform: "translate3d(2px, 2px, 0)", scale: "2" }} */}
        <div id="floorplanner">
          <canvas id="floorplanner-canvas" style={{ transform: "translate3d(1px, 1px, 0)", scale: `${zoomScale}` }} className='canvas_floorPlanner'></canvas>
          <div id="floorplanner-controls_2d">
            <button
              id="zoom-out_2d"
              className={"basic-button"}
              onClick={() => {
                if (zoomScale > 1) {
                  let newVal = zoomScale - 0.5
                  dispatch(updateEngineStatesAction(newVal, ["configuration2D", "zoomScale"]))
                  if (zoomScale == 1.5) {
                    dispatch(updateEngineStatesAction(false, ["configuration2D", "isZoomIn"]))
                  }
                }
              }}
            >
              <ZoomOutOutlined />
            </button>
            <button
              id="reset-view_2d"
              className={"basic-button"}
              onClick={() => {
                dispatch(updateEngineStatesAction(false, ["configuration2D", "isZoomIn"]))
                dispatch(updateEngineStatesAction(1, ["configuration2D", "zoomScale"]))
              }}
            >
              <HomeOutlined />
            </button>
            <button
              id="zoom-in_2d"
              className={"basic-button"}
              onClick={() => {
                if (zoomScale < 2.5) {
                  let newVal = zoomScale + 0.5
                  dispatch(updateEngineStatesAction(newVal, ["configuration2D", "zoomScale"]))
                  if (!isZoomIn) {
                    dispatch(updateEngineStatesAction(true, ["configuration2D", "isZoomIn"]))
                  }
                }
                // $("#floorplanner-canvas").css("transform", 'translate3d(' + 2 + 'px, ' + 2 + 'px,0) scale(' + 1.5 + ')').css('transition-duration', '300ms');
                // dispatch(updateEngineStatesAction(true, ["configuration2D", "isZoomIn"]))
              }}
            >
              <ZoomInOutlined />
            </button>
            {/* <button
              variant="secondary"
              size="sm"
              className="icon-text-button"
              id="move"
            >
              <span className="text-centre">Move Walls</span>
            </button>
            <button
              variant="secondary"
              size="sm"
              className="icon-text-button"
              id="draw"
            >
              <span className="text-centre">Draw Walls</span>
            </button> */}
            {/* <button
              variant="secondary"
              size="sm"
              className="icon-text-button"
              id="delete"
            >
              <span className="text-centre">Delete Walls</span>
            </button> */}

            {/* <button
              size="sm"
              className="icon-text-button"
              id="update-floorplan"
            >
              <span className="text-centre">Done</span>
            </button> */}
          </div>
          {BP3DData?.globals?.getGlobal("selectedStep") == '2' && <div id="draw-walls-hint">
            Drag the Pātishon to the right area of the room
          </div>}
        </div>
        {/* Add Items */}
        <div id="add-items">
        </div>
      </div>
    </div>
  )
}

const Home = (props) => {

  const dispatch = useDispatch()

  const viewTypeContext = React.useContext(ViewTypeContext);

  const reducerBlueprint = useSelector(getMemoizedBlueprint3dData)
  const {
    configuration2D,
    BP3DData
  } = reducerBlueprint
  const {
    isZoomIn,
    zoomScale
  } = configuration2D

  useEffect(() => {
    // dispatch(getRoomSizeInitiate())

    return () => {
      dispatch(updateEngineStatesAction('vertical', ["configuration2D", "partitionType"]))
      dispatch(updateEngineStatesAction('top', ["configuration2D", "connectWith"]))
      dispatch(updateEngineStatesAction('2D', 'selectedType'))
      dispatch(updateConfigurationStates(457.36, 'roomLength'))
      dispatch(updateConfigurationStates(457.36, 'roomBreath'))
      dispatch(updateConfigurationStates(0, 'roomLengthAPI'))
      dispatch(updateConfigurationStates(0, 'roomBreathAPI'))
      dispatch(updateEngineStatesAction(false, ["configuration2D", "isZoomIn"]))
      dispatch(updateEngineStatesAction(1, ["configuration2D", "zoomScale"]))
    }
  }, [])



  return (
    <div className='container_wrapper' >
      <Breadcrumbs />
      <View2D
        dispatch={dispatch}
        zoomScale={zoomScale}
        isZoomIn={isZoomIn}
        BP3DData={BP3DData}
      />
    </div>
  )
}

export default Home