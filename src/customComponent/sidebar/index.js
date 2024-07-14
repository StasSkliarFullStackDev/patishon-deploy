import React, { useState, useLayoutEffect, useEffect, memo } from 'react';
import { useSelector, useDispatch } from "react-redux"
import $ from 'jquery'
import { useOutletContext } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee, faXmark } from '@fortawesome/free-solid-svg-icons'
import Step1 from './step1';
import Step2 from './step2';
import Step3Doors from './step3Doors';
import Step4 from './step4';
import Step5 from './step5';
import Step6 from './step6';
import Step7 from './step7';
import Step8 from './step8';
import StepGlassCovering from './stepGlassCovering';
import ContentView from './contentview';

import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d"
import { getMemoizedConfigurationData } from "../../redux/selectors/configuration"
import { updateEngineStatesAction } from '../../redux/actions/blueprint3d';
import { getHingesFailure, getHingesInitiate, getHingesSuccess, updateConfigurationStates } from '../../redux/actions/configuration';
import {
  GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { resolveOnChange } from 'antd/lib/input/Input';
import { isObjEmpty, isInternetConnected } from '../../common/utils';
import { LOCAL_SERVER } from "../../constant/index"
import { Modal } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';



const Rightsiderbar = (props) => {

  let loader = new GLTFLoader()
  let textureLoader = new THREE.TextureLoader();

  const dispatch = useDispatch()
  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const {
    selectedType,
    sidebarCollapsed,
    configurationStep,
    configuration2D,
    numberOfPanels,
    importedModels,
    infoPopUp
  } = reducerBluePrint
  const {
    partitionType
  } = configuration2D
  const configuratorData = useSelector(getMemoizedConfigurationData)
  const {
    roomLength,
    roomBreath,
    roomSizeLoader,
    panelPricePerMm,
    doorHandles,
    films,
    totalPrice,
    clientWallWidth
  } = configuratorData
  const {
    stepValue,
    blueprint3d,
    setCurrentStateOfSideMenu
  } = props

  const [step, setStep] = useState(1)
  const [prevStep, setPrevStep] = useState(null)
  const [prevPartitionWall, setPrevPartitionWall] = useState(null)

  const getHanlde = async (data) => {

    let models = []
    for (let i = 0; i < data.length; i++) {
      loader.load(`${LOCAL_SERVER}${data[i].glbFile}`, (mesh) => {
        models.push(mesh)
        dispatch(updateEngineStatesAction(models, ["importedModels", "handle"]))
      })

    }

  }

  const getTextures = async (data) => {
    let textures = []
    for (let i = 0; i < data.length; i++) {
      textureLoader.load(`${LOCAL_SERVER}${data[i].image}`, (mesh) => {
        mesh.name = data[i].name
        textures.push(mesh)
        dispatch(updateEngineStatesAction(textures, ["importedTextures", "film"]))
      })

    }
  }

  useEffect(() => {
    if (doorHandles && doorHandles.length > 0) {
      getHanlde(doorHandles)
      getTextures(films)
    }
  }, [doorHandles])

  useEffect(() => {
    // console.log("Copper_hinge process")
    dispatch(updateEngineStatesAction(true, "infoPopUp"))
    dispatch(getHingesInitiate())
    textureLoader.load('/static/textures/glass/film4.jpeg', (textures) => {
      dispatch(updateEngineStatesAction(textures, ["importedTextures", "film"]))
    })
    loader.load('/static/models/hinge_copper.glb', (mesh2) => {
      console.log("Copper_hinge success")
      dispatch(updateEngineStatesAction(mesh2, ["importedModels", "hinge"]))
      dispatch(getHingesSuccess())
    }, (second) => {

    }, (error) => {
      dispatch(getHingesFailure())
    })

    let urls = [
      '/static/models/environment.png',
      '/static/models/environment.png',
      '/static/models/environment.png',
      '/static/models/environment.png',
      '/static/models/environment.png',
      '/static/models/environment.png',
    ]
    const textureCube = new THREE.CubeTextureLoader().load(urls)
    dispatch(updateEngineStatesAction(textureCube, "environmentMap"))
  }, [])


  useLayoutEffect(() => {
    dispatch(updateEngineStatesAction(step, 'configurationStep'))
    if (step == 2 && prevStep == 1) {
      console.log("this is step change = ", blueprint3d[0]?.floorplanner?.floorplan?.walls[4].start.x)
      setPrevPartitionWall({
        start: {
          x: blueprint3d[0]?.floorplanner?.floorplan?.walls[4].start.x,
          y: blueprint3d[0]?.floorplanner?.floorplan?.walls[4].start.y
        },
        end: {
          x: blueprint3d[0]?.floorplanner?.floorplan?.walls[4].end.x,
          y: blueprint3d[0]?.floorplanner?.floorplan?.walls[4].end.y
        }
      })
      let partitionWall = blueprint3d[0]?.floorplanner?.floorplan?.walls[4]
      dispatch(updateConfigurationStates(partitionWall.getLength(), 'partitionWallLength'))
    } else if (step == 1 && prevPartitionWall) {

      blueprint3d[0]?.floorplanner?.floorplan?.walls[4].start.move(prevPartitionWall.start.x, prevPartitionWall.start.y)
      blueprint3d[0]?.floorplanner?.floorplan?.walls[4].end.move(prevPartitionWall.end.x, prevPartitionWall.end.y)
      blueprint3d[0].floorplanner.view.draw()
      blueprint3d[1](blueprint3d[0])
    }
    if (step < 4) {
      blueprint3d[0]?.globals?.setGlobal("selectedHorizontalFrames", 1)
      dispatch(updateConfigurationStates(1, "numberOfhorizontalFrames"))
      let defaultSelectedColor = blueprint3d[0]?.globals?.getGlobal("frameVariants").find((item, index) => item.isDefault)
      blueprint3d[0]?.globals?.setGlobal("selectedColorVariant", defaultSelectedColor.type)
      if (blueprint3d[0]?.globals?.getGlobal("frameTypes")[0].isActivated) {
        blueprint3d[0]?.globals?.setGlobal("selectedMetalFrameType", blueprint3d[0]?.globals?.getGlobal("frameTypes")[0].type)
      } else {
        blueprint3d[0]?.globals?.setGlobal("selectedMetalFrameType", blueprint3d[1]?.globals?.getGlobal("frameTypes")[0].type)
      }
      // dispatch(updateEngineStatesAction(2,"numberOfPanels")) 
    }
    if (step < 6) {
      blueprint3d[0]?.globals?.setGlobal("selectedHorizontalFrames", 1)
      dispatch(updateConfigurationStates(1, "numberOfhorizontalFrames"))
      blueprint3d[0]?.globals?.setGlobal("selectedMetalFrameType", "Single metal glazing")
    }
    if (step < 7) {
      blueprint3d[0]?.globals?.setGlobal("selectedFilm", null)
      reducerBluePrint?.BP3DData?.model?.floorplan?.update()
    }
    blueprint3d[0]?.globals?.setGlobal("previousPrice", totalPrice)
  }, [step])


  const handleChangeState = (type = '2D', action) => {
    if (isInternetConnected()) {
      if (action > 2) {
        setCurrentStateOfSideMenu.then(result => {
          result({
            div: $("#viewer"),
            tab: $("#design_2d_tab"),
            name: "Design2D",
          })
        })
      } else {
        setCurrentStateOfSideMenu.then(result => {
          result({
            div: $("#floorplanner"),
            tab: $("#floorplan_tab"),
            name: "Floorplan",
          })
        })
      }
      if (action < 5) {
        blueprint3d[0]?.globals.setGlobal("activePanelIndex", 0)
      }

      // Skip step 4
      if (action === 4) {
        action = 5;
      }

      setPrevStep(step)
      setStep(action)
      blueprint3d[0]?.globals.setGlobal("selectedStep", action)
      reducerBluePrint?.BP3DData.model.floorplan.update()
    }
  }

  const renderSteps = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            blueprint3d={blueprint3d}
            step={step}
            prevStep={prevStep}
            handleChangeState={handleChangeState}
          />
        )

      case 2:
        return <StepGlassCovering
            step={step}
            prevStep={prevStep}
            handleChangeState={handleChangeState}
        />

      case 3:
        return (
          <Step3Doors
            blueprint3d={blueprint3d}
            step={step}
            prevStep={prevStep}
            handleChangeState={handleChangeState}
          />
        )

      case 4:
        return null

      case 5:
        return (
          <Step5
            blueprint3d={blueprint3d}
            step={step}
            prevStep={prevStep}
            handleChangeState={handleChangeState}
          />
        )
      case 6:
        return (
          <Step6
            blueprint3d={blueprint3d}
            step={step}
            prevStep={prevStep}
            handleChangeState={handleChangeState}
          />
        )

      case 7:
        return (
          <Step7
            blueprint3d={blueprint3d}
            step={step}
            handleChangeState={handleChangeState}
          />
        )

      case 8:
        return (
          <Step8
            blueprint3d={blueprint3d}
            step={step}
            handleChangeState={handleChangeState}
          />
        )

      default:
        break;
    }

  }

  const button3DFragment = () => {
    return (
      <div className="button_lite_ions" style={{ display: (selectedType === '2D' || sidebarCollapsed) && 'none' }}>
        <div className='button dviews button_space_j'>
          <button id="floorplan_tab1" type='submit' onClick={() => {
            if (step > 2) {
              $("#design_2d_tab").click()
            } else {
              dispatch(updateEngineStatesAction('2D', 'selectedType'))
            }
          }} className='back_to_2d' style={{ width: '250px !important' }}>Back to normal view</button>
        </div>
      </div>
    )
  }

  return (


    <div
        className={`rightsiderbar rightsiderbarWithConfirmPop ${sidebarCollapsed ? 'hide_slide-left' : 'show_slide-left'} ${(step !== 4 && step !== 5) && 'extra_spacing'}`}
        style={{ width: (step === 5 ? (clientWallWidth * 0.1125 + 100 + 'px') : "391px"), minWidth: 400 }}
    >
      <FontAwesomeIcon
        style={{ cursor: 'pointer' }}
        icon={faXmark}
        onClick={() => {
          dispatch(updateEngineStatesAction(true, 'sidebarCollapsed'))
        }}
      />
      {selectedType === '2D' ?
        <>
          {step < 8 && <section class="step-indicator">
            <div class={`step step1 ${step === 1 && 'active'}`}>
              <div
                class="step-icon"
                onClick={() => {
                  step > 1 && handleChangeState(undefined, 1)
                }}
              >
                1
              </div>
            </div>
            <div class="indicator-line"></div>
            <div class={`step step2 ${step === 2 && 'active'}`}>
              <div
                class="step-icon"
                onClick={() => {
                  step > 2 && handleChangeState(undefined, 2)
                  blueprint3d[0]?.globals?.getCurrentPrice()
                }}
              >
                2
              </div>
            </div>
            <div class="indicator-line"></div>
            <div class={`step step3 ${step === 3 && 'active'}`}>
              <div
                class="step-icon"
                onClick={() => {
                  step > 3 && handleChangeState(undefined, 3)
                  blueprint3d[0]?.globals?.getCurrentPrice()
                }}
              >
                3
              </div>
            </div>
            {/*<div class="indicator-line"></div>*/}
            {/* HIDE STEP */}
            {/*<div class={`step step3 ${step === 4 && 'active'} `}>*/}
            {/*  <div*/}
            {/*    class={`step-icon ${(step > 4 && isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"))) && "disable_icon"}`}*/}
            {/*    onClick={() => {*/}
            {/*      if (!isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"))) {*/}
            {/*        step > 4 && handleChangeState(undefined, 4)*/}
            {/*        blueprint3d[0]?.globals?.getCurrentPrice()*/}
            {/*      }*/}
            {/*    }}*/}
            {/*  >*/}
            {/*    4*/}
            {/*  </div>*/}
            {/*</div>*/}
            <div class="indicator-line"></div>
            <div class={`step step3 ${step === 5 && 'active'}`}>
              <div
                class="step-icon"
                onClick={() => {
                  step > 5 && handleChangeState(undefined, 5)
                  if (blueprint3d[0]?.globals?.getGlobal("activePanelIndex") == -1) {
                    blueprint3d[0]?.globals?.setGlobal("activePanelIndex", 0)
                  }
                }}
              >
                4
              </div>
            </div>
            <div class="indicator-line"></div>
            <div class={`step step3 ${step === 6 && 'active'}`}>
              <div
                className={`step-icon`}
                onClick={() => {
                  step > 6 && handleChangeState(undefined, 6)
                  blueprint3d[0]?.globals?.getCurrentPrice()
                }}
              >
                5
              </div>
            </div>
            <div class="indicator-line"></div>
            <div class={`step step3 ${step === 7 && 'active'}`}>
              <div
                class="step-icon"
                onClick={() => {
                  step > 7 && handleChangeState(undefined, 7)
                  blueprint3d[0]?.globals?.getCurrentPrice()
                }}
              >
                6
              </div>
            </div>
          </section>}
          {(step === 1) && <div className="dimensions-data">
            <h3>Room Dimensions</h3>
          </div>}
          {renderSteps()}
        </> : (
          <ContentView step={step} />
        )
      }
      {button3DFragment()}
    </div>

  )

}
export default memo(Rightsiderbar)