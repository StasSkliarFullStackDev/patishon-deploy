import React from 'react'
import {Radio} from 'antd'
import {updateConfigurationStates} from '../../redux/actions/configuration'
import {useDispatch, useSelector} from 'react-redux'
import {getMemoizedConfigurationData} from '../../redux/selectors/configuration'

const GlassCovering = (props) => {
    const { handleChangeState } = props
    const dispatch = useDispatch()
    const configurationData = useSelector(getMemoizedConfigurationData)
    const { glassCovering } = configurationData

    const handleChangeGlassCovering = (value) => {
        dispatch(updateConfigurationStates(value, 'glassCovering'))
    }

    return (
        <div className='first-silder glass-covering glass-covering-container'>
            <div className='label_container_For_customization justify-center'>
                <h3 className='glass-covering__title'>Glass Covering</h3>
            </div>

            <Radio.Group
                value={glassCovering}
                onChange={(e) => { handleChangeGlassCovering(e.target.value) }}
                className='column-container'
            >
                <div className='radio_line'>
                    <div className='radio-item--with-img'>
                        <span className='radio-item__label'>Clear</span>
                        <img src='static/images/etched.png'/>
                    </div>
                    <div className='btn_radio'><Radio defaultChecked value='clear'/></div>
                </div>

                <div className='radio_line'>
                    <div className='radio-item--with-img'>
                        <span className='radio-item__label'>Etched</span>
                        <img src='static/images/etched.png'/>
                    </div>
                    <div className='btn_radio'><Radio value='etched'/></div>
                </div>

                <div className='radio_line'>
                    <div className='radio-item--with-img'>
                        <span className='radio-item__label'>Reeded Glass</span>
                        <img src='static/images/reeded-glass.jpg'/>
                    </div>
                    <div className='btn_radio'><Radio value='reeded'/></div>
                </div>

                <div className='radio_line'>
                    <div className='radio-item--with-img'>
                        <span className='radio-item__label'>Rice Paper</span>
                        <img src='static/images/rice-paper.png'/>
                    </div>
                    <div className='btn_radio'><Radio value='rice-paper'/></div>
                </div>
            </Radio.Group>
            
            <div className="floating_next_btn">
                <button
                    onClick={() => {
                        handleChangeState(undefined, 3);
                    }}
                    className='sucess_button glass-covering__next-btn'
                >
                    Next
                </button>
            </div>
        </div>
    )
}
export default GlassCovering
