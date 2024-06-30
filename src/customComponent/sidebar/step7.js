import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { Slider } from 'antd';
import ThemeImages from "../../themes/appImage";
import { Tabs } from 'antd';
import { Radio } from 'antd';
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d";
import { LOCAL_SERVER } from "../../constant";
import { getMemoizedConfigurationData } from "../../redux/selectors/configuration";
import { dollyInZoom } from "../../common/utils";
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d";
import { configurationAction } from "../../redux/actionTypes";
import { updateConfigurationStates } from "../../redux/actions/configuration";
import { updateDispatch } from "../../common/blueprint3d";
const { TabPane } = Tabs;


let filmPrice = 0

const Step7 = (props) => {

  const dispatch = useDispatch()

  const reducerBluePrint = useSelector(getMemoizedBlueprint3dData)
  const configuratorData = useSelector(getMemoizedConfigurationData)
  const {
    totalPrice
  } = configuratorData

  const {
    step,
    handleChangeState,
    blueprint3d
  } = props

  let films = blueprint3d[0]?.globals?.getGlobal("films")
  console.log("arrayFilm", films);
  let filmsVariants = blueprint3d[0]?.globals?.getGlobal("films")
  let selectedFilm = blueprint3d[0]?.globals?.getGlobal("selectedFilm")

  let filterArr = filmsVariants.filter((item, index) => item.isActivated)

  const [filmsVariant, setFilmsVariant] = useState(selectedFilm)

  useEffect(() => {
    dollyInZoom(reducerBluePrint?.BP3DData)
  }, [])

  useEffect(() => {
    blueprint3d[0]?.globals?.getCurrentPrice()
    if (step < 7 || !(blueprint3d[0]?.globals?.getGlobal("selectedFilm"))) {
      filmPrice = 0
    }
  }, [blueprint3d[0]?.globals?.getGlobal("selectedFilm")])

  return (
    <div className='step4'>
      {/*<div className='dimensions-data varients'>*/}
      {/*  <h3>Films</h3>*/}
      {/*  <div className={`wrapper-frames-talent talent_data_point steps7 ${(filterArr.length > 0 && filterArr.length < 4) && 'grid_view' + filterArr.length}`}>*/}
      {/*    {filterArr.length > 0 && filterArr.map((item, index) => {*/}
      {/*      if (item?.isActivated) {*/}
      {/*        return (*/}
      {/*          <div className={`wrapper_frames ${filmsVariant == (item.name) && 'active'}`} >*/}
      {/*            <div className="second_div_step7 data_second_t"*/}
      {/*              style={{ backgroundColor: `${item.name}` }}*/}
      {/*              onClick={() => {*/}
      {/*                filmPrice = item.price*/}
      {/*                setFilmsVariant(item.name)*/}
      {/*                blueprint3d[0]?.globals?.setGlobal("selectedFilm", item.name)*/}
      {/*                reducerBluePrint?.BP3DData.model.floorplan.update()*/}
      {/*              }}*/}
      {/*            >*/}
      {/*              <img style={{ height: '100%' }} src={LOCAL_SERVER + item.image} className={`wrapper_frames ${filmsVariant == (item.name) && 'active'}`} alt="film" />*/}
      {/*            </div>*/}
      {/*            <p>{item.name}</p>*/}
      {/*          </div>*/}
      {/*        )*/}
      {/*      }*/}
      {/*    })*/}

      {/*    }*/}
      {/*  </div>*/}
      {/*</div>*/}
      <h3 className="panel_price mt-45">Looking great! Preview your finished Pātishon, then you can checkout.</h3>
      <div className="target-data-button-i">
        <div className='button'>
          <button type='submit' onClick={() => {
            handleChangeState(undefined, 8)
            blueprint3d[0]?.globals?.setGlobal("selectedFilm", null)
            reducerBluePrint?.BP3DData?.model?.floorplan?.update()
            blueprint3d[0]?.globals?.getCurrentPrice()
          }} className='sucess_button'>Skip</button>
        </div>
        <div className='button'>
          <button type='submit' onClick={() => {
            handleChangeState(undefined, 8)
          }} className='sucess_button'>Preview</button>
        </div>
      </div>
      {/* <div className="button_lite_ions">

        <div className='button'>
          <button type='submit' onClick={() => {
            handleChangeState(undefined, 8)
          }} className='sucess_button'>Next</button>
        </div>

      </div> */}
      {/* <p class="previous text-center prevois_prices">Previous Price = £{blueprint3d[0]?.globals?.getGlobal("previousPrice")} + film £{filmPrice}</p>
      <div className="floating-text">
        <p>total<br></br> price</p>
        <h3>£{totalPrice}</h3>
      </div> */}
    </div>
  )
}
export default Step7
