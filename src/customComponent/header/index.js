import React from "react";
import { useDispatch, useSelector } from "react-redux"
// import { browserHistory } from 'react-router'
import { useNavigate, useLocation, BrowserRouter } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faHouse, faCartShopping } from '@fortawesome/free-solid-svg-icons'
import ThemeImages from "../../themes/appImage";
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d"
import { getMemoizedBlueprint3dData } from "../../redux/selectors/blueprint3d"
import { Avatar, Badge } from "antd";
import ShoppingCartIcon from "../cartIcon";

const HeaderBar = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const location = useLocation()
  console.log("this is pathname = ", pathname)

  const reducerBlueprint = useSelector(getMemoizedBlueprint3dData)
  const {
    sidebarCollapsed,
    deviceType
  } = reducerBlueprint

  return (
    <div className={(deviceType == "desktop" || pathname == '/landing') ? "header_list" : 'header_list1'}>
      <ShoppingCartIcon />
      {
        (deviceType == 'desktop' || pathname == '/landing') ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={ThemeImages.logo} onClick={() => {
            localStorage.removeItem("selectedType")
            localStorage.removeItem("partitionType")
            navigate('/')
          }} style={{ cursor: 'pointer' }} />
        ) : (
          <>
            <FontAwesomeIcon
              style={{ cursor: 'pointer' }}
              icon={faHouse}
              onClick={() => {
                localStorage.removeItem("selectedType")
                localStorage.removeItem("partitionType")
                navigate('/')
                window.history.pushState({}, '', "/landing");
              }}
            />
            {console.log("this is header = ", deviceType, pathname)}
            <div className="logo_heading">
              <img src={ThemeImages.logo} />
            </div>
            {pathname !== "/payment" && pathname !== "/cart" && <div className="icon_heading">
              {sidebarCollapsed && <FontAwesomeIcon
                style={{ cursor: 'pointer' }}
                icon={faBars}
                onClick={() => {
                  dispatch(updateEngineStatesAction(false, 'sidebarCollapsed'))
                }}
              />}
            </div>}
          </>
        )
      }

    </div>
  )



}
export default HeaderBar