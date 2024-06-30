import React from 'react'
import {Radio} from 'antd'

const GlassCovering = (props) => {
    const {
        handleChangeState,
        blueprint3d,
        prevStep
    } = props

    return (
        <div className='first-silder glass-covering glass-covering-container'>
            <div className='label_container_For_customization justify-center'>
                <h3 className='glass-covering__title'>Glass Covering</h3>
            </div>

            <Radio.Group className='column-container'>
                <div className='radio_line'>
                    <div className='radio-item--with-img'>
                        <span className='radio-item__label'>Clear</span>
                        <img src='static/images/etched.png'/>
                    </div>
                    <div className='btn_radio'><Radio defaultChecked value={'0'}/></div>
                </div>

                <div className='radio_line'>
                    <div className='radio-item--with-img'>
                        <span className='radio-item__label'>Etched</span>
                        <img src='static/images/etched.png'/>
                    </div>
                    <div className='btn_radio'><Radio defaultChecked value={'1'}/></div>
                </div>

                <div className='radio_line'>
                    <div className='radio-item--with-img'>
                        <span className='radio-item__label'>Reeded Glass</span>
                        <img src='static/images/reeded-glass.jpg'/>
                    </div>
                    <div className='btn_radio'><Radio value={'2'}/></div>
                </div>

                <div className='radio_line'>
                    <div className='radio-item--with-img'>
                        <span className='radio-item__label'>Rice Paper</span>
                        <img src='static/images/rice-paper.png'/>
                    </div>
                    <div className='btn_radio'><Radio value={'3'}/></div>
                </div>
            </Radio.Group>

            <div className='glass-covering__next-btn-container'>
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
