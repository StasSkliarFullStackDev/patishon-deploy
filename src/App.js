import React from 'react'
import $ from 'jquery'
import AppRoutes from './routes/routes'
import { useDispatch, useSelector } from "react-redux"

import { ToastContainer } from "react-nextjs-toast";
import "./css/style.css";
import "./css/responsive.css";
import 'antd/dist/antd.min.css'; // or 'antd/dist/antd.less'
import { useEffect, useLayoutEffect } from 'react';
import { updateDispatch, updateReducerBlueprint, updateReducerConfiguration } from "../src/common/blueprint3d"
import { updateReducerBlueprintHoc } from '../src/hoc/mainLayout'
import { BP3D } from '../src/common/blueprint3d';
import { updateEngineStatesAction } from './redux/actions/blueprint3d';
import { getMemoizedBlueprint3dData } from './redux/selectors/blueprint3d'
import { getMemoizedConfigurationData } from './redux/selectors/configuration'
import { mainFunction2 } from './components/view3D/script';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import Loader from './customComponent/loader';
import { getCartItemsInitiate } from './redux/actions/cart';
import { getMemoizedCartData } from './redux/selectors/cart';
import { Modal, Image } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { isInternetConnected } from './common/utils';
import { skipTrigger } from './customComponent/sidebar/step3Doors';
import { updateConfigurationStates } from './redux/actions/configuration';
import ThemeImages from './themes/appImage';

function App(props) {
  const loader = new FontLoader();

  const dispatch = useDispatch()
  const reducerBlueprint = useSelector(getMemoizedBlueprint3dData)
  const configuratorData = useSelector(getMemoizedConfigurationData)

  const {
    handleChangeState,
    blueprint3d,
  } = props
  const {
    hingeLoader,
    step3HandleApply,
    partitionLeftWallLength
  } = configuratorData
  const {
    perCmEqualToMm,
    BP3DData
  } = reducerBlueprint
  const reducerCart = useSelector(getMemoizedCartData)
  const { addItemLoader } = reducerCart

  let deviceWidth = window.innerWidth
  let deviceHeight = window.innerHeight

  window.addEventListener('resize', () => {
    deviceWidth = window.innerWidth
    // alert("this is triggered 1")
    // if (deviceWidth < 500) {
    //   dispatch(updateEngineStatesAction(true, 'sidebarCollapsed'))
    // } else {
    //   dispatch(updateEngineStatesAction(false, 'sidebarCollapsed'))
    // }
  })

  useLayoutEffect(() => {
    if (reducerBlueprint?.selectedType == "3D") {
      $("#draw-walls-hint_3d").show();
    } else {
      $("#draw-walls-hint_3d").hide();
    }
  }, [reducerBlueprint?.selectedType])

  useLayoutEffect(() => {
    dispatch(getCartItemsInitiate())
    console.log("this is device width = ", deviceWidth, deviceHeight)
    let val = 4000 / 457.32
    // let val = 4000 / 447.32

    if (deviceWidth > 500) {
      dispatch(updateEngineStatesAction(false, 'sidebarCollapsed'))
      dispatch(updateEngineStatesAction(val, 'perCmEqualToMm'))
    } else {
      val = 7000 / 457.31
      dispatch(updateEngineStatesAction(val, 'perCmEqualToMm'))
    }
    loader.load('/static/fonts/helvetiker_bold.typeface.json', function (font) {
      console.log("font loadedededed", font);
      dispatch(updateEngineStatesAction(font, 'indicatorFont'))
    })
  }, [])

  useLayoutEffect(() => {
    updateDispatch(dispatch)
    updateReducerBlueprint(reducerBlueprint)
    updateReducerBlueprintHoc(reducerBlueprint)
    updateReducerConfiguration(configuratorData)
  }, [reducerBlueprint, configuratorData])


  const { confirm, destroyAll } = Modal;

  useEffect(() => {
    // window.addEventListener('popstate', () => setInfoPopUp(false))
    console.log("this is modal useEffect = ", reducerBlueprint?.infoPopUp);
    if (reducerBlueprint?.infoPopUp && window.location.pathname !== "/payment") {
      showConfirm()
    } else {
      destroyAll()
    }

  }, [reducerBlueprint?.infoPopUp])

  const showConfirm = () => {
    confirm({
      title: '',
      closable: false,
      icon: reducerBlueprint?.configurationStep != 3 && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image height={350} width={350} src={ThemeImages.popNotification} /></div>,
      content: reducerBlueprint?.configurationStep == 3 ? "Are you looking for a door in your Pātishon? It will increase the lead time to 3 weeks" : 'The Ceiling height and Room/Aperture width must be as accurate as possible (within 5mm) in order for us to produce the perfect product for your space. Please see the image above for measurements required.',
      okText: reducerBlueprint?.configurationStep == 3 ? "Yes I want a door" : "Accept",
      cancelText: reducerBlueprint?.configurationStep == 3 ? "I'm not looking for a door " : "",
      onOk() {
        console.log('OK');
        dispatch(updateEngineStatesAction(false, "infoPopUp"))
        // setInfoPopUp(false)
      },
      cancelButtonProps: {
        style: { display: reducerBlueprint?.configurationStep == 3 ? "" : 'none' }
      },
      onCancel() {

        dispatch(updateEngineStatesAction(false, "infoPopUp"))
        dispatch(updateConfigurationStates(true, 'skipThirdStep'))

      },
      centered: true
    });
  };

  return (
    <div className="App">
      <Loader loading={(hingeLoader && step3HandleApply) || addItemLoader} />
      <ToastContainer align={"center"} position={"bottom"} />
      <AppRoutes />
    </div>
  );
}

export default App;
