import React, { useState, useLayoutEffect, useEffect, CSSProperties } from 'react';
import { ClipLoader, SquareLoader, SyncLoader } from "react-spinners";

const override = {
    display: "block",
    margin: "0 auto",
    // borderColor: "#cbaf87",
    // backgroundColor: '#cbaf87'
};

const Loader = (props) => {

    const {
        loading
    } = props

    return (
        <div className='loader-container' style={{display: loading ? "block" : "none"}}>
            <div class="cube-wrapper">
            <div class="cube-folding">
                <span class="leaf1"></span>
                <span class="leaf2"></span>
                <span class="leaf3"></span>
                <span class="leaf4"></span>
            </div>
            <span class="loading" data-name="Loading">Loading</span>
        </div>
</div>

    )
}

export default Loader