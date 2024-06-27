import React, { useEffect, useLayoutEffect, useState } from "react"
import $ from 'jquery'
import { useDispatch, useSelector } from "react-redux";
import { Slider, Radio, InputNumber, Tooltip } from 'antd';
import { InfoCircleOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';

import { DataManager, getPreviousTotalAmount, sliderTooltipFormatter, toNumbers } from "../../common/utils";
import { getMemoizedBlueprint3dData } from '../../redux/selectors/blueprint3d';
import { getMemoizedConfigurationData } from "../../redux/selectors/configuration";
import { updateConfigurationStates } from "../../redux/actions/configuration";
import { BP3D } from "../../common/blueprint3d";
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d";

const wallIds = {
  "left": null,
  "right": null,
  "top": null,
  "bottom": null,
  "partition": null
}

// 131.060001 = this number is used for get partition wall pixels(Floating) which is less then top and bottom both sides.

// 61.06 = this number is used for get partition wall pixels(Single) which is less then bottom wall.

const Step2 = (props) => {


  const dispatch = useDispatch()
  const localStoragePartitionType = DataManager.getPartitionType()

  const {
    step,
    handleChangeState,
    blueprint3d,
    setCurrentStateOfSideMenu,
    prevStep
  } = props
  blueprint3d[0]?.floorplanner?.view?.draw() // Draw active corner 


  const configuratorData = useSelector(getMemoizedConfigurationData)
  const {
    partitionWallLength,
    roomLength,
    roomBreath,
    maxValueOfLengthBottomFloating,
    maxValueOfLengthTopFloating,
    panelPricePerMm,
    perPanelPrice,
    doorChannels,
    priceArray
  } = configuratorData
  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const {
    perCmEqualToMm,
    configuration2D,
    numberOfPanels
  } = reducerBluePrint

  const {
    partitionType,
    connectWith,
    partionHeightAdjustFrom,
    minimumWallLength
  } = configuration2D

  let maxValueOflength = null

  useLayoutEffect(() => {
    blueprint3d[0]?.globals?.setGlobal("selectedDoorConfiguration", {})
    dispatch(updateConfigurationStates(blueprint3d[0].floorplanner.floorplan.walls[4].getLength(), 'maxValueOfLengthTopFloating'))
    dispatch(updateConfigurationStates(blueprint3d[0].floorplanner.floorplan.walls[4].getLength(), 'maxValueOfLengthBottomFloating'))
    // return () => {
    //   dispatch(updateConfigurationStates(0, 'partitionWallLength'))
    // }
  }, [])

  const calculateInputsValue = (cm) => {
    let res = (cm * perCmEqualToMm)
    // if (+res.toString().split('.')[1] >= 99) {
    //   return Math.ceil(res)
    // }
    // console.log("this is res = ", res)
    return Math.floor(res)
  }
  


  switch (localStoragePartitionType) {
    case "floating":
      if (partitionType == 'vertical') {
        maxValueOflength = Math.floor(((roomLength + 10) - (minimumWallLength + minimumWallLength)) * perCmEqualToMm)
      } else {
        maxValueOflength = Math.floor(((roomBreath + 10) - (minimumWallLength + minimumWallLength)) * perCmEqualToMm)
      }
      break;

    case "single":
      if (partitionType == 'vertical') {
        maxValueOflength = Math.floor(((roomLength + 5 + 0.9) - (minimumWallLength)) * perCmEqualToMm)
      } else {
        maxValueOflength = Math.floor(((roomBreath + 5 + 0.9) - (minimumWallLength)) * perCmEqualToMm)
      }
      break;

    case "fixed":
      if (partitionType == 'vertical') {
        maxValueOflength = Math.floor(roomLength * perCmEqualToMm)
      } else {
        maxValueOflength = Math.floor((roomBreath) * perCmEqualToMm)
      }
      break;

    default:
      break;
  }

  const onChangeLength = (value, firstRenderer = null) => {
    if (value?.target?.value && (+value?.target?.value >= 350 && +value?.target?.value <= maxValueOflength)) {
      value = +value.target.value
    }
    if (isNaN(value)) {
      return;
    }

    let valueX = (value + 0.1) / perCmEqualToMm
    let moveXTopBottom = ((valueX) - ((partitionWallLength)))
    let moveYTopBottom = ((valueX) - ((partitionWallLength)))
    console.log("this is move new = ", partitionWallLength, value)
    let partitionWall = blueprint3d[0].floorplanner.floorplan.walls[4]

    for (let index = 0; index < blueprint3d[0].floorplanner.floorplan.walls.length; index++) {
      const eachWall = blueprint3d[0].floorplanner.floorplan.walls[index]
      if (index == 4 && localStoragePartitionType == 'single') {
        if (connectWith == "bottom") {
          eachWall.end.relativeMove(0, -moveYTopBottom)
        } else if (connectWith == "top") {
          eachWall.end.relativeMove(0, moveYTopBottom)
        } else if (connectWith == "left") {
          eachWall.end.relativeMove(moveXTopBottom, 0)
        } else {
          eachWall.end.relativeMove(-moveXTopBottom, 0)
        }
      } else if (index == 4 && localStoragePartitionType == 'floating') {
        if (partitionType == "vertical") {

          if (partionHeightAdjustFrom == "topToBottom") {
            eachWall.start.relativeMove(0, -(moveYTopBottom))

          } else {
            eachWall.end.relativeMove(0, (moveYTopBottom / 2))
          }
          blueprint3d[0].floorplanner.floorplan.updateMaxLenghtOfPartitionWall()
        } else {
          if (partionHeightAdjustFrom == "topToBottom") {
            eachWall.start.relativeMove(-(moveYTopBottom), 0)
          } else {
            eachWall.end.relativeMove((moveYTopBottom), 0)
          }
          blueprint3d[0].floorplanner.floorplan.updateMaxLenghtOfPartitionWall()
        }
      }
    }
    let check = Math.abs(blueprint3d[0].floorplanner.floorplan.walls[3].start.y - blueprint3d[0].floorplanner.floorplan.walls[4].end.y)
    console.log("this is final length = ", BP3D.Core.Dimensioning.cmToMeasure(check))
    // dispatch(updateConfigurationStates(blueprint3d[0].floorplanner.floorplan.walls[4].getLength(), 'maxValueOfLengthBottomFloating'))
    blueprint3d[0].floorplanner.view.draw()
    blueprint3d[1](blueprint3d[0])
    // console.log(leftWall.getLength(), "leftWall");

    dispatch(updateConfigurationStates(partitionWall.getLength(), 'partitionWallLength'))

  }

  const partitionLengthFn = (isMinOrPlus) => {
    let value = Math.floor((partitionWallLength) * perCmEqualToMm)
    let minValue = 350
    if (localStoragePartitionType == "floating") {
      let directionType = partionHeightAdjustFrom == "topToBottom" ? "top" : "bottom"
      let maxLimitForFloat = directionType === "top" ? Math.floor((maxValueOfLengthTopFloating) * perCmEqualToMm) : Math.floor((maxValueOfLengthBottomFloating) * perCmEqualToMm)
      if (isMinOrPlus == "min") {
        if (value <= minValue) {
          // onChangeLength(1200);
          console.log("incoming>min", value);
          return;
        }
        console.log("roomlenght>min", value);
        onChangeLength(value - 0.9);
      } else {
        console.log("roomlenght>value", maxLimitForFloat);

        if (value >= maxLimitForFloat) {
          // onChangeLength(9000);
          return;
        }
        onChangeLength(value + 1.1);
      }
    } else {
      console.log("roomlenght>min", value);
      if (isMinOrPlus == "min") {
        if (value <= minValue) {
          // onChangeLength(1200);
          console.log("incoming>min", value);
          return;
        }
        console.log("roomlenght>min", value);
        onChangeLength(value - 1);
      } else {
        if (value >= maxValueOflength) {
          // onChangeLength(9000);
          return;
        }
        console.log("roomlenght>value", value);
        onChangeLength(value + 1.1);
      }
    }

  };

  const onMinPlusClick = (isLenghtOrBreath, isMinOrPlus) => {
    console.log("isLenghtOrBreath = ", isLenghtOrBreath, isMinOrPlus)
    isLenghtOrBreath === "Linear Length" && partitionLengthFn(isMinOrPlus);
  };

  const handleChangeHeightAdjustType = (value) => {
    console.log("this is change = ", value)
    dispatch(updateEngineStatesAction(value, ["configuration2D", "partionHeightAdjustFrom"]))
    blueprint3d[0].floorplanner.view.draw()
    blueprint3d[1](blueprint3d[0])
  }

  const setDefaultDoorChannel = (arr) => {
    let index = "1"
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].type == "single" && !arr[i].isEnabled) {
        index = "2"
      }
    }
    dispatch(updateEngineStatesAction(arr.find(e => e.isEnabled).doorSize?.find(e => e.isActivated)?.size, "selectedDoorSize"))
    dispatch(updateEngineStatesAction(index, "doorChannelTabSelected"))

  }

  const Sliders = (name, onChange, value, range) => {
    return (
      <div className="first-silder">
        {/* <h3>{name}</h3> */}
        <div className="mainSlider ">
          <MinusCircleOutlined
            className="plusMin addicon"
            onClick={() => onMinPlusClick(name, "min")}
            disabled={localStoragePartitionType == 'fixed'}
          />
          {console.log("this is maxlimit = ",)}
          <Slider
            className="slider"
            min={350}
            max={maxValueOflength}
            onChange={onChange}
            tipFormatter={() => sliderTooltipFormatter(value)}
            value={typeof value === "number" ? value : 0}
            step={1}
            disabled={localStoragePartitionType == 'fixed'}
          />
          <PlusCircleOutlined
            className="plusMin "
            onClick={() => onMinPlusClick(name, "plus")}
            disabled={localStoragePartitionType == 'fixed'}
          />
        </div>
        <div className="data_line_one">
          <label>{range.min}</label>
          <label>{range.max}</label>
        </div>
      </div>
    );
  };

  const text = (val) => <span style={{ fontSize: '14px'}}>{val}</span>;

  return (
    <div className='step4'>
      <div className='dimensions-data'>
        <h3>Dimensions</h3>

      </div>
      {/* <div className='first-silder'>
        <h3>Linear Height</h3>
        <Slider defaultValue={30}
          // tooltipVisible
          tipFormatter={formatter} min={0} max={100} />
        <div className='data_line_one'>
          <label>0 mm</label>
          <label>100 mm</label>
        </div>
      </div> */}
      {localStoragePartitionType == 'floating' && <div className="category-details bg_home">
        <h3>{partitionType == "vertical" ? "Update Length" : "Update Width"}</h3>
        <div className="good">
          <Radio.Group onChange={(e) => {
            // console.log("this is onchange = ", e.target.value)
            handleChangeHeightAdjustType(e.target.value)
          }} value={partionHeightAdjustFrom}>

            <div className="radio_line">
              <div >{partitionType == "vertical" ? "Top" : "Left"}</div>
              <div className='btn_radio'><Radio value="topToBottom" /></div>
            </div>
            <div className="radio_line">
              <div >{partitionType == "vertical" ? "Bottom" : "Right"}</div>
              <div className='btn_radio'><Radio value="bottomToTop" /></div>
            </div>
          </Radio.Group>
        </div>

      </div>}
      {console.log("this is range change = ",)}
      <div className="first-silder">
        <div class="label_container_For_customization">
          <h3>Pātishon Width</h3>
          <Tooltip placement="topRight" title={text('You can also drag your Pātishon up or down into the right position in the room.')}>
            <InfoCircleOutlined />
          </Tooltip>
        </div>
        <InputNumber
          style={{
            width: "100%",
            height: "100%"
          }}
          placeholder="Enter the linear length"
          min={350}
          max={maxValueOflength}
          addonAfter={"mm"}
          value={calculateInputsValue(partitionWallLength)}
          onBlur={onChangeLength}
          onPressEnter={onChangeLength}
          type="tel"
          disabled={localStoragePartitionType == 'fixed'}
          className="onBlur-input"
        />
      </div>
      {(localStoragePartitionType !== 'floating') &&
        Sliders(
          "Linear Length",
          onChangeLength,
          calculateInputsValue(partitionWallLength), {
          min: "350mm",
          max: `${maxValueOflength}mm`,
        })}

      {
        (localStoragePartitionType == 'floating' && partionHeightAdjustFrom == "topToBottom") &&
        <div className="first-silder">
          <h3>{partitionType == "vertical" ? "Linear Length Top" : "Linear Length Left"}</h3>
          <div className="mainSlider ">
            <MinusCircleOutlined
              className="step2 plusMin addicon"
              onClick={() => onMinPlusClick("Linear Length", "min")}
              disabled={localStoragePartitionType == 'fixed'}
            />
            {console.log("this is new value = ", Math.floor(((maxValueOfLengthBottomFloating) - (minimumWallLength + minimumWallLength)) * perCmEqualToMm))}
            <Slider
              className="slider"
              min={350}
              max={Math.ceil(BP3D.Core.Dimensioning.cmToMeasure(maxValueOfLengthTopFloating))}
              onChange={onChangeLength}
              tipFormatter={() => sliderTooltipFormatter(Math.floor(partitionWallLength * perCmEqualToMm))}
              value={typeof Math.floor(partitionWallLength * perCmEqualToMm) === "number" ? Math.floor(partitionWallLength * perCmEqualToMm) : 5000}
              step={1}
            />
            <PlusCircleOutlined
              className="step2 plusMin "
              onClick={() => onMinPlusClick("Linear Length", "plus")}
              disabled={localStoragePartitionType == 'fixed'}
            />
          </div>
          <div className="data_line_one">
            <label>{"350mm"}</label>
            <label>{`${Math.floor(maxValueOfLengthTopFloating * perCmEqualToMm)}mm`}</label>
          </div>
        </div>
      }
      {(localStoragePartitionType == 'floating' && partionHeightAdjustFrom !== "topToBottom") &&
        <div className="first-silder">
          <h3>{partitionType == "vertical" ? "Linear Length Bottom" : "Linear Length Right"}</h3>
          <div className="mainSlider ">
            <MinusCircleOutlined
              className="plusMin addicon"
              onClick={() => onMinPlusClick("Linear Length", "min")}
              disabled={localStoragePartitionType == 'fixed'}
            />
            <Slider
              className="slider"
              min={350}
              max={Math.ceil(BP3D.Core.Dimensioning.cmToMeasure(maxValueOfLengthBottomFloating))}
              onChange={onChangeLength}
              tipFormatter={() => sliderTooltipFormatter(Math.floor(partitionWallLength * perCmEqualToMm))}
              value={typeof Math.floor(partitionWallLength * perCmEqualToMm) === "number" ? Math.floor(partitionWallLength * perCmEqualToMm) : 5000}
              step={1}
            />
            <PlusCircleOutlined
              className="plusMin "
              onClick={() => onMinPlusClick("Linear Length", "plus")}
              disabled={localStoragePartitionType == 'fixed'}
            />
          </div>
          <div className="data_line_one">
            <label>{"350mm"}</label>
            <label>{`${Math.floor(maxValueOfLengthBottomFloating * perCmEqualToMm)}mm`}</label>
          </div>
        </div>
      }
       {localStoragePartitionType == 'floating' && <div className='button top_new'>
        <button type='submit'
          onClick={() => {

            let topWall = blueprint3d[0].floorplanner.floorplan.walls[1]
            let partitionWall = blueprint3d[0].floorplanner.floorplan.walls[4]
            let start = {
              x:   ((topWall.start.x + topWall.end.x)/ 2) - (partitionWall.getLength()/2),
              y: partitionWall.start.y
            }

            let end = {
              x:   ((topWall.start.x + topWall.end.x)/ 2) + (partitionWall.getLength()/2),
              y: partitionWall.end.y
            }


            blueprint3d[0]?.floorplanner?.floorplan?.walls[4].start.move(start.x, start.y)
            blueprint3d[0]?.floorplanner?.floorplan?.walls[4].end.move(end.x, end.y)
            blueprint3d[0].floorplanner.view.draw()
            blueprint3d[1](blueprint3d[0])
            blueprint3d[0].floorplanner.floorplan.updateMaxLenghtOfPartitionWall()
          }}
          className='update-floorplan sucess_button'>Center</button>
      </div>}
      <div className='button top_new'>
        <button type='submit' onClick={() => {
          blueprint3d[0]?.globals?.getCurrentPrice()
          setDefaultDoorChannel(doorChannels)
          let start = blueprint3d[0].floorplanner.floorplan.walls[4].start
          start = {
            x: start.x,
            y: start.y
          }
          blueprint3d[0]?.globals?.setGlobal("doorStartVector", start)
          handleChangeState(undefined, 3)
        }} className='sucess_button'>Next</button>
        <p style={{ color: "#fff", margin: "20px 0" }}><span style={{ color: "red" }}>Note* :</span > You can adjust wall dimensions by dragging.</p>
      </div>
    </div>
  )
}
export default Step2
