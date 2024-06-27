import React, { useLayoutEffect } from 'react'
import * as THREE from 'three'
import { BP3D } from '../../common/blueprint3d';
// import { useLoader } from '@react-three/fiber'
// import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const toVec2 = (pos) => {
    return new THREE.Vector2(pos.x, pos.y);
}

const toVec3 = (pos, height) => {
    height = height || 0;
    return new THREE.Vector3(pos.x, height, pos.y);
}

// export const mainFunction = () => {
//     // Canvas
//     const canvas = document.querySelector('canvas.webgl')

//     // Scene
//     const scene = new THREE.Scene()

//     /*
//     * Textures
//     */

//     const textureLoader = new THREE.TextureLoader()

//     const bricksColorTexture = textureLoader.load('/static/textures/bricks/color.jpg')
//     const bricksAmbientOcclusionTexture = textureLoader.load('/static/textures/bricks/ambientOcclusion.jpg')
//     const bricksNormalTexture = textureLoader.load('/static/textures/bricks/normal.jpg')
//     const bricksRoughnessTexture = textureLoader.load('/static/textures/bricks/roughness.jpg')

//     const grassColorTexture = textureLoader.load('/static/textures/grass/color.jpg')
//     const grassAmbientOcclusionTexture = textureLoader.load('/static/textures/grass/ambientOcclusion.jpg')
//     const grassNormalTexture = textureLoader.load('/static/textures/grass/normal.jpg')
//     const grassRoughnessTexture = textureLoader.load('/static/textures/grass/roughness.jpg')

//     grassColorTexture.repeat.set(8, 8)
//     grassAmbientOcclusionTexture.repeat.set(8, 8)
//     grassNormalTexture.repeat.set(8, 8)
//     grassRoughnessTexture.repeat.set(8, 8)

//     grassColorTexture.wrapS = THREE.RepeatWrapping
//     grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
//     grassNormalTexture.wrapS = THREE.RepeatWrapping
//     grassRoughnessTexture.wrapS = THREE.RepeatWrapping

//     grassColorTexture.wrapT = THREE.RepeatWrapping
//     grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
//     grassNormalTexture.wrapT = THREE.RepeatWrapping
//     grassRoughnessTexture.wrapT = THREE.RepeatWrapping

//     // console.log("first = ", bricksColorTexture)

//     // House container
//     const house = new THREE.Group()
//     scene.add(house)

//     //Floor
//     const floor = new THREE.Mesh(
//         new THREE.PlaneGeometry(10, 10),
//         new THREE.MeshBasicMaterial({
//             map: grassColorTexture,
//             aoMap: grassAmbientOcclusionTexture,
//             normalMap: grassNormalTexture,
//             roughnessMap: grassRoughnessTexture
//             // color: '#808080'
//         })
//     )
//     // floor.receiveShadow = true
//     // floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))
//     floor.rotation.x = - Math.PI * 0.5

//     house.add(floor)

//     //Walls
//     const geometry = new THREE.BoxGeometry(2, 2, 0.2);

//     console.log("this is geometry = ", geometry)

//     var cubeMaterialArray = [
//         new THREE.MeshBasicMaterial({
//             map: bricksColorTexture,
//             aoMap: bricksAmbientOcclusionTexture,
//             normalMap: bricksNormalTexture,
//             roughnessMap: bricksRoughnessTexture
//         }),
//         new THREE.MeshBasicMaterial({
//             map: bricksColorTexture,
//             aoMap: bricksAmbientOcclusionTexture,
//             normalMap: bricksNormalTexture,
//             roughnessMap: bricksRoughnessTexture
//         }),
//         new THREE.MeshBasicMaterial({
//             map: bricksColorTexture,
//             aoMap: bricksAmbientOcclusionTexture,
//             normalMap: bricksNormalTexture,
//             roughnessMap: bricksRoughnessTexture,
//         }),
//         new THREE.MeshBasicMaterial({
//             map: bricksColorTexture,
//             aoMap: bricksAmbientOcclusionTexture,
//             normalMap: bricksNormalTexture,
//             roughnessMap: bricksRoughnessTexture
//         }),
//         new THREE.MeshBasicMaterial({
//             map: bricksColorTexture,
//             aoMap: bricksAmbientOcclusionTexture,
//             normalMap: bricksNormalTexture,
//             roughnessMap: bricksRoughnessTexture
//         }),
//         new THREE.MeshBasicMaterial({
//             map: bricksColorTexture,
//             aoMap: bricksAmbientOcclusionTexture,
//             normalMap: bricksNormalTexture,
//             roughnessMap: bricksRoughnessTexture
//         })
//     ];

//     // order to add materials: x+,x-,y+,y-,z+,z-


//     // const cubeMaterials = new THREE.MeshToonMaterial(cubeMaterialArray);

//     // const materialWall1 = new THREE.MeshBasicMaterial({
//     //     // map: bricksColorTexture,
//     //     // aoMap: bricksAmbientOcclusionTexture,
//     //     // normalMap: bricksNormalTexture,
//     //     // roughnessMap: bricksRoughnessTexture
//     //     color: '#808000'
//     // });
//     const wall1 = new THREE.Mesh(geometry, cubeMaterialArray);
//     // wall1.receiveShadow = true
//     // wall1.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(wall1.geometry.attributes.uv.array, 2))

//     wall1.position.y = 1

//     // const materialWall2 = new THREE.MeshBasicMaterial({
//     //     map: bricksColorTexture,
//     //     aoMap: bricksAmbientOcclusionTexture,
//     //     normalMap: bricksNormalTexture,
//     //     roughnessMap: bricksRoughnessTexture
//     //     // color: '#808000'
//     // });
//     // const wall2 = new THREE.Mesh(geometry, materialWall2);
//     // wall2.rotation.y = - Math.PI * 0.5
//     // wall2.position.set(1.10, 1, 0.90)

//     // const materialWall3 = new THREE.MeshBasicMaterial({
//     //     map: bricksColorTexture,
//     //     aoMap: bricksAmbientOcclusionTexture,
//     //     normalMap: bricksNormalTexture,
//     //     roughnessMap: bricksRoughnessTexture
//     //     // color: '#808000'
//     // });

//     // const wall3 = new THREE.Mesh(geometry, materialWall3);
//     // wall3.rotation.y = - Math.PI * 0.5
//     // wall3.position.set(-1.10, 1, 0.90)

//     // const materialWall4 = new THREE.MeshBasicMaterial({
//     //     map: bricksColorTexture,
//     //     aoMap: bricksAmbientOcclusionTexture,
//     //     normalMap: bricksNormalTexture,
//     //     roughnessMap: bricksRoughnessTexture
//     //     // color: '#808000'
//     // });
//     // const wall4 = new THREE.Mesh(geometry, materialWall4);
//     // wall4.position.y = 1
//     // wall4.position.z = 2 - 0.2

//     house.add(wall1);

//     // Camera
//     const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
//     camera.position.x = 0
//     camera.position.y = 3
//     camera.position.z = 3
//     scene.add(camera)

//     // Controls
//     const controls = new OrbitControls(camera, canvas)
//     controls.enableDamping = true

//     // Renderer
//     const renderer = new THREE.WebGLRenderer({
//         canvas: canvas
//     })
//     renderer.setSize(window.innerWidth, window.innerHeight);


//     const tick = () => {

//         // Update controls
//         controls.update()

//         // Render
//         renderer.render(scene, camera)

//         // Call tick again on the next frame
//         window.requestAnimationFrame(tick)
//     }

//     tick()
// }

// FLoor

// function buildFloor() {
//     var textureSettings = {
//         url: 'https://www.feldsparhomes.com:8001/assets/5f0dddf4e5148d0ef82ff066',
//         scale: 5
//     }
//     // setup texture
//     var texLoader = new THREE.TextureLoader();
//     texLoader.setCrossOrigin('');
//     var floorTexture = texLoader.load(textureSettings.url);
//     floorTexture.wrapS = THREE.RepeatWrapping;
//     floorTexture.wrapT = THREE.RepeatWrapping;
//     floorTexture.repeat.set(1, 1);
//     var floorMaterialTop = new THREE.MeshPhongMaterial({
//         map: floorTexture,
//         side: THREE.DoubleSide,
//         // ambient: 0xffffff, TODO_Ekki
//         color: 0xcccccc,
//         specular: 0x0a0a0a
//     });
//     var textureScale = textureSettings.scale;
//     // http://stackoverflow.com/questions/19182298/how-to-texture-a-three-js-mesh-created-with-shapegeometry
//     // scale down coords to fit 0 -> 1, then rescale
//     var points = [];
//     scope.room.interiorCorners.forEach(function (corner) {
//         points.push(new THREE.Vector2(corner.x / textureScale, corner.y / textureScale));
//     });
//     var shape = new THREE.Shape(points);
//     var geometry = new THREE.ShapeGeometry(shape);
//     var floor = new THREE.Mesh(geometry, floorMaterialTop);
//     floor.rotation.set(Math.PI / 2, 0, 0);
//     floor.scale.set(textureScale, textureScale, textureScale);
//     floor.receiveShadow = true;
//     floor.castShadow = false;
//     return floor;
// }


export const mainFunction2 = (data) => {
    console.log("this is main function = ", data[0].floorplanner.view.floorplan.walls[0].backEdge.exteriorStart());

    // Canvas
    const canvas = document.querySelector('canvas.webgl')

    // Scene
    const scene = new THREE.Scene()


    // House container
    const house = new THREE.Group()
    scene.add(house)


    // TexturesFloor
    var textureSettings = {
        url: 'https://www.feldsparhomes.com:8001/assets/5f0dddf4e5148d0ef82ff066',
        scale: 5
    }
    var texLoader = new THREE.TextureLoader();
    texLoader.setCrossOrigin('');
    var floorTexture = texLoader.load(textureSettings.url);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(1, 1);

    //Floor
    var textureScale = textureSettings.scale;
    // http://stackoverflow.com/questions/19182298/how-to-texture-a-three-js-mesh-created-with-shapegeometry
    // scale down coords to fit 0 -> 1, then rescale

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.5),
        new THREE.MeshBasicMaterial({
            map: floorTexture,
            side: THREE.DoubleSide,
            // ambient: 0xffffff, TODO_Ekki
            color: 0xcccccc,
            // specular: 0x0a0a0a
        })
    )
    floor.rotation.set(Math.PI / 2, 0, 0);
    floor.scale.set(textureScale, textureScale, textureScale);
    floor.receiveShadow = true;
    floor.castShadow = false;

    house.add(floor)

    //Filler with actual in fieldsper code
    // var points = [
    //     toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.exteriorStart()),
    //     toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.exteriorEnd()),
    //     toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.interiorEnd()),
    //     toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.interiorStart())
    // ];
    // console.log("this is cu")
    // var fillerMaterial = new THREE.MeshBasicMaterial({
    //     color: 'yellow',
    //     side: THREE.BackSide
    // });

    // var shape = new THREE.Shape();
    // // shape.moveTo(x + 10, y + 10);
    // // shape.add()
    // var geometry = new THREE.ShapeGeometry(shape);
    // var filler = new THREE.Mesh(geometry, fillerMaterial);
    // filler.rotation.set(Math.PI / 2, 0, 0);
    // filler.position.y = 5;
    // house.add(filler)

    // Filler another approach
    // var points = [
    //     toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.exteriorStart()),
    //     toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.exteriorEnd()),
    //     toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.interiorEnd()),
    //     toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.interiorStart())
    // ];
    // var points1 = new Float32Array([
    //     199.85099999999989, 294.052, 0,
    //     199.85099999999989, -183.308, 0,
    //     209.85099999999989, -173.308, 0,
    //     209.85099999999989, 284.052, 0
    // ])
    // console.log("this is points = ", points1)
    // const positionAttributes = new THREE.BufferAttribute(points1, 2)
    // var geometry = new THREE.BufferGeometry();
    // geometry.setAttribute('position', positionAttributes)
    // var fillerMaterial = new THREE.MeshBasicMaterial({
    //     color: 'yellow',
    //     side: THREE.BackSide
    // });
    // // shape.moveTo(x + 10, y + 10);
    // // shape.add()

    // var filler = new THREE.Mesh(geometry, fillerMaterial);
    // // filler.position.y = 5;
    // house.add(filler)

    // Filler Approach 3
    var points = [
        toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.exteriorStart()),
        toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.exteriorEnd()),
        toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.interiorEnd()),
        toVec2(data[0].floorplanner.view.floorplan.walls[0].backEdge.interiorStart())
    ];
    console.log("this is points = ", points)
    var fillerMaterial = new THREE.MeshBasicMaterial({
        color: 'yellow',
        side: THREE.BackSide,
        wireframe: true
    });
    const x = 0, y = 0;
    var shape = new THREE.Shape();
    shape.moveTo(25, 25);
    shape.bezierCurveTo(25, 25, 20, 0, 0, 0);

    var geometry = new THREE.ShapeGeometry(shape);
    var filler = new THREE.Mesh(geometry, fillerMaterial);
    filler.rotation.set(Math.PI / 2, 0, 0);
    filler.position.y = 5;
    house.add(filler)

    // Camera
    const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 10000)
    camera.position.x = 2
    camera.position.y = 5
    camera.position.z = 2
    scene.add(camera)

    // Controls
    const controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(window.innerWidth, window.innerHeight);

    const tick = () => {

        // Update controls
        controls.update()

        // Render
        renderer.render(scene, camera)

        // Call tick again on the next frame
        window.requestAnimationFrame(tick)
    }

    tick()

}

// create filler
// function buildFiller(edge, height, side, color) {
//     var points = [
//         toVec2(edge.exteriorStart()),
//         toVec2(edge.exteriorEnd()),
//         toVec2(edge.interiorEnd()),
//         toVec2(edge.interiorStart())
//     ];
//     var fillerMaterial = new THREE.MeshBasicMaterial({
//         color: 'yellow',
//         side: THREE.BackSide
//     });
//     var shape = new THREE.Shape(points);
//     var geometry = new THREE.ShapeGeometry(shape);
//     var filler = new THREE.Mesh(geometry, fillerMaterial);
//     filler.rotation.set(Math.PI / 2, 0, 0);
//     filler.position.y = height;
//     return filler;
// }


// start, end have x and y attributes (i.e. corners)
// function makeWall(start, end, transform, invTransform, material) {
//     var v1 = toVec3(start); new THREE.Vector3(209.85099999999989, height, pos.y);
//     var v2 = toVec3(end); new THREE.Vector3(pos.x, height, pos.y);
//     var v3 = v2.clone();
//     v3.y = wall.height;
//     var v4 = v1.clone();
//     v4.y = wall.height;
//     var points = [v1.clone(), v2.clone(), v3.clone(), v4.clone()];
//     points.forEach(function (p) {
//         p.applyMatrix4(transform);
//     });
//     var shape = new THREE.Shape([
//         new THREE.Vector2(points[0].x, points[0].y),
//         new THREE.Vector2(points[1].x, points[1].y),
//         new THREE.Vector2(points[2].x, points[2].y),
//         new THREE.Vector2(points[3].x, points[3].y)
//     ]);
//     // add holes for each wall item
//     wall.items.forEach(function (item) {
//         var pos = item.position.clone();
//         pos.applyMatrix4(transform);
//         var halfSize = item.halfSize;
//         var min = halfSize.clone().multiplyScalar(-1);
//         var max = halfSize.clone();
//         min.add(pos);
//         max.add(pos);
//         var holePoints = [
//             new THREE.Vector2(min.x, min.y),
//             new THREE.Vector2(max.x, min.y),
//             new THREE.Vector2(max.x, max.y),
//             new THREE.Vector2(min.x, max.y)
//         ];
//         shape.holes.push(new THREE.Path(holePoints));
//     });
//     var geometry = new THREE.ShapeGeometry(shape);

//     var mesh = new THREE.Mesh(geometry, material);
//     return mesh;
// }
