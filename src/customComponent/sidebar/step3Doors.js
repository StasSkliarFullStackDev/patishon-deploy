import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux";
import { Slider, Tabs } from 'antd';
import { Radio } from 'antd';

import ThemeImages from "../../themes/appImage";
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d"
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d";
import { dollyInZoom, firstLetterUpperCase, isInternetConnected, isObjEmpty } from "../../common/utils"
import { getMemoizedConfigurationData } from "../../redux/selectors/configuration";
import { BP3D } from "../../common/blueprint3d";
import { toast } from "react-nextjs-toast";
import { updateConfigurationStates } from "../../redux/actions/configuration";
import axios from "axios";
import {LOCAL_SERVER} from "../../constant";

const Step3Doors = (props) => {
  const dispatch = useDispatch()

  const {
    handleChangeState,
    blueprint3d,
    prevStep
  } = props

  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const configurationData = useSelector(getMemoizedConfigurationData)
  const {
    BP3DData,
    perCmEqualToMm,
  } = reducerBluePrint
  const {
    doorHandles,
    partitionLeftWallLength,
    step3HandleApply,
    roomHeight,
    skipThirdStep,
    newDoor
  } = configurationData

  let reducerData = blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")
  const [doorGlass, setDoorGlass] = React.useState(reducerData.doorGlass ? reducerData.doorGlass : 0)
  const [numbersOfBars, setNumbersOfBars] = React.useState(0)

  const formatter = (value) => `${value}`;

  const handleOnChange = (value) => {
    setNumbersOfBars(value)
  }

  const handleMetalGlazing = (key) => {
    setDoorGlass(key)
  }

  const onSkip = () => {
    if (isInternetConnected) {
      blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration", {})
      blueprint3d[0]?.globals?.setGlobal("activePanelIndex", -1)
      let leftLength = partitionLeftWallLength
      if (!blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")?.selectedDoorSize) {
        leftLength = blueprint3d[0]?.floorplanner?.floorplan?.walls[4].getLength()
      }
      dispatch(updateEngineStatesAction(Math.ceil(leftLength * perCmEqualToMm / 600), 'numberOfPanels'))
      dispatch(updateEngineStatesAction(0, 'numberOfPanelsRight'))
      blueprint3d[0]?.globals?.getCurrentPrice()
      handleChangeState(undefined, 5)
    }
  }

  const handleApply = () => {
    if (isInternetConnected) {
      let defaultHandleIndex = 0
      doorHandles.map((e, i) => {
        if (e.isDefault) {
          defaultHandleIndex = i
        }
      })

      const trueDirection = doorCategory === 'sliding' ? directionOfOpening : (doorType === 'single' ? handlePosition : directionOfOpening)

      blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration", {
        hinges: { category: doorType, direction: trueDirection },
        doorGlass,
        selectedDoorSize: doorSize,
        doorType,
        selectedHandle: defaultHandleIndex,
        horizontalBarForDoor: numbersOfBars
      })
      reducerBluePrint?.BP3DData.model.floorplan.update()
      dollyInZoom(BP3DData)

      const selectedDoor = doors.find(item => (item.doorCategory === doorCategory && item.doorType === doorType && item.doorSize === doorSize))

      dispatch(updateConfigurationStates({
        doorCategory,
        doorType,
        typeOfOpening,
        directionOfOpening,
        handlePosition,
        doorSize,
        doorSizeList,
        doorGlass,
        numbersOfBars,
        doorPrice: selectedDoor?.doorPrice || 0
      }, 'newDoor'))
    }
  }

  useEffect(() => {
    if (prevStep < 3) {
      dispatch(updateEngineStatesAction(true, "infoPopUp"))
    }
  }, [])

  useEffect(() => {
    if (step3HandleApply) {
      handleApply()
    }
  }, [step3HandleApply])

  useEffect(() => {
    if (skipThirdStep && prevStep === 2) {
      onSkip()
    }
  }, [skipThirdStep])

  useEffect(() => {
    if (doorGlass === 1) {
      setNumbersOfBars(1)
    }
  }, [doorGlass]);

  const [doors, setDoors] = React.useState([])
  const [doorCategory, setDoorCategory] = React.useState('hinged');
  const [doorType, setDoorType] = React.useState('single');
  const [typeOfOpening, setTypeOfOpening] = React.useState('push');
  const [directionOfOpening, setDirectionOfOpening] = React.useState('left');
  const [handlePosition, setHandlePosition] = React.useState('left');
  const [doorSize, setDoorSize] = React.useState('100');
  const [doorPrice, setDoorPrice] = React.useState(0);
  const [doorSizeList, setDoorSizeList] = React.useState();

  const getDoors = async () => {
    try {
      const response = await axios.get(LOCAL_SERVER + 'api/v1/admin/doorList')
      setDoors(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  const doorPropertiesFilled = () => {
    if (!doorCategory || !doorType) {
      return false;
    }

    if (doorCategory === 'hinged' && !typeOfOpening) {
      return false;
    }

    if (doorCategory === 'sliding' && doorType === 'single' && !directionOfOpening) {
      return false;
    }

    if ((doorCategory === 'hinged' && doorType === 'single')) {
      if (!handlePosition) {
        return false;
      }
    }

    return true
  }

  const calcDoorSizeList = () => {
    const filteredDoors = doors.filter(door => {
      return (
          (door.doorCategory === doorCategory) &&
          (door.doorType === doorType) &&
          (doorCategory === 'hinged' ? (typeOfOpening ? (door.typeOfOpening === typeOfOpening) : true) : true) &&
          ((doorCategory === 'sliding' && doorType === 'single') ? (directionOfOpening ? (door.directionOfOpening === directionOfOpening) : true) : true) &&
          ((doorCategory === 'hinged' && doorType === 'single') ? (handlePosition ? (door.handlePosition === handlePosition) : true) : true)
      );
    })

    const newDoorSizeList = filteredDoors.map(item => item.doorSize)
    setDoorSizeList([...newDoorSizeList])

    setDoorSize(newDoorSizeList[0] || 0)
  }

  const goToNextStep = () => {
    if (doorSize && doorSizeList !== 0) {
      handleChangeState(undefined, 4)
    } else {
      alert('You need to select door size')
    }
  }

  const setDoorValuesFromStore = () => {
    setDoorCategory(newDoor.doorCategory)
    setDoorType(newDoor.doorType)
    setTypeOfOpening(newDoor.typeOfOpening)
    setDirectionOfOpening(newDoor.directionOfOpening)
    setHandlePosition(newDoor.handlePosition)
    setDoorSizeList(newDoor.doorSizeList)
    setDoorGlass(newDoor.doorGlass)
    setNumbersOfBars(newDoor.numbersOfBars)
  }

  useEffect( () => {
    getDoors()
    handleApply()
    if (prevStep > 3) {
      setDoorValuesFromStore()
      setDoorSize(newDoor.doorSize)
    }
  }, []);

  useEffect(() => {
    if(doorPropertiesFilled()) {
      calcDoorSizeList()
      handleApply()
    }
  }, [doorCategory, doorType, typeOfOpening, directionOfOpening, handlePosition, doorGlass, numbersOfBars, doors]);

  useEffect(() => {
    dispatch(updateEngineStatesAction(doorCategory === 'hinged' ? "1" : "0", "doorChannelTabSelected"))
    dispatch(updateEngineStatesAction(doorSize, "doorSize"))
    handleApply()
  }, [doorSize]);

  return (
      <div className='step4 custom_height'>
        <div className='dimensions-data'>
          <h3>Doors</h3>
        </div>
        <div>
          <div className="good" style={{flexDirection: 'column', gap: 15}}>
            <div>
              <h4 className="single door_p door_point">Door Category</h4>
              <Radio.Group onChange={(e) => setDoorCategory(e.target.value)} value={doorCategory}>
                <div className="radio_line">
                  <div className='custom_width'>Hinged</div>
                  <div className='btn_radio'><Radio value={'hinged'}/></div>
                </div>
                <div className="radio_line">
                  <div className='custom_width'>Sliding</div>
                  <div className='btn_radio'><Radio value={'sliding'}/></div>
                </div>
              </Radio.Group>
            </div>

            <div>
              <h4 className="single door_p door_point">Door Type</h4>
              <Radio.Group onChange={(e) => setDoorType(e.target.value)} value={doorType}>
                <div className="radio_line">
                  <div className='custom_width'>Single</div>
                  <div className='btn_radio'><Radio value={'single'}/></div>
                </div>
                <div className="radio_line">
                  <div className='custom_width'>Double</div>
                  <div className='btn_radio'><Radio value={'double'}/></div>
                </div>
              </Radio.Group>
            </div>

            {
                (doorCategory === 'hinged') &&
                <div>
                  <h4 className="single door_p door_point">Type of opening</h4>
                  <Radio.Group onChange={(e) => setTypeOfOpening(e.target.value)} value={typeOfOpening}>
                    <div className="radio_line">
                      <div className='custom_width'>Push</div>
                      <div className='btn_radio'><Radio value={'push'}/></div>
                    </div>
                    <div className="radio_line">
                      <div className='custom_width'>Pull</div>
                      <div className='btn_radio'><Radio value={'pull'}/></div>
                    </div>
                  </Radio.Group>
                </div>
            }

            {
                (doorCategory === 'sliding' && doorType === 'single') &&
                <div>
                  <h4 className="single door_p door_point">Direction of opening</h4>
                  <Radio.Group onChange={(e) => setDirectionOfOpening(e.target.value)} value={directionOfOpening}>
                    <div className="radio_line">
                      <div className='custom_width'>Left</div>
                      <div className='btn_radio'><Radio value={'left'}/></div>
                    </div>
                    <div className="radio_line">
                      <div className='custom_width'>Right</div>
                      <div className='btn_radio'><Radio value={'right'}/></div>
                    </div>
                  </Radio.Group>
                </div>
            }

            {
                (doorCategory === 'hinged' && doorType === 'single') &&
                <div>
                  <h4 className="single door_p door_point">Handle position</h4>
                  <Radio.Group onChange={(e) => setHandlePosition(e.target.value)} value={handlePosition}>
                    <div className="radio_line">
                      <div className='custom_width'>Left</div>
                      <div className='btn_radio'><Radio value={'left'}/></div>
                    </div>
                    <div className="radio_line">
                      <div className='custom_width'>Right</div>
                      <div className='btn_radio'><Radio value={'right'}/></div>
                    </div>
                  </Radio.Group>
                </div>
            }

            <div>
              <h4 className="single door_p door_point">Door size</h4>
              <Radio.Group
                  onChange={(e) => setDoorSize(e.target.value)}
                  value={doorSize}
                  style={{flexDirection: 'column', gap: 10}}
              >
                {
                  doorSizeList && doorSizeList.map((item, index) => {
                    return (
                        <div key={index} className="radio_line">
                          <div className='btn_radio p-0'><Radio value={item}/></div>
                          <div className='custom_width'>{item}</div>
                        </div>
                    )
                  })
                }
              </Radio.Group>

              {
                doorSizeList && doorSizeList.length === 0 &&
                  <div>
                    <p className="color-white">We don't have any doors that match your selected settings.</p>
                  </div>
              }
            </div>
          </div>
        </div>

        <h4 className="single door_p door_point">Door Style</h4>
        <div className="panelsizes sizes space-line door_point ">
          <div className={doorGlass === 1 ? 'wrapper_frames' : 'wrapper_frames active'}>
            <div className="first_div" onClick={() => {
              handleMetalGlazing(0)
            }}></div>
            <p>Frameless</p>
          </div>
          <div className={doorGlass === 0 ? 'wrapper_frames' : 'wrapper_frames active'}>
            <img src={ThemeImages.frames2} className='jack_imgd' onClick={() => {
              handleMetalGlazing(1)
            }}/>
            <p>Framed</p>
          </div>
        </div>
        {/*<h4 className="single size mb-10px">{`Sizes Of ${doorChannelTabSelected == 1 ? "Hinged" : "Sliding"} Door`}</h4>*/}
        {/*<Radio.Group className='doors-size-radio-list-container'>*/}
        {/*  {doorChannels.map((item, index) => {*/}
        {/*    return <div className="doors-size-radio-list" key={index}>*/}
        {/*      {item.doorSize?.map((eachDoorSize, indexOfDoorSize) => {*/}
        {/*        getPrice(eachDoorSize)*/}
        {/*        return (*/}
        {/*            <div key={indexOfDoorSize} className='radio_line'>*/}
        {/*              <div className="radio-item">*/}
        {/*                <span className='radio-item__label'>{eachDoorSize.size} mm</span>*/}
        {/*              </div>*/}
        {/*              <div className='btn_radio'><Radio defaultChecked value={eachDoorSize.size}/></div>*/}
        {/*            </div>*/}
        {/*        )*/}
        {/*      })}*/}
        {/*    </div>*/}
        {/*  })}*/}
        {/*</Radio.Group>*/}
        {doorGlass === 1 && <div className="toggle_slider">
          <div className='first-silder'>
            <h3>Number of Horizontal Bars</h3>
            <Slider
                className="slider slider_step4"
                defaultValue={6}
                tipFormatter={formatter}
                onChange={handleOnChange}
                min={1}
                max={(Math.ceil(roomHeight / 500) - 1)}
                value={typeof numbersOfBars === "number" ? numbersOfBars : 0}
            />
            <div className='data_line_one'>
              <label>1</label>
              <label>{(Math.ceil(roomHeight / 500) - 1)}</label>
            </div>
          </div>
          <p className="maximum"> Maximum 1 horizontal bar is allowed per 500 mm and minimum 1 full length.</p>
        </div>}
        {/* <div className='button top_new'>
        <button type='submit'
          onClick={() => {
            if (hingeLoader) {
              dispatch(updateConfigurationStates(true, 'step3HandleApply'))
            } else {
              if (doorChannelTabSelected == 1) {
                handleApply()
              } else if (doorChannelTabSelected == 2) {
                handleApply()
              } else {
                executeScroll()
              }
            }
          }}
          className='update-floorplan sucess_button'>Apply</button>
      </div> */}
        {/*<div className='button top_new'>*/}
        {/*  <button type='submit'*/}
        {/*          onClick={() => {*/}
        {/*            handleApply()*/}
        {/*            let paritionWall = blueprint3d[0].floorplanner.floorplan.walls[4]*/}
        {/*            let doorStart = {*/}
        {/*              x: ((paritionWall.start.x + paritionWall.end.x) / 2) - (((blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration")?.selectedDoorSize || 0) / perCmEqualToMm) / 2),*/}
        {/*              y: paritionWall.start.y*/}
        {/*            }*/}
        {/*            blueprint3d[0]?.globals?.setGlobal("doorStartVector", doorStart)*/}
        {/*            handleApply()*/}
        {/*          }}*/}
        {/*          className='update-floorplan sucess_button'>Center*/}
        {/*  </button>*/}
        {/*</div>*/}
        {/* <div className="target-data-button-i">
        <div className='button'>
          <button type='submit' onClick={onSkip} className='sucess_button'>Skip</button>
        </div>
        <div className='button'>
          <button type='submit' onClick={() => {
            if (isObjEmpty(blueprint3d[0]?.globals?.getGlobal("selectedDoorConfiguration"))) {
              blueprint3d[0]?.globals?.setGlobal("activePanelIndex", -1)
              let leftLength = blueprint3d[0]?.floorplanner?.floorplan?.walls[4].getLength()
              dispatch(updateEngineStatesAction(Math.ceil(leftLength * perCmEqualToMm / 600), 'numberOfPanels'))
              dispatch(updateEngineStatesAction(Math.ceil(partitionRightWallLength * perCmEqualToMm / 600), 'numberOfPanelsRight'))
              blueprint3d[0]?.globals?.getCurrentPrice()
              handleChangeState(undefined, 5)
            } else {
              let leftLength = partitionLeftWallLength
              dispatch(updateEngineStatesAction(Math.ceil(leftLength * perCmEqualToMm / 600), 'numberOfPanels'))
              dispatch(updateEngineStatesAction(Math.ceil(partitionRightWallLength * perCmEqualToMm / 600), 'numberOfPanelsRight'))
              handleChangeState(undefined, 4)
            }
          }} className='sucess_button'>Next</button>

        </div>
      </div> */}
        {/* <p className="previous">Previous Price = £{(Math.floor(partitionWallLength * perCmEqualToMm) * panelPricePerMm)} + Door(channel and glass)Price £{glassPrice}</p>
      <div className="floating-text">
        <p>total<br></br> price</p>
        <h3>{`£${totalPrice}`}</h3> */}
        {/* </div> */}
        <div className="floating_next_btn target-data-button-i">
          <div className='button'>
            <button type='submit' onClick={onSkip} className='sucess_button'>Skip</button>
          </div>
          <div className='button'>
            <button type='submit' onClick={() => { goToNextStep() }} className='sucess_button'>
              Next
            </button>
          </div>
        </div>
      </div>
  )
}
export default Step3Doors