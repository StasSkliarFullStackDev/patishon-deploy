import React, {useEffect, useState} from "react"
import {useDispatch, useSelector} from "react-redux";
import {getMemoizedConfigurationData} from "../../redux/selectors/configuration";
import "./step5.css";
import {ReactSortable} from "react-sortablejs";
import {updateConfigurationStates} from "../../redux/actions/configuration";

const Step5 = (props) => {
  const configuratorData = useSelector(getMemoizedConfigurationData)
  const dispatch = useDispatch()

  const {
    clientWallWidth,
    skipThirdStep,
    newDoor,
    newPanels
  } = configuratorData

  const {
    handleChangeState,
  } = props

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

  useEffect(() => {
    if (!skipThirdStep) {
      setAddedPanels([{ id: 1, name: 'Door', value: newDoor.doorSize }])
    }
  }, [skipThirdStep]);

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

  const onApplyChanges = () => {
    if (addedPanels[0].name === "Door" || addedPanels[addedPanels.length - 1].name === "Door") {
      alert("Door can not be on the start or on the end of Patishon")
    } else {
      if (newDoor.doorCategory === "sliding") {
        const { leftDistance, rightDistance } = calcDistanceFromWallToDoor()

        if (newDoor.doorType === "single" && newDoor.directionOfOpening === "left" && leftDistance < newDoor.doorSize) {
          alert('Not enough space left')
          return
        }

        if (newDoor.doorType === "single" && newDoor.directionOfOpening === "right" && rightDistance < newDoor.doorSize) {
          alert('Not enough space right')
          return
        }

        if (newDoor.doorType === "double" && (rightDistance < newDoor.doorSize / 2)) {
          alert('Not enough space right')
          return
        }

        if (newDoor.doorType === "double" && (leftDistance < newDoor.doorSize / 2)) {
          alert('Not enough space left')
          return
        }

        alert("success")
        handleChangeState(undefined, 6)
      }
      alert('success')
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

  return (
      <div className='step4 step4WithPrice'>
        <div className='dimensions-data'>
          <div className="label_container_For_customization custom_centered_aligned">
            <h3>Panels</h3>
            <h3>(In progress)</h3>
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
                    className={'sortable-item-1__item ' + ('panel--' + item.value + 'mm')}
                    key={item.id}
                >
                  {item.name}
                </div>
            ))}
          </ReactSortable>

          <div
              className="top-decor-line"
              style={{width: clientWallWidth * 0.1125 + 10 + 'px'}}
          >
            <div className="top-decor-line__text">
              {clientWallWidth} mm
            </div>
          </div>

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
              style={{width: clientWallWidth * 0.1125 + 10 + 'px'}}
          >
            {addedPanels.map((item, index) => (
                <div
                    className={'sortable-item-1__item ' + (item.value ? ('panel--' + item.value + 'mm') : '')}
                    key={item.id}
                    style={item.name === 'Door' ? { width: newDoor.doorSize * 0.1125 + 'px' } : {}}
                >
                  <span>{item.name}</span>

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
        </div>

        <span className='width-label'>Your Room Width: {maximumWidth}mm</span>
        <span className='width-label'>Your Patishon Width: {currentWidth}mm</span>
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