import React, {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux";
import {getMemoizedConfigurationData} from "../../redux/selectors/configuration";
import "./step5.css";
import {ReactSortable} from "react-sortablejs";
import {updateConfigurationStates} from "../../redux/actions/configuration";
import {isInternetConnected} from "../../common/utils";
import {getMemoizedBlueprint3dData} from "../../redux/selectors/blueprint3d";

const Step5 = (props) => {
  const configuratorData = useSelector(getMemoizedConfigurationData)
  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const dispatch = useDispatch()

  const {
    clientWallWidth,
    skipThirdStep,
    newDoor,
    newPanels,
    roomHeight
  } = configuratorData

  const {
    handleChangeState,
    blueprint3d
  } = props

  const {
    BP3DData,
  } = reducerBluePrint

  const [maximumWidth, setMaximumWidth] = useState(clientWallWidth)
  const [currentWidth, setCurrentWidth] = useState(0)
  const [panelDragged, setPanelDragged] = useState(false)

  const [items, setItems] = useState([
    { id: 1, name: '150 mm', value: 150 },
    { id: 2, name: '350 mm', value: 350 },
    { id: 3, name: '550 mm', value: 550 },
    { id: 4, name: '750 mm', value: 750 }
  ]);

  const [addedPanels, setAddedPanels] = useState([]);

  const cloneFunction = (item) => {
    return { ...item, id: new Date().getTime() };
  };

  const removeSortableItem = (id, setList) => {
    setList((prevList) => prevList.filter((item) => item.id !== id));
  };

  const calcCurrentWidth = () => {
    return addedPanels.reduce((total, item) => total + item.value, 0)
  }

  const onSetSortableList = (newState) => {
    const newPanel = newState.find(item => !addedPanels.some(panel => panel.id === item.id));

    const remainWidth = maximumWidth - currentWidth;
    if (newState.length > addedPanels.length && newPanel && newPanel.value > remainWidth) {
      alert("Cannot add panel, not enough space!");
    } else {
      setAddedPanels(newState);
    }
  }

  const onApplyChanges = async () => {
    if (addedPanels[0].name === "Door" || addedPanels[addedPanels.length - 1].name === "Door") {
      alert("Door can not be on the start or on the end of Patishon")
    } else {
      if (newDoor.doorCategory === "sliding") {
        const { leftDistance, rightDistance } = calcDistanceFromWallToDoor()

        if (newDoor.doorSize === 1155 && (leftDistance < 550 || rightDistance < 550)) {
          alert("Minimum width on the left and right must be greater than or equal to 550mm")
          return
        }

        if (newDoor.doorSize === 1630 && (leftDistance < 750 || rightDistance < 750)) {
          alert("Minimum width on the left and right must be greater than or equal to 750mm")
          return
        }

        handleChangeState(undefined, 6)
      }
      handleChangeState(undefined, 6)
    }
  }

  const calcDistanceFromWallToDoor = () => {
    const doorIndex = addedPanels.findIndex(item => item.name === "Door");
    const leftDistance = addedPanels.slice(0, doorIndex).reduce((sum, item) => sum + item.value, 0);
    const rightDistance = addedPanels.slice(doorIndex + 1).reduce((sum, item) => sum + item.value, 0);

    return { leftDistance, rightDistance }
  }

  useEffect(() => {
    setCurrentWidth(calcCurrentWidth())
    dispatch(updateConfigurationStates([...addedPanels], 'newPanels'))
  }, [addedPanels]);

  useEffect(() => {
    if (newPanels && newPanels.length > 0) {
      setAddedPanels([...newPanels]);
    } else {
      setCurrentWidth(newDoor.doorSize)
    }
  }, []);

  const handleApply = () => {
    if (isInternetConnected()) {
      blueprint3d[0]?.globals?.setGlobal("numberOfPanelsRight", 4)
      reducerBluePrint?.BP3DData.model.floorplan.update()
      BP3DData.three.controls.update();
    }
  }

  useEffect(() => {
    handleApply()
    dispatch(updateConfigurationStates(true, 'stepMoreThan3'))
  }, [])

  useEffect(() => {
    if (!skipThirdStep) {
      setAddedPanels([{ id: 1, name: 'Door', value: newDoor.doorSize }])
    } else {
      dispatch(updateConfigurationStates([], 'newPanels'))
    }
  }, [skipThirdStep]);

  const getCssCoefficient = () => {
    if (maximumWidth < 5500) {
      return 0.19
    } else if (maximumWidth > 5500 && maximumWidth < 8000) {
      return 0.13
    } else {
      return 0.12
    }
  }

  return (
      <div className='step4 step4WithPrice content-center'>
        <div className='dimensions-data'>
          <div className="label_container_For_customization custom_centered_aligned">
            <h3>Panels</h3>
          </div>
        </div>

        <div className="first-silder">
          <span className='width-label'>Drag and drop the panels to the drawing below</span>

          <ReactSortable
              tag='div'
              className='sortable-item-1'
              list={items}
              setList={setItems}
              group={{name: 'shared', pull: 'clone', put: false}}
              sort={false}
              onChoose={() => setPanelDragged(true)}
              onUnchoose={() => setPanelDragged(false)}
          >
            {items.map((item, index) => (
                <div
                    className='sortable-item-1__item'
                    key={item.id}
                    style={{width: item.value * getCssCoefficient() + 'px'}}
                >
                  <span style={item.value === 150 ? { writingMode: 'vertical-rl' } : {}}>
                    {item.name}
                  </span>
                </div>
            ))}
          </ReactSortable>

          <div className="position-relative">
            <div
                className="top-decor-line"
                style={{width: clientWallWidth * getCssCoefficient() + 10 + 'px'}}
            >
              <div className="top-decor-line__text">
                {clientWallWidth} mm
              </div>
            </div>

            <div className="position-relative">
              <ReactSortable
                  tag='div'
                  className={panelDragged ? 'patishon-container-scroll patishon-container-scroll--active' : 'patishon-container-scroll'}
                  list={addedPanels}
                  setList={(newState) => onSetSortableList(newState)}
                  group={{name: 'shared', pull: 'clone', put: true}}
                  clone={cloneFunction}
                  animation={400}
                  swap={true}
                  delayOnTouchStart={true}
                  delay={2}
                  style={{width: clientWallWidth * getCssCoefficient() + 10 + 'px'}}
              >
                {addedPanels.map((item, index) => (
                    <div
                        className='sortable-item-1__item'
                        key={item.id}
                        style={item.name === 'Door' ? {
                          width: newDoor.doorSize * getCssCoefficient() + 'px',
                          borderWidth: 5,
                          zIndex: 100
                        } : {
                          width: item.value * getCssCoefficient() + 'px',
                        }}
                    >
                      <span style={item.value === 150 ? {writingMode: 'vertical-rl'} : {}}>
                        {item.name}
                      </span>

                      {item.name !== 'Door'
                          ? <div
                              onClick={() => removeSortableItem(item.id, setAddedPanels)}
                              className="remove-item-icon"
                          >
                            ×
                          </div>
                          : ''
                      }
                    </div>
                ))}
              </ReactSortable>
              <div className="reight-decor-line">
                <div className="reight-decor-line__text">
                  {roomHeight} mm
                </div>
              </div>
            </div>
          </div>
        </div>

        <span className='width-label'>Your Room Width: {maximumWidth}mm</span>
        <span className='width-label'>Your Panels Width: {currentWidth}mm</span>
        <span className='width-label'>Remain: {maximumWidth - currentWidth}mm</span>

        <div className="floating-text special_case" style={{display: 'block'}}>
          <div className="button-container">
            <button type='submit' onClick={() => onApplyChanges()} className='sucess_button'>
              Apply changes
            </button>
          </div>
        </div>
      </div>
  )
}

export default Step5