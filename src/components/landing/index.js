import React, { useState, useLayoutEffect, useEffect, CSSProperties } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'

import { Slider } from 'antd';
import HeaderBar from '../../customComponent/header';
import { getProductsInitiate } from '../../redux/actions/product'
import view from '../../images/view.jpg'
import { getMemoizedProductsData } from '../../redux/selectors/product'
import { updateEngineStatesAction } from "../../redux/actions/blueprint3d"
import Loading from '../../customComponent/loader'
import { LOCAL_SERVER } from "../../constant"
import { DataManager } from '../../common/utils';
import {getRoomSizeInitiate, updateConfigurationStates} from '../../redux/actions/configuration';


const Landing = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const productData = useSelector(getMemoizedProductsData)
  const {
    productListSuccess,
    productListLoader,
    productList
  } = productData

  useEffect(() => {
    dispatch(updateEngineStatesAction(false, "infoPopUp"))
    dispatch(getProductsInitiate())
    dispatch(updateEngineStatesAction(false, 'sidebarCollapsed'))

    dispatch(updateConfigurationStates([], 'newPanels'))
    dispatch(updateConfigurationStates('clear', 'glassCovering'))
  }, [])

  return (
    <div>
      <HeaderBar />
      {(productList && productList.length > 0 && !productListLoader) ?
        <div className='bg'>
          <h2 className='product-listing'>Products Listing</h2>
          <div className={`try_new ${productList.length === 1 ? 'single' : productList.length === 2 ? 'double' : 'triple'}`}>
            {
              productList.map((item, index) => {
                if (item.productName === 'Fixed to one wall') {
                  return (
                    <div className='data_try'>
                      <div className='img_div'>
                        <img alt='' src={`${LOCAL_SERVER}${item.productImage}`} />
                      </div>
                      <div>
                        <h2>Fixed to one wall</h2>
                        <button
                          type='submit'
                          className='build_on'
                          onClick={() => {
                            // dispatch(updateEngineStatesAction('top', ["configuration2D", "connectWith"]))
                            dispatch(updateEngineStatesAction(false, 'sidebarCollapsed'))
                            DataManager.setPartitionType('single')
                            navigate('/home')
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          Build Your Own
                        </button>
                      </div>
                    </div>
                  )
                } else if (item.productName === 'Fixed to two wall') {
                  return (
                    <div className='data_try white_box'>
                      <div className='img_div'>
                        <img alt='' src={`${LOCAL_SERVER}${item.productImage}`} />
                      </div>
                      <div>
                        <h2>Fixed to two walls</h2>
                        <button
                          type='submit'
                          className='build_on wall'
                          onClick={() => {
                            // dispatch(updateEngineStatesAction('top', ["configuration2D", "connectWith"]))
                            dispatch(updateEngineStatesAction(false, 'sidebarCollapsed'))
                            DataManager.setPartitionType('fixed')
                            navigate('/home')
                          }}
                        >
                          Build Your Own
                        </button>
                      </div>
                    </div>
                  )

                } else {
                  return (
                    <div className='data_try last_img'>
                      <div className='img_div'>
                        <img alt='' src={`${LOCAL_SERVER}${item.productImage}`} />
                      </div>
                      <div>
                        <h2>Floating</h2>
                        <button
                          type='submit'
                          className='build_on'
                          onClick={() => {
                            // dispatch(updateEngineStatesAction('float', ["configuration2D", "connectWith"]))
                            dispatch(updateEngineStatesAction(false, 'sidebarCollapsed'))
                            DataManager.setPartitionType('floating')
                            navigate('/home')
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          Build Your Own
                        </button>
                      </div>
                    </div>
                  )
                }
              })
            }
          </div>
        </div>
        :
        null
        // <Loading loading={productListLoader} />
      }

    </div>
  )

}
export default Landing