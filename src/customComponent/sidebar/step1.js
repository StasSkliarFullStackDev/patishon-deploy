import React, { useState, useLayoutEffect, useEffect, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {Slider, InputNumber, Radio, Tooltip, Select} from "antd";
import { getMemoizedConfigurationData } from "../../redux/selectors/configuration";
import { updateConfigurationStates } from "../../redux/actions/configuration";
import {
  DataManager,
  toNumbers,
  sliderTooltipFormatter,
} from "../../common/utils";
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d";
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d";
import {
  MinusCircleOutlined,
  PlusCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { BP3D } from "../../common/blueprint3d";

const { Option } = Select; // добавлен Option

/**
 * The init Structure make default 4000
 * We are assuming that 6.5593842925 mm = 1cm or 1 pixel
 * for this, the default value from init structure is 457.32 that will be converted to 3000mm
 * mm is the one which is show to user and added by admin. cm is actually the pixels
 */

const wallIds = {
  left: null,
  right: null,
  top: null,
  bottom: null,
  partition: null,
};

const Step1 = (props) => {
  const dispatch = useDispatch();
  const localStoragePartitionType = DataManager.getPartitionType();

  const { blueprint3d, handleChangeState } = props;

  const configuratorData = useSelector(getMemoizedConfigurationData);
  const {
    roomLength,
    roomBreath,
    isMakeDefaultRoom,
    roomLengthAPI,
    roomBreathAPI,
    roomHeight,
    partitionWallLength,
  } = configuratorData;
  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData);
  const { perCmEqualToMm, configuration2D } = reducerBluePrint;

  const { partitionType, connectWith, minimumWallLength } = configuration2D;

  React.useEffect(() => {
    if (isMakeDefaultRoom) {
      let verticalWalls = [];
      let horizontalWalls = [];
      const allWalls = blueprint3d[0]?.floorplanner?.floorplan?.walls;
      for (let index = 0; index < allWalls.length; index++) {
        const eachWall = allWalls[index];
        const wallPosition =
          blueprint3d[0]?.floorplanner?.floorplan.getWallPosition(eachWall);
        wallIds[wallPosition] = eachWall.id;

        if (wallPosition == "left" || wallPosition == "right") {
          console.log("this is wall position 1");
          verticalWalls.push(eachWall);
        } else if (wallPosition !== "partition") {
          console.log("this is wall position 2");
          horizontalWalls.push(eachWall);
        }
      }
      console.log(
        "this is first renderer = ",
        verticalWalls[0].getLength() - 20
      );
      onChangeLength(roomLengthAPI);
      onChangeBreath(roomBreathAPI);
      handleChangePartitionTYpe("horizontal");
    }
    return () => {
      dispatch(updateConfigurationStates(false, "isMakeDefaultRoom"));
    };
  }, [isMakeDefaultRoom]);

  const formatter = (value) => {
    return `${value}
    mm`;
  };

  const calculateInputsValue = (cm) => {
    let res = cm * perCmEqualToMm;
    // if (+res.toString().split('.')[1] >= 99) {
    //   return Math.ceil(res)
    // }
    // console.log("this is res = ", res)
    return Math.floor(res);
  };

  const onChangeBreath = (value, firstRenderer = null) => {
    console.log(value, "onChangeBreath");
    if (+value?.target?.value >= 1000 && +value?.target?.value <= 9000) {
      value = value.target.value;
    }
    if (isNaN(value)) {
      return;
    }
    let valueX = (value = value / perCmEqualToMm);
    let moveXLeft = (valueX - roomBreath) / 2;
    let moveXRight = (valueX - roomBreath) / 2;
    console.log("new breadth", moveXRight, moveXLeft);
    let topWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["top"]
    );
    let partitionWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["partition"]
    );

    for (
      let index = 0;
      index < blueprint3d[0].floorplanner.floorplan.walls.length;
      index++
    ) {
      const eachWall = blueprint3d[0].floorplanner.floorplan.walls[index];
      if (eachWall.id == wallIds["right"]) {
        eachWall.relativeMove(moveXRight, 0);
      }
      if (eachWall.id == wallIds["left"]) {
        eachWall.relativeMove(-moveXLeft, 0);
      }
      if (
        eachWall.id == wallIds["partition"] &&
        partitionType == "horizontal"
      ) {
        if (connectWith == "right") {
          eachWall.start.relativeMove(moveXRight, 0);
          eachWall.end.relativeMove(-moveXLeft, 0);
        } else {
          eachWall.start.relativeMove(-moveXRight, 0);
          eachWall.end.relativeMove(moveXLeft, 0);
        }
      }
    }
    blueprint3d[0].floorplanner.view.draw();
    blueprint3d[1](blueprint3d[0]);

    dispatch(updateConfigurationStates(topWall.getLength() - 10, "roomBreath"));
    dispatch(
      updateConfigurationStates(
        partitionWall.getLength(),
        "partitionWallLength"
      )
    );
  };

  const onChangeLength = (value, firstRenderer = null) => {
    if (+value?.target?.value >= 1000 && +value?.target?.value <= 9000) {
      value = +value.target.value;
    }
    if (isNaN(value)) {
      return;
    }
    let valueX = value / perCmEqualToMm;
    let moveXTop = (valueX - roomLength) / 2;
    let moveXBottom = (valueX - roomLength) / 2;
    let leftWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["right"]
    );
    let partitionWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["partition"]
    );
    for (
      let index = 0;
      index < blueprint3d[0].floorplanner.floorplan.walls.length;
      index++
    ) {
      const eachWall = blueprint3d[0].floorplanner.floorplan.walls[index];
      if (eachWall.id == wallIds["bottom"]) {
        eachWall.relativeMove(0, moveXBottom);
      }
      if (eachWall.id == wallIds["top"]) {
        eachWall.relativeMove(0, -moveXTop);
      }
      if (eachWall.id == wallIds["partition"] && partitionType == "vertical") {
        if (connectWith == "top") {
          eachWall.start.relativeMove(0, -moveXTop);
          eachWall.end.relativeMove(0, moveXBottom);
        } else {
          eachWall.start.relativeMove(0, moveXTop);
          eachWall.end.relativeMove(0, -moveXBottom);
        }
      }
    }
    blueprint3d[0].floorplanner.view.draw();
    blueprint3d[1](blueprint3d[0]);
    console.log(leftWall.getLength(), "partition");
    dispatch(
      updateConfigurationStates(leftWall.getLength() - 10, "roomLength")
    );

    dispatch(
      updateConfigurationStates(
        partitionWall.getLength(),
        "partitionWallLength"
      )
    );
  };

  const onHeightChange = (value) => {
    if (value === null) return;
    dispatch(updateConfigurationStates(value, "roomHeight"));
  };

  const handleChangePartitionTYpe = (value) => {
    let partitionWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["partition"]
    );
    let leftWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["left"]
    );
    let rightWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["right"]
    );
    let topWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["top"]
    );
    let bottomtWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["bottom"]
    );
    let moveXStart =
      value == "vertical" && (topWall.start.x + topWall.end.x) / 2;
    let moveYStart =
      value == "horizontal" && (leftWall.start.y + leftWall.end.y) / 2;
    let moveXEnd =
      value == "vertical" && (bottomtWall.start.x + bottomtWall.end.x) / 2;
    let moveYEnd =
      value == "horizontal" && (rightWall.start.y + rightWall.end.y) / 2;

    if (localStoragePartitionType == "fixed") {
      if (value == "vertical") {
        moveYStart = topWall.start.y + 5;
        moveYEnd = bottomtWall.start.y - 5;
      } else {
        moveXStart = leftWall.start.x + 5;
        moveXEnd = rightWall.start.x - 5;
      }
    } else if (localStoragePartitionType == "single") {
      if (value == "vertical") {
        moveYStart = topWall.start.y + 5 - 0.9;
        moveYEnd = bottomtWall.start.y - minimumWallLength; // minimumWallLength is the distance of partition wall from oppostie wall
      } else {
        moveXStart = leftWall.start.x + 5 - 0.9;
        moveXEnd = rightWall.start.x - minimumWallLength; // minimumWallLength is the distance of partition wall from oppostie wall
      }
    } else {
      if (value == "vertical") {
        moveYStart = topWall.start.y + minimumWallLength;
        moveYEnd = bottomtWall.start.y - minimumWallLength; // minimumWallLength is the distance of partition wall from oppostie wall
      } else {
        moveXStart = leftWall.start.x + minimumWallLength;
        moveXEnd = rightWall.start.x - minimumWallLength; // minimumWallLength is the distance of partition wall from oppostie wall
      }
    }

    for (
      let index = 0;
      index < blueprint3d[0].floorplanner.floorplan.walls.length;
      index++
    ) {
      const eachWall = blueprint3d[0].floorplanner.floorplan.walls[index];

      if (eachWall.id == wallIds["partition"]) {
        eachWall.start.move(moveXStart, moveYStart);
        eachWall.end.move(moveXEnd, moveYEnd);
      }
    }

    let connectValue = value == "vertical" ? "top" : "left";
    dispatch(
      updateEngineStatesAction(value, ["configuration2D", "partitionType"])
    );
    dispatch(
      updateEngineStatesAction(connectValue, ["configuration2D", "connectWith"])
    );
    dispatch(
      updateConfigurationStates(
        partitionWall.getLength(),
        "partitionWallLength"
      )
    );

    blueprint3d[0].floorplanner.view.draw();
    blueprint3d[1](blueprint3d[0]);
  };

  const handleChangeConnectWith = (value) => {
    let partitionWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["partition"]
    );
    let leftWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["left"]
    );
    let rightWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["right"]
    );
    let topWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["top"]
    );
    let bottomtWall = blueprint3d[0].floorplanner.floorplan.walls.find(
      (eachWall) => eachWall.id === wallIds["bottom"]
    );
    let moveXStart =
      value == "bottom"
        ? (bottomtWall.start.x + bottomtWall.end.x) / 2
        : (topWall.start.x + topWall.end.x) / 2;
    let moveYStart;
    let moveXEnd =
      value == "bottom"
        ? (topWall.start.x + topWall.end.x) / 2
        : (bottomtWall.start.x + bottomtWall.end.x) / 2;
    let moveYEnd;
    if (value == "bottom") {
      moveYStart = bottomtWall.start.y - 5 + 0.9;
      moveYEnd = topWall.start.y + minimumWallLength; // 65.996 it means we are subtract to some pixels
    } else if (value == "top") {
      moveYStart = topWall.start.y + 5 - 0.9;
      moveYEnd = bottomtWall.start.y - minimumWallLength; // 65.996 it means we are subtract to some pixels
    } else if (value == "right") {
      moveXStart = rightWall.start.x - 5 + 0.9;
      moveYStart =
        value == "right" && (rightWall.start.y + rightWall.end.y) / 2;
      moveXEnd = leftWall.start.x + minimumWallLength; // 65.996 it means we are subtract to some pixels
      moveYEnd = value == "right" && (leftWall.start.y + leftWall.end.y) / 2;
    } else {
      moveXStart = leftWall.start.x + 5 - 0.9;
      moveYStart = (leftWall.start.y + leftWall.end.y) / 2;
      moveXEnd = rightWall.start.x - minimumWallLength; // 65.996 it means we are subtract to some pixels
      moveYEnd = (rightWall.start.y + rightWall.end.y) / 2;
    }
    for (
      let index = 0;
      index < blueprint3d[0].floorplanner.floorplan.walls.length;
      index++
    ) {
      const eachWall = blueprint3d[0].floorplanner.floorplan.walls[index];

      if (eachWall.id == wallIds["partition"]) {
        eachWall.start.move(moveXStart, moveYStart);
        eachWall.end.move(moveXEnd, moveYEnd);
      }
    }

    dispatch(
      updateEngineStatesAction(value, ["configuration2D", "connectWith"])
    );
    dispatch(
      updateConfigurationStates(
        partitionWall.getLength(),
        "partitionWallLength"
      )
    );

    blueprint3d[0].floorplanner.view.draw();
    blueprint3d[1](blueprint3d[0]);
  };

  const Sliders = (name, onChange, value, range) => {
    return (
      <div className="first-silder">
        {/* <h3>{name}</h3> */}
        <div className="mainSlider ">
          <MinusCircleOutlined
            className="plusMin addicon"
            onClick={() => onMinPlusClick(name, "min")}
          />

          <Slider
            className="slider slider_step1_step2"
            min={1000}
            max={9000}
            onChange={onChange}
            tipFormatter={() => sliderTooltipFormatter(value)}
            value={typeof value === "number" ? value : 0}
            step={1}
          />
          <PlusCircleOutlined
            className="plusMin "
            onClick={() => onMinPlusClick(name, "plus")}
          />
        </div>

        <div className="data_line_one">
          <label>{range.min}</label>
          <label>{range.max}</label>
        </div>
      </div>
    );
  };

  const RoomLengthFn = (isMinOrPlus) => {
    let value = Math.floor(roomLength * perCmEqualToMm);
    if (isMinOrPlus == "min") {
      if (value <= 1601) {
        // onChangeLength(1200);
        return;
      }
      onChangeLength(value - 0.9);
    } else {
      if (value >= 9000) {
        // onChangeLength(9000);
        return;
      }
      console.log("roomlenght>value", value);
      onChangeLength(value + 1.1);
    }
  };
  const RoomBreathFn = (isMinOrPlus) => {
    let value = Math.floor(roomBreath * perCmEqualToMm);
    if (isMinOrPlus == "min") {
      if (value <= 1000) {
        // onChangeBreath(Math.floor(roomBreath * perCmEqualToMm) + 1);
        return;
      }
      onChangeBreath(value - 0.9);
    } else {
      if (value >= 9000) {
        // onChangeBreath(9000);
        return;
      }
      onChangeBreath(value + 1.1);
    }
  };
  const onMinPlusClick = (isLenghtOrBreath, isMinOrPlus) => {
    console.log("isLenghtOrBreath = ", isLenghtOrBreath, isMinOrPlus);
    isLenghtOrBreath === "Length" && RoomLengthFn(isMinOrPlus);
    isLenghtOrBreath === "Breath" && RoomBreathFn(isMinOrPlus);
  };

  const text = (val) => <span style={{ fontSize: "14px" }}>{val}</span>;

  return (
    <div className="step4">
      {/* <div className="dimensions-data"><h3>Dimensions</h3></div> */}
      <div className="first-silder">
        <div class="label_container_For_customization">
          <h3>Patishon Height (Lowest of the 3 measurements)</h3>
          {/* <Tooltip
            placement="topRight"
            title={text(
              "Please enter the lowest of the ceiling height measurements."
            )}
          >
            <InfoCircleOutlined />
          </Tooltip> */}
        </div>
        {/*<InputNumber*/}
        {/*  style={{*/}
        {/*    width: "100%",*/}
        {/*    height: "100%",*/}
        {/*  }}*/}
        {/*  placeholder="Enter the room height"*/}
        {/*  min={1500}*/}
        {/*  max={3000}*/}
        {/*  addonAfter={"mm"}*/}
        {/*  value={roomHeight ? roomHeight : 1500}*/}
        {/*  onChange={onHeightChange}*/}
        {/*  type="tel"*/}
        {/*/>*/}
        <Select
            style={{
              width: "100%",
              height: "100%",
            }}
            placeholder="Select the room height"
            value={roomHeight}
            onChange={onHeightChange}
        >
          <Option value={2000}>2000mm</Option>
          <Option value={2200}>2200mm</Option>
          <Option value={2300}>2300mm</Option>
          <Option value={2400}>2400mm</Option>
          <Option value={2500}>2500mm</Option>
          <Option value={2600}>2600mm</Option>
        </Select>
      </div>
      
      <div className="first-silder">
        <div class="label_container_For_customization">
          <h3>Room/Aperture Width (Where the Pātishon will be)</h3>
          {/* <Tooltip
            placement="topRight"
            title={text("Please enter the accurate width measurement.")}
          >
            <InfoCircleOutlined />
          </Tooltip> */}
        </div>
        <InputNumber
          style={{
            width: "100%",
            height: "100%",
          }}
          placeholder="Enter the breath"
          min={1000}
          max={9000}
          addonAfter={"mm"}
          value={calculateInputsValue(roomBreath)}
          onBlur={onChangeBreath}
          onPressEnter={onChangeBreath}
          type="tel"
          className="onBlur-input"
        />
      </div>
      {Sliders("Breath", onChangeBreath, calculateInputsValue(roomBreath), {
        min: "1000mm",
        max: "9000mm",
      })}
      {/* <div className="category-details bg_home">
        <h3>Partition Type</h3>
        <div className="good">
          <Radio.Group onChange={(e) => {
            // console.log("this is onchange = ", e.target.value)
            // dispatch(updateEngineStatesAction(e.target.value, ["configuration2D", "partitionType"]))
            handleChangePartitionTYpe(e.target.value)
          }} value={partitionType}>

            <div className="radio_line">
              <div >Vertical</div>
              <div className='btn_radio'><Radio value={"vertical"} /></div>
            </div>
            <div className="radio_line">
              <div >Horizontal</div>
              <div className='btn_radio'><Radio value={"horizontal"} /></div>
            </div>
          </Radio.Group>
        </div>

      </div> */}
      {localStoragePartitionType == "single" && (
        <div className="category-details bg_home">
          <h3>Connected With</h3>
          <div className="good">
            <Radio.Group
              onChange={(e) => {
                // console.log("this is onchange = ", e.target.value)
                // dispatch(updateEngineStatesAction(e.target.value, ["configuration2D", "partitionType"]))
                handleChangeConnectWith(e.target.value);
              }}
              value={connectWith}
            >
              <div className="radio_line">
                <div className="custom_width">
                  {partitionType == "vertical" ? "Top" : "Left Wall"}
                </div>
                <div className="btn_radio">
                  <Radio value={partitionType == "vertical" ? "top" : "left"} />
                </div>
              </div>
              <div className="radio_line special_case">
                <div className="custom_width">
                  {partitionType == "vertical" ? "Bottom" : "Right Wall"}
                </div>
                <div className="btn_radio">
                  <Radio
                    value={partitionType == "vertical" ? "bottom" : "right"}
                  />
                </div>
              </div>
            </Radio.Group>
          </div>
        </div>
      )}

      <div className="button top_new">
        
        <p style={{ color: "#fff", margin: "20px 0" }}>
          <span style={{ color: "red" }}>Note* :</span> If your dimensions
          exceed these limits please contact us.
        </p>
      </div>
      <div className="floating_next_btn">
      <button
          type="submit"
          onClick={() => {
            handleChangeState(undefined, 2);
            // dispatch(updateEngineStatesAction('3D', 'selectedType'))
          }}
          className="update-floorplan sucess_button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default memo(Step1);


/**
 <div className="first-silder">
        <div class="label_container_For_customization">
          <h3>Room Length (For accuracy of the model)</h3>
        </div>
        <InputNumber
          style={{
            width: "100%",
            height: "100%",
          }}
          placeholder="Enter the room Length"
          min={1000}
          max={9000}
          addonAfter={"mm"}
          value={calculateInputsValue(roomLength)}
          onPressEnter={onChangeLength}
          onBlur={onChangeLength}
          type="tel"
          className="onBlur-input"
        />
  </div>
  {Sliders("Length", onChangeLength, calculateInputsValue(roomLength), {
    min: "1000mm",
    max: "9000mm",
  })}
 */

