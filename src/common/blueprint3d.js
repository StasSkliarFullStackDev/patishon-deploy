import * as THREE from "three";
import {
  GLTFLoader
} from "three/examples/jsm/loaders/GLTFLoader";
import $ from "jquery";
import {
  LOCAL_SERVER,
  PUBLIC,
  TEXTURE,
  DEFAULT_FLOOR_MAP
} from "../constant";
import { updateConfigurationStates } from "../redux/actions/configuration"
import { isObjEmpty } from "../common/utils"
import { DataManager } from "../common/utils";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { setdollyInCount } from "../hoc/mainLayout"
import { Color } from "three";
import { Vector3 } from "three";
import { Vector2 } from "three";

let dispatch = null
let reducerBlueprint = null
let configuratorData = null
let wallThicknessForAllScreens = 10
const minWallLengthWeb = 124.34    // mm divided by perCmEqualToMm + border(10)
const maxWallLengthWeb = 1039      // mm divided by perCmEqualToMm + border(10)
const minWallLengthPhone = 114.528
const maxWallLengthPhone = 598
const partitionWallThickness3D = 2.5
const doorMinimumSpaceFromEgde = 11.453 // 100mm divided by perCmEqualToMm

export const updateDispatch = (localDispatch) => { dispatch = localDispatch }
export const updateReducerBlueprint = (data) => { reducerBlueprint = data }
export const updateReducerConfiguration = (data) => { configuratorData = data }

export var BP3D;

// BP3D variables 
(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Globals
  (function (Globals_1) {
    var Globals = (function () {
      /** Constructs a Globals.
       * @param floorplan The associated floorplan.
       * @param x X coordinate.
       * @param y Y coordinate.
       * @param id An optional unique id. If not set, created internally.
       */
      function Globals() {
        this.variables = {
          selectedType: '2D',
          selectedStep: 1,
          selectedMetalFrameType: "singleMetal",
          selectedPanels: null,
          selectedColorVariant: null,
          selectedHorizontalFrames: 1,
          selectedFilm: null,
          frameTypes: [],
          frameVariants: [],
          films: [],
          selectedDoorConfiguration: {},
          activePanelIndex: 0,
          activePanelColor: null,
          touches: [],
          doorStartVector: null,
          mouseVectorForDoorDrag: null,
          wasDoorClicked: false,
          numberOfPanels: 0,
          numberOfPanelsRight: 0,
          wallLengthPositionArr: null
        }
      }
      /** Add function to moved callbacks.
       * @param func The function to be added.
       */
      Globals.prototype.getGlobal = function (key) {
        return this.variables[key]
      };
      Globals.prototype.setGlobal = function (key, value) {
        if (key === "doorStartVector") {
          // console.log("set Global To =?", value)
        }
        this.variables[key] = value
        return this.variables[key]
      };

      Globals.prototype.getCurrentPrice = function () {
        let tempTotalPrice = 0
        const {
          partitionWallLength,
          panelPricePerMm,
          perPanelPrice,
          doorChannels,
          roomHeight,
        } = configuratorData
        const {
          numberOfPanels,
          perCmEqualToMm,
          numberOfPanelsRight,
        } = reducerBlueprint

        if (this.variables.selectedStep > 1) {
          let wallLengthPrice = (Math.floor(partitionWallLength * perCmEqualToMm) * panelPricePerMm)
          tempTotalPrice += wallLengthPrice
        }
        if (this.variables.selectedStep > 2 && !isObjEmpty(this.variables.selectedDoorConfiguration)) {
          let DoorSize = this.variables.selectedDoorConfiguration.selectedDoorSize

          // doorChannels[0]?.doorSize?.filter(e => {
          //   if(e.size == DoorSize){
          //     tempTotalPrice += e.price
          //   }
          // }) 

          // doorChannels[1]?.doorSize?.filter(e => {
          //   if(e.size == DoorSize){
          //     tempTotalPrice += e.price
          //   }
          // }) 
          
          if (DoorSize == 1488) {
            tempTotalPrice += (doorChannels[1]?.doorSize[0]?.price)
          } else {
            tempTotalPrice += (doorChannels[0]?.doorSize[DoorSize == 768 ? 0 : 1]?.price)
          }
        }
        if (this.variables.selectedStep > 3 && !isObjEmpty(this.variables.selectedDoorConfiguration)) {
          let doorHandle = this.variables.doorHandles
          if (!doorHandle[this.variables.selectedDoorConfiguration.selectedHandle]?.isDefault) {
            tempTotalPrice += (doorHandle[this.variables.selectedDoorConfiguration.selectedHandle]?.price)
          }
        }
        if (this.variables.selectedStep > 4) {
          tempTotalPrice += ((numberOfPanels + numberOfPanelsRight) * perPanelPrice)
        }
        if (this.variables.selectedStep > 5) {
          tempTotalPrice += Math.floor((this.variables.selectedMetalFrameType == "Framed single metal glazing" ? 190 : 156.2) * (BP3D.Core.Dimensioning.cmToMeasure(partitionWallLength) / 1000) * roomHeight / 1000)
        }
        if (this.variables.selectedStep > 6) {
          let selected = this.variables.films?.filter((item) => item.name == this.variables.selectedFilm)
          tempTotalPrice += selected[0]?.["price"] ?? ""
        }
        dispatch(updateConfigurationStates(tempTotalPrice, 'totalPrice'))
      }
      return Globals;
    })();
    Globals_1.Globals = Globals;
  })(Globals = BP3D.Globals || (BP3D.Globals = {}));

})(BP3D || (BP3D = {}));

(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Core;
  (function (Core) {
    /** Collection of utility functions. */
    var Utils = (function () {
      function Utils() { }
      /** Determines the distance of a point from a line.
       * @param x Point's x coordinate.
       * @param y Point's y coordinate.
       * @param x1 Line-Point 1's x coordinate.
       * @param y1 Line-Point 1's y coordinate.
       * @param x2 Line-Point 2's x coordinate.
       * @param y2 Line-Point 2's y coordinate.
       * @returns The distance.
       */
      Utils.pointDistanceFromLine = function (x, y, x1, y1, x2, y2) {
        var tPoint = Utils.closestPointOnLine(x, y, x1, y1, x2, y2);
        var tDx = x - tPoint.x;
        var tDy = y - tPoint.y;
        return Math.sqrt(tDx * tDx + tDy * tDy);
      };
      /** Gets the projection of a point onto a line.
       * @param x Point's x coordinate.
       * @param y Point's y coordinate.
       * @param x1 Line-Point 1's x coordinate.
       * @param y1 Line-Point 1's y coordinate.
       * @param x2 Line-Point 2's x coordinate.
       * @param y2 Line-Point 2's y coordinate.
       * @returns The point.
       */
      Utils.closestPointOnLine = function (x, y, x1, y1, x2, y2) {
        // Inspired by: http://stackoverflow.com/a/6853926
        var tA = x - x1;
        var tB = y - y1;
        var tC = x2 - x1;
        var tD = y2 - y1;
        var tDot = tA * tC + tB * tD;
        var tLenSq = tC * tC + tD * tD;
        var tParam = tDot / tLenSq;
        var tXx, tYy;
        if (tParam < 0 || (x1 === x2 && y1 === y2)) {
          tXx = x1;
          tYy = y1;
        } else if (tParam > 1) {
          tXx = x2;
          tYy = y2;
        } else {
          tXx = x1 + tParam * tC;
          tYy = y1 + tParam * tD;
        }
        return {
          x: tXx,
          y: tYy
        };
      };
      /** Gets the distance of two points.
       * @param x1 X part of first point.
       * @param y1 Y part of first point.
       * @param x2 X part of second point.
       * @param y2 Y part of second point.
       * @returns The distance.
       */
      Utils.distance = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) +
          Math.pow(y2 - y1, 2));
      };
      /**  Gets the angle between 0,0 -> x1,y1 and 0,0 -> x2,y2 (-pi to pi)
       * @returns The angle.
       */
      Utils.angle = function (x1, y1, x2, y2) {
        var tDot = x1 * x2 + y1 * y2;
        var tDet = x1 * y2 - y1 * x2;
        var tAngle = -Math.atan2(tDet, tDot);
        return tAngle;
      };
      /** shifts angle to be 0 to 2pi */
      Utils.angle2pi = function (x1, y1, x2, y2) {
        var tTheta = Utils.angle(x1, y1, x2, y2);
        if (tTheta < 0) {
          tTheta += 2 * Math.PI;
        }
        return tTheta;
      };
      /** Checks if an array of points is clockwise.
       * @param points Is array of points with x,y attributes
       * @returns True if clockwise.
       */
      Utils.isClockwise = function (points) {
        // make positive
        var tSubX = Math.min(0, Math.min.apply(null, Utils.map(points, function (p) {
          return p.x;
        })));
        var tSubY = Math.min(0, Math.min.apply(null, Utils.map(points, function (p) {
          return p.x;
        })));
        var tNewPoints = Utils.map(points, function (p) {
          return {
            x: p.x - tSubX,
            y: p.y - tSubY
          };
        });
        // determine CW/CCW, based on:
        // http://stackoverflow.com/questions/1165647
        var tSum = 0;
        for (var tI = 0; tI < tNewPoints.length; tI++) {
          var tC1 = tNewPoints[tI];
          var tC2;
          if (tI === tNewPoints.length - 1) {
            tC2 = tNewPoints[0];
          } else {
            tC2 = tNewPoints[tI + 1];
          }
          tSum += (tC2.x - tC1.x) * (tC2.y + tC1.y);
        }
        return (tSum >= 0);
      };
      /** Creates a Guid.
       * @returns A new Guid.
       */
      Utils.guid = function () {
        var tS4 = function () {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        };
        return tS4() + tS4() + '-' + tS4() + '-' + tS4() + '-' +
          tS4() + '-' + tS4() + tS4() + tS4();
      };
      /** both arguments are arrays of corners with x,y attributes */
      Utils.polygonPolygonIntersect = function (firstCorners, secondCorners) {
        for (var tI = 0; tI < firstCorners.length; tI++) {
          var tFirstCorner = firstCorners[tI],
            tSecondCorner;
          if (tI === firstCorners.length - 1) {
            tSecondCorner = firstCorners[0];
          } else {
            tSecondCorner = firstCorners[tI + 1];
          }
          if (Utils.linePolygonIntersect(tFirstCorner.x, tFirstCorner.y, tSecondCorner.x, tSecondCorner.y, secondCorners)) {
            return true;
          }
        }
        return false;
      };
      /** Corners is an array of points with x,y attributes */
      Utils.linePolygonIntersect = function (x1, y1, x2, y2, corners) {
        for (var tI = 0; tI < corners.length; tI++) {
          var tFirstCorner = corners[tI],
            tSecondCorner;
          if (tI === corners.length - 1) {
            tSecondCorner = corners[0];
          } else {
            tSecondCorner = corners[tI + 1];
          }
          if (Utils.lineLineIntersect(x1, y1, x2, y2, tFirstCorner.x, tFirstCorner.y, tSecondCorner.x, tSecondCorner.y)) {
            return true;
          }
        }
        return false;
      };
      /** */
      Utils.lineLineIntersect = function (x1, y1, x2, y2, x3, y3, x4, y4) {
        function tCCW(p1, p2, p3) {
          var tA = p1.x,
            tB = p1.y,
            tC = p2.x,
            tD = p2.y,
            tE = p3.x,
            tF = p3.y;
          return (tF - tB) * (tC - tA) > (tD - tB) * (tE - tA);
        }
        var tP1 = {
          x: x1,
          y: y1
        },
          tP2 = {
            x: x2,
            y: y2
          },
          tP3 = {
            x: x3,
            y: y3
          },
          tP4 = {
            x: x4,
            y: y4
          };
        return (tCCW(tP1, tP3, tP4) !== tCCW(tP2, tP3, tP4)) && (tCCW(tP1, tP2, tP3) !== tCCW(tP1, tP2, tP4));
      };
      /**
       @param corners Is an array of points with x,y attributes
        @param startX X start coord for raycast
        @param startY Y start coord for raycast
      */
      Utils.pointInPolygon = function (x, y, corners, startX, startY) {
        startX = startX || 0;
        startY = startY || 0;
        //ensure that point(startX, startY) is outside the polygon consists of corners
        var tMinX = 0,
          tMinY = 0;
        // if (startX === undefined || startY === undefined) {
        for (let tI = 0; tI < corners.length; tI++) {
          tMinX = Math.min(tMinX, corners[tI].x);
          tMinY = Math.min(tMinX, corners[tI].y);
        }
        startX = tMinX - 10;
        startY = tMinY - 10;
        // }
        var tIntersects = 0;
        for (let tI = 0; tI < corners.length; tI++) {
          var tFirstCorner = corners[tI],
            tSecondCorner;
          if (tI === corners.length - 1) {
            tSecondCorner = corners[0];
          } else {
            tSecondCorner = corners[tI + 1];
          }
          if (Utils.lineLineIntersect(startX, startY, x, y, tFirstCorner.x, tFirstCorner.y, tSecondCorner.x, tSecondCorner.y)) {
            tIntersects++;
          }
        }
        // odd intersections means the point is in the polygon
        return ((tIntersects % 2) === 1);
      };
      /** Checks if all corners of insideCorners are inside the polygon described by outsideCorners */
      Utils.polygonInsidePolygon = function (insideCorners, outsideCorners, startX, startY) {
        startX = startX || 0;
        startY = startY || 0;
        for (var tI = 0; tI < insideCorners.length; tI++) {
          if (!Utils.pointInPolygon(insideCorners[tI].x, insideCorners[tI].y, outsideCorners, startX, startY)) {
            return false;
          }
        }
        return true;
      };
      /** Checks if any corners of firstCorners is inside the polygon described by secondCorners */
      Utils.polygonOutsidePolygon = function (insideCorners, outsideCorners, startX, startY) {
        startX = startX || 0;
        startY = startY || 0;
        for (var tI = 0; tI < insideCorners.length; tI++) {
          if (Utils.pointInPolygon(insideCorners[tI].x, insideCorners[tI].y, outsideCorners, startX, startY)) {
            return false;
          }
        }
        return true;
      };
      // arrays
      Utils.forEach = function (array, action) {
        for (var tI = 0; tI < array.length; tI++) {
          action(array[tI]);
        }
      };
      Utils.forEachIndexed = function (array, action) {
        for (var tI = 0; tI < array.length; tI++) {
          action(tI, array[tI]);
        }
      };
      Utils.map = function (array, func) {
        var tResult = [];
        array.forEach(function (element) {
          tResult.push(func(element));
        });
        return tResult;
      };
      /** Remove elements in array if func(element) returns true */
      Utils.removeIf = function (array, func) {
        var tResult = [];
        array.forEach(function (element) {
          if (!func(element)) {
            tResult.push(element);
          }
        });
        return tResult;
      };
      /** Shift the items in an array by shift (positive integer) */
      Utils.cycle = function (arr, shift) {
        var tReturn = arr.slice(0);
        for (var tI = 0; tI < shift; tI++) {
          var tmp = tReturn.shift();
          tReturn.push(tmp);
        }
        return tReturn;
      };
      /** Returns in the unique elemnts in arr */
      Utils.unique = function (arr, hashFunc) {
        var tResults = [];
        var tMap = {};
        for (var tI = 0; tI < arr.length; tI++) {
          if (!tMap.hasOwnProperty(arr[tI])) {
            tResults.push(arr[tI]);
            tMap[hashFunc(arr[tI])] = true;
          }
        }
        return tResults;
      };
      /** Remove value from array, if it is present */
      Utils.removeValue = function (array, value) {
        for (var tI = array.length - 1; tI >= 0; tI--) {
          if (array[tI] === value) {
            array.splice(tI, 1);
          }
        }
      };
      /** Subtracts the elements in subArray from array */
      Utils.subtract = function (array, subArray) {
        return Utils.removeIf(array, function (el) {
          return Utils.hasValue(subArray, el);
        });
      };
      /** Checks if value is in array */
      Utils.hasValue = function (array, value) {
        for (var tI = 0; tI < array.length; tI++) {
          if (array[tI] === value) {
            return true;
          }
        }
        return false;
      };
      return Utils;
    })();
    Core.Utils = Utils;
  })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Core;
  (function (Core) {
    /** Dimensioning in Inch. */
    Core.dimInch = "inch";
    /** Dimensioning in Meter. */
    Core.dimMeter = "m";
    /** Dimensioning in Centi Meter. */
    Core.dimCentiMeter = "cm";
    /** Dimensioning in Milli Meter. */
    Core.dimMilliMeter = "mm";
    /** Dimensioning functions. */
    var Dimensioning = (function () {
      function Dimensioning() { }
      /** Converts cm to dimensioning string.
       * @param cm Centi meter value to be converted.
       * @returns String representation.
       */
      Dimensioning.cmToMeasure = function (cm) {

        switch (Core.Configuration.getStringValue(Core.configDimUnit)) {
          // case Core.dimInch:
          //     var realFeet = ((cm * 0.393700) / 12);
          //     var feet = Math.floor(realFeet);
          //     var inches = Math.round((realFeet - feet) * 12);
          //     // let ds = feet + "'" + inches + '"';
          //     // console.log("this is units - ", cm, realFeet, feet)
          //     // return feet + "'" + inches + '"';
          //     return `${Math.floor(cm) * 10}`

          case Core.dimInch:
            // // console.log("this is reducer data = ", reducerBlueprint.configuration2D)
            let res = (cm * reducerBlueprint.perCmEqualToMm)
            // if (+res.toString().split('.')[1] >= 99) {
            //   return `${Math.ceil(res)}`
            // }
            // console.log("this is res = ", res)
            return `${Math.floor(res)}`

          case Core.dimMilliMeter:
            return "" + Math.round(10 * cm) + " mm";
          case Core.dimCentiMeter:
            return "" + Math.round(10 * cm) / 10 + " cm";
          case Core.dimMeter:
          default:
            return "" + Math.round(10 * cm) / 1000 + " m";
        }
      };
      return Dimensioning;
    })();
    Core.Dimensioning = Dimensioning;
  })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Core;
  (function (Core) {
    // GENERAL:
    /** The dimensioning unit for 2D floorplan measurements. */
    Core.configDimUnit = "dimUnit";
    // WALL:
    /** The initial wall height in cm. */
    Core.configWallHeight = "wallHeight";
    /** The initial wall thickness in cm. */
    Core.configWallThickness = "wallThickness";
    /** Global configuration to customize the whole system.  */
    var Configuration = (function () {
      function Configuration() { }
      /** Set a configuration parameter. */
      Configuration.setValue = function (key, value) {
        this.data[key] = value;
      };
      /** Get a string configuration parameter. */
      Configuration.getStringValue = function (key) {
        switch (key) {
          case Core.configDimUnit:
            return this.data[key];
          default:
            throw new Error("Invalid string configuration parameter: " + key);
        }
      };
      /** Get a numeric configuration parameter. */
      Configuration.getNumericValue = function (key) {
        switch (key) {
          case Core.configWallHeight:
          case Core.configWallThickness:
            return this.data[key];
          default:
            throw new Error("Invalid numeric configuration parameter: " + key);
        }
      };
      /** Configuration data loaded from/stored to extern. */
      Configuration.data = {
        dimUnit: Core.dimInch,
        wallHeight: 200,
        wallThickness: wallThicknessForAllScreens
      };
      return Configuration;
    })();
    Core.Configuration = Configuration;
  })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));


// var __extends = (this && this.__extends) || function (d, b) {
//     for (var p in b)
//         if (b.hasOwnProperty(p)) d[p] = b[p];

//     function __() {
//         this.constructor = d;
//     }
//     d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
// };

var __extends = (this && this.__extends) || (function () {
  var extendStatics = function (d, b) {
    extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return extendStatics(d, b);
  };
  return function (d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
})();




(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /**
     * An Item is an abstract entity for all things placed in the scene,
     * e.g. at walls or on the floor.
     */
    var Item = (function (_super) {
      // __extends(Item, _super);
      /** Constructs an item.
       * @param model TODO
       * @param metadata TODO
       * @param geometry TODO
       * @param material TODO
       * @param position TODO
       * @param rotation TODO
       * @param scale TODO
       */
      class Item extends THREE.Mesh {
        constructor(model, metadata, geometry, material, position, rotation, scale) {
          super(model, metadata, geometry, material, position, rotation, scale)
          // _super.call(this);
          this.model = model;
          this.metadata = metadata;
          /** */
          this.errorGlow = new THREE.Mesh();
          /** */
          this.hover = false;
          /** */
          this.selected = false;
          /** */
          this.highlighted = false;
          /** */
          this.error = false;
          /** */
          this.emissiveColor = 0x444444;
          /** */
          this.errorColor = 0xff0000;
          /** Does this object affect other floor items */
          this.obstructFloorMoves = true;
          /** Does this object affect other in wall items */
          this.obstructInWallMoves = false;
          /** Does this object affect other on floor items */
          this.obstructOnFloorMoves = false;
          /** Does this object affect other on ceiling items */
          this.obstructCeilingMoves = false;
          /** Show rotate option in context menu */
          this.allowRotate = true;
          /** */
          this.fixed = false;
          /** dragging */
          this.dragOffset = new THREE.Vector3();
          /** */
          this.getHeight = function () {
            return this.halfSize.y * 2.0;
          };
          /** */
          this.getWidth = function () {
            return this.halfSize.x * 2.0;
          };
          /** */
          this.getDepth = function () {
            return this.halfSize.z * 2.0;
          };
          /** */
          this.getElevation = function () {
            return this.position.y - this.halfSize.y;
          };
          /** */
          this.initObject = function (position) {
            this.placeInRoom(position);
            // select and stuff
            this.scene.needsUpdate = true;
          };
          this.scene = this.model.scene;
          this.geometry = geometry;
          this.material = material;
          this.errorColor = 0xff0000;
          this.resizable = metadata.resizable;
          this.castShadow = true;
          this.receiveShadow = true;
          this.geometry = geometry;
          this.material = material;
          if (position) {
            // console.log("this is poistion =>", position);
            this.position.copy(position);
            this.position_set = true;
          } else {
            this.position_set = false;
          }
          // center in its boundingbox
          this.geometry.computeBoundingBox();
          this.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(-0.5 * (this.geometry.boundingBox.max.x + this.geometry.boundingBox.min.x), -0.5 * (this.geometry.boundingBox.max.y + this.geometry.boundingBox.min.y), -0.5 * (this.geometry.boundingBox.max.z + this.geometry.boundingBox.min.z)));
          this.geometry.computeBoundingBox();
          this.halfSize = this.objectHalfSize();
          if (rotation) {
            this.rotation.y = rotation;
          }
          if (scale != null) {
            this.setScale(scale.x, scale.y, scale.z);
          }
        }
        /** */
        remove() {
          this.scene.removeItem(this);
        }
        /** */
        isElevationAdjustable() {
          return false;
        }
        /** */
        elevate(elevation) {
          if (elevation > 0 && elevation < BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallHeight) - 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y)) {
            this.position.y = this.halfSize.y + elevation;
          }
        }
        /** */
        resize(height, width, depth) {
          if (height > 0 && width > 0 && depth > 0) {
            var x = width / this.getWidth();
            var y = height / this.getHeight();
            var z = depth / this.getDepth();
            this.setScale(x, y, z);
          }
        }
        /** */
        setScale(x, y, z) {
          var scaleVec = new THREE.Vector3(x, y, z);
          this.halfSize.multiply(scaleVec);
          scaleVec.multiply(this.scale);
          this.scale.set(scaleVec.x, scaleVec.y, scaleVec.z);
          this.resized();
          this.scene.needsUpdate = true;
        }
        /** */
        setFixed(fixed) {
          this.fixed = fixed;
        }
        /** */
        removed() { }
        /** on is a bool */
        updateHighlight() {
          var on = this.hover || this.selected;
          this.highlighted = on;
          // eslint-disable-next-line no-unused-vars
          var hex = on ? this.emissiveColor : 0x000000;
          // eslint-disable-next-line no-unused-vars
          var materials = this.material.materials;
          // if (materials) {
          //   (<THREE.MeshFaceMaterial>this.material).materials.forEach((material) => {
          //     // TODO_Ekki emissive doesn't exist anymore?
          //     if (material) {
          //       if (material.emissive) {
          //         (<any>material).emissive.setHex(hex);
          //       }
          //     }
          //   });
          // }
        }
        /** */
        mouseOver() {
          this.hover = true;
          this.updateHighlight();
        }
        /** */
        mouseOff() {
          this.hover = false;
          this.updateHighlight();
        }
        /** */
        setSelected() {
          this.selected = true;
          this.updateHighlight();
        }
        /** */
        setUnselected() {
          this.selected = false;
          this.updateHighlight();
        }
        /** intersection has attributes point (vec3) and object (THREE.Mesh) */
        clickPressed(intersection) {
          this.dragOffset.copy(intersection.point).sub(this.position);
        }
        /** */
        clickDragged(intersection) {
          if (intersection) {
            this.moveToPosition(intersection.point.sub(this.dragOffset), intersection);
          }
        }
        /** */
        rotate(intersection) {
          if (intersection) {
            var angle = BP3D.Core.Utils.angle(0, 1, intersection.point.x - this.position.x, intersection.point.z - this.position.z);
            var snapTolerance = Math.PI / 16.0;
            // snap to intervals near Math.PI/2
            for (var i = -4; i <= 4; i++) {
              if (Math.abs(angle - (i * (Math.PI / 2))) < snapTolerance) {
                angle = i * (Math.PI / 2);
                break;
              }
            }
            this.rotation.y = angle;
          }
        }
        /** */
        moveToPosition(vec3, intersection) {
          this.position.copy(vec3);
        }
        /** */
        clickReleased() {
          if (this.error) {
            this.hideError();
          }
        }
        /**
                     * Returns an array of planes to use other than the ground plane
                     * for passing intersection to clickPressed and clickDragged
                     */
        customIntersectionPlanes() {
          return [];
        }
        /**
                     * returns the 2d corners of the bounding polygon
                     *
                     * offset is Vector3 (used for getting corners of object at a new position)
                     *
                     * TODO: handle rotated objects better!
                     */
        getCorners(xDim, yDim, position) {
          position = position || this.position;
          var halfSize = this.halfSize.clone();
          var c1 = new THREE.Vector3(-halfSize.x, 0, -halfSize.z);
          var c2 = new THREE.Vector3(halfSize.x, 0, -halfSize.z);
          var c3 = new THREE.Vector3(halfSize.x, 0, halfSize.z);
          var c4 = new THREE.Vector3(-halfSize.x, 0, halfSize.z);
          var transform = new THREE.Matrix4();
          //// console.log(this.rotation.y);
          transform.makeRotationY(this.rotation.y); //  + Math.PI/2)
          c1.applyMatrix4(transform);
          c2.applyMatrix4(transform);
          c3.applyMatrix4(transform);
          c4.applyMatrix4(transform);
          c1.add(position);
          c2.add(position);
          c3.add(position);
          c4.add(position);
          //halfSize.applyMatrix4(transform);
          //var min = position.clone().sub(halfSize);
          //var max = position.clone().add(halfSize);
          var corners = [{
            x: c1.x,
            y: c1.z
          },
          {
            x: c2.x,
            y: c2.z
          },
          {
            x: c3.x,
            y: c3.z
          },
          {
            x: c4.x,
            y: c4.z
          }
          ];
          return corners;
        }
        /**
                     * returns the 2d corners of the bounding polygon
                     *
                     * offset is Vector3 (used for getting corners of object at a new position)
                     *
                     * TODO: handle rotated objects better!
                     */
        getCornersXZ(xDim, yDim, position) {
          position = position || this.position;
          var halfSize = this.halfSize.clone();
          let wallTol = 15;
          var c1 = new THREE.Vector3(-(halfSize.x + wallTol), 0, -(halfSize.z + wallTol));
          var c2 = new THREE.Vector3(halfSize.x + wallTol, 0, -(halfSize.z + wallTol));
          var c3 = new THREE.Vector3(halfSize.x + wallTol, 0, halfSize.z + wallTol);
          var c4 = new THREE.Vector3(-(halfSize.x + wallTol), 0, halfSize.z + wallTol);
          var transform = new THREE.Matrix4();
          //// console.log(this.rotation.y);
          transform.makeRotationY(this.rotation.y); //  + Math.PI/2)
          c1.applyMatrix4(transform);
          c2.applyMatrix4(transform);
          c3.applyMatrix4(transform);
          c4.applyMatrix4(transform);
          c1.add(position);
          c2.add(position);
          c3.add(position);
          c4.add(position);
          //halfSize.applyMatrix4(transform);
          //var min = position.clone().sub(halfSize);
          //var max = position.clone().add(halfSize);
          var corners = [{
            x: c1.x,
            y: c1.z
          },
          {
            x: c2.x,
            y: c2.z
          },
          {
            x: c3.x,
            y: c3.z
          },
          {
            x: c4.x,
            y: c4.z
          }
          ];
          return corners;
        }
        /**
                     * returns the 2d corners of the bounding polygon
                     *
                     * offset is Vector3 (used for getting corners of object at a new position)
                     *
                     * TODO: handle rotated objects better!
                     */
        getCornersXZBIG(xDim, yDim, position) {
          position = position || this.position;
          var halfSize = this.halfSize.clone();
          let maxSize = Math.max(halfSize.x, halfSize.z);
          let wallTol = 15;
          var c1 = new THREE.Vector3(-(maxSize + wallTol), 0, -(maxSize + wallTol));
          var c2 = new THREE.Vector3((maxSize + wallTol), 0, -(maxSize + wallTol));
          var c3 = new THREE.Vector3((maxSize + wallTol), 0, (maxSize + wallTol));
          var c4 = new THREE.Vector3(-(maxSize + wallTol), 0, (maxSize + wallTol));
          var transform = new THREE.Matrix4();
          //// console.log(this.rotation.y);
          transform.makeRotationY(this.rotation.y); //  + Math.PI/2)
          c1.applyMatrix4(transform);
          c2.applyMatrix4(transform);
          c3.applyMatrix4(transform);
          c4.applyMatrix4(transform);
          c1.add(position);
          c2.add(position);
          c3.add(position);
          c4.add(position);
          //halfSize.applyMatrix4(transform);
          //var min = position.clone().sub(halfSize);
          //var max = position.clone().add(halfSize);
          var corners = [{
            x: c1.x,
            y: c1.z
          },
          {
            x: c2.x,
            y: c2.z
          },
          {
            x: c3.x,
            y: c3.z
          },
          {
            x: c4.x,
            y: c4.z
          }
          ];
          return corners;
        }
        /**
                     * returns the 2d corners of the bounding polygon
                     *
                     * offset is Vector3 (used for getting corners of object at a new position)
                     *
                     * TODO: handle rotated objects better!
                     */
        getCornersXY(xDim, yDim, position) {
          position = position || this.position;
          var halfSize = this.halfSize.clone();
          var c1 = new THREE.Vector3(-halfSize.x, -halfSize.y, 0);
          var c2 = new THREE.Vector3(halfSize.x, -halfSize.y, 0);
          var c3 = new THREE.Vector3(halfSize.x, halfSize.y, 0);
          var c4 = new THREE.Vector3(-halfSize.x, halfSize.y, 0);
          var transform = new THREE.Matrix4();
          //// console.log(this.rotation.y);
          transform.makeRotationY(this.rotation.z); //  + Math.PI/2)
          c1.applyMatrix4(transform);
          c2.applyMatrix4(transform);
          c3.applyMatrix4(transform);
          c4.applyMatrix4(transform);
          c1.add(position);
          c2.add(position);
          c3.add(position);
          c4.add(position);
          //halfSize.applyMatrix4(transform);
          //var min = position.clone().sub(halfSize);
          //var max = position.clone().add(halfSize);
          var corners = [{
            x: c1.x,
            y: c1.y
          },
          {
            x: c2.x,
            y: c2.y
          },
          {
            x: c3.x,
            y: c3.y
          },
          {
            x: c4.x,
            y: c4.y
          }
          ];
          return corners;
        }
        /**
                     * returns the 2d corners of the bounding polygon
                     *
                     * offset is Vector3 (used for getting corners of object at a new position)
                     *
                     * TODO: handle rotated objects better!
                     */
        getCornersYZ(xDim, yDim, position) {
          position = position || this.position;
          var halfSize = this.halfSize.clone();
          var c1 = new THREE.Vector3(0, -halfSize.y, -halfSize.z);
          var c2 = new THREE.Vector3(0, halfSize.y, -halfSize.z);
          var c3 = new THREE.Vector3(0, halfSize.y, halfSize.z);
          var c4 = new THREE.Vector3(0, -halfSize.y, halfSize.z);
          var transform = new THREE.Matrix4();
          //// console.log(this.rotation.y);
          transform.makeRotationY(this.rotation.x); //  + Math.PI/2)
          c1.applyMatrix4(transform);
          c2.applyMatrix4(transform);
          c3.applyMatrix4(transform);
          c4.applyMatrix4(transform);
          c1.add(position);
          c2.add(position);
          c3.add(position);
          c4.add(position);
          //halfSize.applyMatrix4(transform);
          //var min = position.clone().sub(halfSize);
          //var max = position.clone().add(halfSize);
          var corners = [{
            x: c1.y,
            y: c1.z
          },
          {
            x: c2.y,
            y: c2.z
          },
          {
            x: c3.y,
            y: c3.z
          },
          {
            x: c4.y,
            y: c4.z
          }
          ];
          return corners;
        }
        /** */
        showError(vec3) {
          vec3 = vec3 || this.position;
          if (!this.error) {
            this.error = true;
            this.errorGlow = this.createGlow(this.errorColor, 0.8, true);
            this.scene.add(this.errorGlow);
          }
          this.errorGlow.position.copy(vec3);
        }
        /** */
        hideError() {
          if (this.error) {
            this.error = false;
            this.scene.remove(this.errorGlow);
          }
        }
        /** */
        objectHalfSize() {
          var objectBox = new THREE.Box3();
          // console.log("this is the item =>", this);
          objectBox.setFromObject(this);
          return objectBox.max.clone().sub(objectBox.min).divideScalar(2);
        }
        /** */
        createGlow(color, opacity, ignoreDepth) {
          ignoreDepth = ignoreDepth || false;
          opacity = opacity || 0.2;
          var glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            blending: THREE.AdditiveBlending,
            opacity: 0.2,
            transparent: true,
            depthTest: !ignoreDepth
          });
          var glow = new THREE.Mesh(this.geometry.clone(), glowMaterial);
          glow.position.copy(this.position);
          glow.rotation.copy(this.rotation);
          glow.scale.copy(this.scale);
          return glow;
        }
      }
      return Item;
    })(THREE.Mesh);

    Items.Item = Item;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Model;
  (function (Model) {
    /** */
    var cornerTolerance = 20;
    /**
     * Corners are used to define Walls.
     */
    var Corner = (function () {
      /** Constructs a corner.
       * @param floorplan The associated floorplan.
       * @param x X coordinate.
       * @param y Y coordinate.
       * @param id An optional unique id. If not set, created internally.
       */
      function Corner(floorplan, x, y, id) {
        this.floorplan = floorplan;
        this.x = x;
        this.y = y;
        this.id = id;
        /** Array of start walls. */
        this.wallStarts = [];
        /** Array of end walls. */
        this.wallEnds = [];
        /** Callbacks to be fired on movement. */
        this.moved_callbacks = $.Callbacks();
        /** Callbacks to be fired on removal. */
        this.deleted_callbacks = $.Callbacks();
        /** Callbacks to be fired in case of action. */
        this.action_callbacks = $.Callbacks();
        this.id = id || BP3D.Core.Utils.guid();
      }
      /** Add function to moved callbacks.
       * @param func The function to be added.
       */
      Corner.prototype.fireOnMove = function (func) {
        this.moved_callbacks.add(func);
      };
      /** Add function to deleted callbacks.
       * @param func The function to be added.
       */
      Corner.prototype.fireOnDelete = function (func) {
        this.deleted_callbacks.add(func);
      };
      /** Add function to action callbacks.
       * @param func The function to be added.
       */
      Corner.prototype.fireOnAction = function (func) {
        this.action_callbacks.add(func);
      };
      /**
       * @returns
       * @deprecated
       */
      Corner.prototype.getX = function () {
        return this.x;
      };
      /**
       * @returns
       * @deprecated
       */
      Corner.prototype.getY = function () {
        return this.y;
      };
      /**
       *
       */
      Corner.prototype.snapToAxis = function (tolerance) {
        // try to snap this corner to an axis
        var snapped = {
          x: false,
          y: false
        };
        var scope = this;
        this.adjacentCorners().forEach(function (corner) {
          if (Math.abs(corner.x - scope.x) < tolerance) {
            scope.x = corner.x;
            snapped.x = true;
          }
          if (Math.abs(corner.y - scope.y) < tolerance) {
            scope.y = corner.y;
            snapped.y = true;
          }
        });
        return snapped;
      };
      /** Moves corner relatively to new position.
       * @param dx The delta x.
       * @param dy The delta y.
       */
      Corner.prototype.relativeMove = function (dx, dy) {
        // console.log("this is relative move relative")
        this.move(this.x + dx, this.y + dy);
      };
      Corner.prototype.fireAction = function (action) {
        this.action_callbacks.fire(action);
      };
      /** Remove callback. Fires the delete callbacks. */
      Corner.prototype.remove = function () {
        this.deleted_callbacks.fire(this);
      };
      /** Removes all walls. */
      Corner.prototype.removeAll = function () {
        for (let i = 0; i < this.wallStarts.length; i++) {
          this.wallStarts[i].remove();
        }
        for (let i = 0; i < this.wallEnds.length; i++) {
          this.wallEnds[i].remove();
        }
        this.remove();
      };
      /** Moves corner to new position.
       * @param newX The new x position.
       * @param newY The new y position.
       */
      Corner.prototype.move = function (newX, newY) {
        this.x = newX;
        this.y = newY;
        // this.mergeWithIntersected();
        this.moved_callbacks.fire(this.x, this.y);
        this.wallStarts.forEach(function (wall) {
          wall.fireMoved();
        });
        this.wallEnds.forEach(function (wall) {
          wall.fireMoved();
        });
      };
      /** Gets the adjacent corners.
       * @returns Array of corners.
       */
      Corner.prototype.adjacentCorners = function () {
        var retArray = [];
        for (let i = 0; i < this.wallStarts.length; i++) {
          retArray.push(this.wallStarts[i].getEnd());
        }
        for (let i = 0; i < this.wallEnds.length; i++) {
          retArray.push(this.wallEnds[i].getStart());
        }
        return retArray;
      };
      /** Checks if a wall is connected.
       * @param wall A wall.
       * @returns True in case of connection.
       */
      Corner.prototype.isWallConnected = function (wall) {
        for (let i = 0; i < this.wallStarts.length; i++) {
          if (this.wallStarts[i] === wall) {
            return true;
          }
        }
        for (let i = 0; i < this.wallEnds.length; i++) {
          if (this.wallEnds[i] === wall) {
            return true;
          }
        }
        return false;
      };
      /**
       *
       */
      Corner.prototype.distanceFrom = function (x, y) {
        var distance = BP3D.Core.Utils.distance(x, y, this.x, this.y);
        //// console.log('x,y ' + x + ',' + y + ' to ' + this.getX() + ',' + this.getY() + ' is ' + distance);
        return distance;
      };
      /** Gets the distance from a wall.
       * @param wall A wall.
       * @returns The distance.
       */
      Corner.prototype.distanceFromWall = function (wall) {
        return wall.distanceFrom(this.x, this.y);
      };
      /** Gets the distance from a corner.
       * @param corner A corner.
       * @returns The distance.
       */
      Corner.prototype.distanceFromCorner = function (corner) {
        return this.distanceFrom(corner.x, corner.y);
      };
      /** Detaches a wall.
       * @param wall A wall.
       */
      Corner.prototype.detachWall = function (wall) {
        BP3D.Core.Utils.removeValue(this.wallStarts, wall);
        BP3D.Core.Utils.removeValue(this.wallEnds, wall);
        if (this.wallStarts.length === 0 && this.wallEnds.length === 0) {
          this.remove();
        }
      };
      /** Attaches a start wall.
       * @param wall A wall.
       */
      Corner.prototype.attachStart = function (wall) {
        this.wallStarts.push(wall);
      };
      /** Attaches an end wall.
       * @param wall A wall.
       */
      Corner.prototype.attachEnd = function (wall) {
        this.wallEnds.push(wall);
      };
      /** Get wall to corner.
       * @param corner A corner.
       * @return The associated wall or null.
       */
      Corner.prototype.wallTo = function (corner) {
        for (var i = 0; i < this.wallStarts.length; i++) {
          if (this.wallStarts[i].getEnd() === corner) {
            return this.wallStarts[i];
          }
        }
        return null;
      };
      /** Get wall from corner.
       * @param corner A corner.
       * @return The associated wall or null.
       */
      Corner.prototype.wallFrom = function (corner) {
        for (var i = 0; i < this.wallEnds.length; i++) {
          if (this.wallEnds[i].getStart() === corner) {
            return this.wallEnds[i];
          }
        }
        return null;
      };
      /** Get wall to or from corner.
       * @param corner A corner.
       * @return The associated wall or null.
       */
      Corner.prototype.wallToOrFrom = function (corner) {
        return this.wallTo(corner) || this.wallFrom(corner);
      };
      /**
       *
       */
      Corner.prototype.combineWithCorner = function (corner) {
        // update position to other corner's
        this.x = corner.x;
        this.y = corner.y;
        // absorb the other corner's wallStarts and wallEnds
        for (let i = corner.wallStarts.length - 1; i >= 0; i--) {
          corner.wallStarts[i].setStart(this);
        }
        for (let i = corner.wallEnds.length - 1; i >= 0; i--) {
          corner.wallEnds[i].setEnd(this);
        }
        // delete the other corner
        corner.removeAll();
        this.removeDuplicateWalls();
        this.floorplan.update();
      };
      Corner.prototype.mergeWithIntersected = function () {
        //// console.log('mergeWithIntersected for object: ' + this.type);
        // check corners
        for (var i = 0; i < this.floorplan.getCorners().length; i++) {
          var corner = this.floorplan.getCorners()[i];
          if (this.distanceFromCorner(corner) < cornerTolerance && corner !== this) {
            this.combineWithCorner(corner);
            return true;
          }
        }
        // check walls
        for (let i = 0; i < this.floorplan.getWalls().length; i++) {
          var wall = this.floorplan.getWalls()[i];
          if (this.distanceFromWall(wall) < cornerTolerance && !this.isWallConnected(wall)) {
            // update position to be on wall
            var intersection = BP3D.Core.Utils.closestPointOnLine(this.x, this.y, wall.getStart().x, wall.getStart().y, wall.getEnd().x, wall.getEnd().y);
            this.x = intersection.x;
            this.y = intersection.y;
            // merge this corner into wall by breaking wall into two parts
            this.floorplan.newWall(this, wall.getEnd());
            wall.setEnd(this);
            this.floorplan.update();
            return true;
          }
        }
        return false;
      };
      /** Ensure we do not have duplicate walls (i.e. same start and end points) */
      Corner.prototype.removeDuplicateWalls = function () {
        // delete the wall between these corners, if it exists
        var wallEndpoints = {};
        var wallStartpoints = {};
        for (let i = this.wallStarts.length - 1; i >= 0; i--) {
          if (this.wallStarts[i].getEnd() === this) {
            // remove zero length wall 
            this.wallStarts[i].remove();
          } else if (this.wallStarts[i].getEnd().id in wallEndpoints) {
            // remove duplicated wall
            this.wallStarts[i].remove();
          } else {
            wallEndpoints[this.wallStarts[i].getEnd().id] = true;
          }
        }
        for (let i = this.wallEnds.length - 1; i >= 0; i--) {
          if (this.wallEnds[i].getStart() === this) {
            // removed zero length wall 
            this.wallEnds[i].remove();
          } else if (this.wallEnds[i].getStart().id in wallStartpoints) {
            // removed duplicated wall
            this.wallEnds[i].remove();
          } else {
            wallStartpoints[this.wallEnds[i].getStart().id] = true;
          }
        }
      };
      return Corner;
    })();
    Model.Corner = Corner;
  })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Model;
  (function (Model) {
    /**
     * Half Edges are created by Room.
     *
     * Once rooms have been identified, Half Edges are created for each interior wall.
     *
     * A wall can have two half edges if it is visible from both sides.
     */
    var HalfEdge = (function () {
      /**
       * Constructs a half edge.
       * @param room The associated room.
       * @param wall The corresponding wall.
       * @param front True if front side.
       */
      function HalfEdge(room, wall, front) {
        this.room = room;
        this.wall = wall;
        this.front = front;
        /** used for intersection testing... not convinced this belongs here */
        this.plane = null;

        this.box = null;
        /** transform from world coords to wall planes (z=0) */
        this.interiorTransform = new THREE.Matrix4();
        /** transform from world coords to wall planes (z=0) */
        this.invInteriorTransform = new THREE.Matrix4();
        /** transform from world coords to wall planes (z=0) */
        this.exteriorTransform = new THREE.Matrix4();
        /** transform from world coords to wall planes (z=0) */
        this.invExteriorTransform = new THREE.Matrix4();
        /** */
        this.redrawCallbacks = $.Callbacks();

        this.edgeSelectedCallbacks = $.Callbacks();
        this.edgeUnSelectedCallbacks = $.Callbacks();
        /**
         * this feels hacky, but need wall items
         */
        this.generatePlane = function () {
          function transformCorner(corner) {
            return new THREE.Vector3(corner.x, 0, corner.y);
          }
          var v1 = transformCorner(this.interiorStart());
          var v2 = transformCorner(this.interiorEnd());

          var v3 = v2.clone();
          v3.y = this.wall.height
          var v4 = v1.clone();
          v4.y = this.wall.height
          var geometry = new THREE.BufferGeometry();
          const positionsArray = new Float32Array(2 * 3 * 3)
          const positionsArrayValues = [
            v1?.x, 0, v1?.y,
            v2?.x, 0, v2?.y,
            v2?.x, this.wall.height, v2?.y,
            v1?.x, this.wall.height, v1?.y,
            v2?.x, this.wall.height, v2?.y,
            v1?.x, 0, v1?.y
          ]
          for (let i = 0; i < 2 * 3 * 3; i++) {
            positionsArray[i] = positionsArrayValues[i]
          }
          const positionsAttributes = new THREE.BufferAttribute(positionsArray, 3)
          geometry.setAttribute('position', positionsAttributes)

          // geometry.vertices = [v1, v2, v3, v4];

          // geometry.faces.push(new THREE.Vector3(0, 1, 2));
          // geometry.faces.push(new THREE.Vector3(0, 2, 3));
          // geometry.computeFaceNormals();
          // geometry.computeBoundingBox();
          let fillerMaterial = new THREE.MeshBasicMaterial({
            color: 0x111b, //0xdddddd,
            side: THREE.DoubleSide,
            transparent: false,
            reflectivity: 1000,
            opacity: 1,

          });
          let mesh = new THREE.Mesh(geometry, fillerMaterial);
          mesh.position.z = Math.floor(Math.random() * (1000 - 10 + 1) + 1000);

          mesh.name = reducerBlueprint?.BP3DData.model.floorplan.getWallPosition(this.wall)
          this.plane = mesh
          this.plane.visible = true;
          this.plane.edge = this; // js monkey patch
          this.computeTransforms(this.interiorTransform, this.invInteriorTransform, this.interiorStart(), this.interiorEnd());
          this.computeTransforms(this.exteriorTransform, this.invExteriorTransform, this.exteriorStart(), this.exteriorEnd());
        };
        this.front = front || false;
        this.offset = wall.thickness / 2.0;
        this.height = wall.height;
        if (this.front) {
          this.wall.frontEdge = this;
        } else {
          this.wall.backEdge = this;
        }
      }

      HalfEdge.prototype.drawOutline = function () {
        this.box = new THREE.BoxHelper(this.plane, 0xffff00);
        this.edgeSelectedCallbacks.fire(this.box);
      }

      HalfEdge.prototype.removeOutline = function () {
        this.edgeUnSelectedCallbacks.fire(this.box);
      }
      /**
       *
       */
      HalfEdge.prototype.getTexture = function () {
        if (this.front) {
          return this.wall.frontTexture;
        } else {
          return this.wall.backTexture;
        }
      };
      /**
       *
       */
      HalfEdge.prototype.setTexture = function (textureUrl, textureStretch, textureScale) {
        var texture = {
          url: textureUrl,
          stretch: textureStretch,
          scale: textureScale
        };
        if (this.front) {
          this.wall.frontTexture = texture;
        } else {
          this.wall.backTexture = texture;
        }
        this.redrawCallbacks.fire();
      };
      HalfEdge.prototype.interiorDistance = function () {
        var start = this.interiorStart();
        var end = this.interiorEnd();
        return BP3D.Core.Utils.distance(start.x, start.y, end.x, end.y);
      };
      HalfEdge.prototype.computeTransforms = function (transform, invTransform, start, end) {
        var v1 = start;
        var v2 = end;
        var angle = BP3D.Core.Utils.angle(1, 0, v2.x - v1.x, v2.y - v1.y);
        var tt = new THREE.Matrix4();
        tt.makeTranslation(-v1.x, 0, -v1.y);
        var tr = new THREE.Matrix4();
        tr.makeRotationY(-angle);
        transform.multiplyMatrices(tr, tt);

        // new version three
        invTransform.set(transform.element)
        // old version three
        // invTransform.getInverse(transform)
      };
      /** Gets the distance from specified point.
       * @param x X coordinate of the point.
       * @param y Y coordinate of the point.
       * @returns The distance.
       */
      HalfEdge.prototype.distanceTo = function (x, y) {
        // x, y, x1, y1, x2, y2
        return BP3D.Core.Utils.pointDistanceFromLine(x, y, this.interiorStart().x, this.interiorStart().y, this.interiorEnd().x, this.interiorEnd().y);
      };
      HalfEdge.prototype.getStart = function () {
        if (this.front) {
          return this.wall.getStart();
        } else {
          return this.wall.getEnd();
        }
      };
      HalfEdge.prototype.getEnd = function () {
        if (this.front) {
          return this.wall.getEnd();
        } else {
          return this.wall.getStart();
        }
      };
      HalfEdge.prototype.getOppositeEdge = function () {
        if (this.front) {
          return this.wall.backEdge;
        } else {
          return this.wall.frontEdge;
        }
      };
      // these return an object with attributes x, y
      HalfEdge.prototype.interiorEnd = function () {
        var vec = this.halfAngleVector(this, this.next);
        return {
          x: this.getEnd().x + vec.x,
          y: this.getEnd().y + vec.y
        };
      };
      HalfEdge.prototype.interiorStart = function () {
        var vec = this.halfAngleVector(this.prev, this);
        return {
          x: this.getStart().x + vec.x,
          y: this.getStart().y + vec.y
        };
      };
      HalfEdge.prototype.interiorCenter = function () {
        return {
          x: (this.interiorStart().x + this.interiorEnd().x) / 2.0,
          y: (this.interiorStart().y + this.interiorEnd().y) / 2.0,
        };
      };
      HalfEdge.prototype.exteriorEnd = function () {
        var vec = this.halfAngleVector(this, this.next);
        return {
          x: this.getEnd().x - vec.x,
          y: this.getEnd().y - vec.y
        };
      };
      HalfEdge.prototype.exteriorStart = function () {

        var vec = this.halfAngleVector(this.prev, this);
        return {
          x: this.getStart().x - vec.x,
          y: this.getStart().y - vec.y
        };
      };
      /** Get the corners of the half edge.
       * @returns An array of x,y pairs.
       */
      HalfEdge.prototype.corners = function () {
        return [this.interiorStart(), this.interiorEnd(),
        this.exteriorEnd(), this.exteriorStart()
        ];
      };
      /**
       * Gets CCW angle from v1 to v2
       */
      HalfEdge.prototype.halfAngleVector = function (v1, v2) {
        // make the best of things if we dont have prev or next
        var v1startX;
        var v1startY;
        var v1endX;
        var v1endY;

        var v2startX;
        var v2startY;
        var v2endX;
        var v2endY;
        if (!v1) {
          v1startX = v2.getStart().x - (v2.getEnd().x - v2.getStart().x);
          v1startY = v2.getStart().y - (v2.getEnd().y - v2.getStart().y);
          v1endX = v2.getStart().x;
          v1endY = v2.getStart().y;
        } else {
          v1startX = v1.getStart().x;
          v1startY = v1.getStart().y;
          v1endX = v1.getEnd().x;
          v1endY = v1.getEnd().y;
        }
        if (!v2) {
          v2startX = v1.getEnd().x;
          v2startY = v1.getEnd().y;
          v2endX = v1.getEnd().x + (v1.getEnd().x - v1.getStart().x);
          v2endY = v1.getEnd().y + (v1.getEnd().y - v1.getStart().y);
        } else {
          v2startX = v2.getStart().x;
          v2startY = v2.getStart().y;
          v2endX = v2.getEnd().x;
          v2endY = v2.getEnd().y;
        }
        // CCW angle between edges
        var theta = BP3D.Core.Utils.angle2pi(v1startX - v1endX, v1startY - v1endY, v2endX - v1endX, v2endY - v1endY);
        // cosine and sine of half angle
        var cs = Math.cos(theta / 2.0);
        var sn = Math.sin(theta / 2.0);
        // rotate v2
        var v2dx = v2endX - v2startX;
        var v2dy = v2endY - v2startY;
        var vx = v2dx * cs - v2dy * sn;
        var vy = v2dx * sn + v2dy * cs;
        // normalize
        var mag = BP3D.Core.Utils.distance(0, 0, vx, vy);
        if (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "3D" && this.wall == reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[4]) {
          var desiredMag = (partitionWallThickness3D) / sn;
        } else {
          var desiredMag = (this.offset) / sn;
        }
        var scalar = desiredMag / mag;
        var halfAngleVector = {
          x: vx * scalar,
          y: vy * scalar
        };
        return halfAngleVector;
      };
      return HalfEdge;
    })();
    Model.HalfEdge = HalfEdge;
  })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Model;
  (function (Model) {
    /** The default wall texture. */
    var defaultWallTexture = {
      // url: BASE_URL + ASSETS + DEFAULT_WALL_MAP,
      url: LOCAL_SERVER + PUBLIC + TEXTURE + '630de90f5d1c53c50a7c19c5',
      stretch: true,
      scale: 0
    };
    /**
     * A Wall is the basic element to create Rooms.
     *
     * Walls consists of two half edges.
     */
    var Wall = (function () {
      /**
       * Constructs a new wall.
       * @param start Start corner.
       * @param end End corner.
       */
      function Wall(start, end) {
        this.start = start;
        this.end = end;
        /** Front is the plane from start to end. */
        this.frontEdge = null;
        /** Back is the plane from end to start. */
        this.backEdge = null;
        /** */
        this.orphan = false;
        /** Items attached to this wall */
        this.items = [];
        /** */
        this.onItems = [];
        /** The front-side texture. */
        this.frontTexture = defaultWallTexture;
        /** The back-side texture. */
        this.backTexture = defaultWallTexture;
        /** Wall thickness. */
        this.thickness = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallThickness);
        /** Wall height. */
        this.height = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallHeight);
        /** Actions to be applied after movement. */
        this.moved_callbacks = $.Callbacks();
        /** Actions to be applied on removal. */
        this.deleted_callbacks = $.Callbacks();
        /** Actions to be applied explicitly. */
        this.action_callbacks = $.Callbacks();
        this.id = this.getUuid();
        this.start.attachStart(this);
        this.end.attachEnd(this);
      }
      Wall.prototype.getUuid = function () {
        return [this.start.id, this.end.id].join();
      };
      Wall.prototype.resetFrontBack = function () {
        this.frontEdge = null;
        this.backEdge = null;
        this.orphan = false;
      };
      Wall.prototype.snapToAxis = function (tolerance) {
        // order here is important, but unfortunately arbitrary
        this.start.snapToAxis(tolerance);
        this.end.snapToAxis(tolerance);
      };
      Wall.prototype.fireOnMove = function (func) {
        this.moved_callbacks.add(func);
      };
      Wall.prototype.fireOnDelete = function (func) {
        this.deleted_callbacks.add(func);
      };
      Wall.prototype.dontFireOnDelete = function (func) {
        this.deleted_callbacks.remove(func);
      };
      Wall.prototype.fireOnAction = function (func) {
        this.action_callbacks.add(func);
      };
      Wall.prototype.fireAction = function (action) {
        this.action_callbacks.fire(action);
      };
      Wall.prototype.relativeMove = function (dx, dy) {

        this.start.relativeMove(dx, dy);
        this.end.relativeMove(dx, dy);
      };
      Wall.prototype.fireMoved = function () {
        this.moved_callbacks.fire();
      };
      Wall.prototype.fireRedraw = function () {
        if (this.frontEdge) {
          this.frontEdge.redrawCallbacks.fire();
        }
        if (this.backEdge) {
          this.backEdge.redrawCallbacks.fire();
        }
      };
      Wall.prototype.getStart = function () {
        return this.start;
      };
      Wall.prototype.getEnd = function () {
        return this.end;
      };
      Wall.prototype.getStartX = function () {
        return this.start.getX();
      };
      Wall.prototype.getEndX = function () {
        return this.end.getX();
      };
      Wall.prototype.getStartY = function () {
        return this.start.getY();
      };
      Wall.prototype.getEndY = function () {
        return this.end.getY();
      };
      Wall.prototype.remove = function () {
        this.start.detachWall(this);
        this.end.detachWall(this);
        this.deleted_callbacks.fire(this);
      };
      Wall.prototype.setStart = function (corner) {
        this.start.detachWall(this);
        corner.attachStart(this);
        this.start = corner;
        this.fireMoved();
      };
      Wall.prototype.setEnd = function (corner) {
        this.end.detachWall(this);
        corner.attachEnd(this);
        this.end = corner;
        this.fireMoved();
      };
      Wall.prototype.distanceFrom = function (x, y) {
        return BP3D.Core.Utils.pointDistanceFromLine(x, y, this.getStartX(), this.getStartY(), this.getEndX(), this.getEndY());
      };
      /** Return the corner opposite of the one provided.
       * @param corner The given corner.
       * @returns The opposite corner.
       */
      Wall.prototype.oppositeCorner = function (corner) {
        // console.log("check");
        if (this.start === corner) {
          return this.end;
        } else if (this.end === corner) {
          return this.start;
        } else {
          // console.log('Wall does not connect to corner');
        }
      };

      Wall.prototype.getLength = function () {
        return Math.abs(this.start.x - this.end.x) + Math.abs(this.start.y - this.end.y)
      }
      Wall.prototype.isOppositeOfWall = function (wall) {
        if (wall.start.x == wall.end.x) {
          // console.log("is equal", this.start.x === wall.start.x)
          return this.start.y === wall.start.y
        } else {
          return this.start.x === wall.start.x
        }
      }


      return Wall;
    })();
    Model.Wall = Wall;
  })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));

/*
TODO
var Vec2 = require('vec2')
var segseg = require('segseg')
var Polygon = require('polygon')
*/

(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Model;
  (function (Model) {
    /** Default texture to be used if nothing is provided. */
    var defaultRoomTexture = {
      // url: BASE_URL + ASSETS + DEFAULT_FLOOR_MAP,
      url: LOCAL_SERVER + PUBLIC + TEXTURE + DEFAULT_FLOOR_MAP,
      scale: 400
    };
    /**
     * A Room is the combination of a Floorplan with a floor plane.
     */
    var Room = (function () {
      /**
       *  ordered CCW
       */
      function Room(floorplan, corners) {
        this.floorplan = floorplan;
        this.corners = corners;
        /** */
        this.interiorCorners = [];
        /** */
        this.edgePointer = null;
        /** floor plane for intersection testing */
        this.floorPlane = null;

        this.box = null;
        /** */
        this.customTexture = false;
        /** */
        this.floorChangeCallbacks = $.Callbacks();

        this.roomSelectedCallbacks = $.Callbacks();
        this.roomUnSelectedCallbacks = $.Callbacks();
        this.updateWalls();
        this.updateInteriorCorners();
        this.generatePlane();
      }

      Room.prototype.drawOutline = function () {
        this.box = new THREE.BoxHelper(this.floorPlane, 0xffff00);
        this.roomSelectedCallbacks.fire(this.box);
      }

      Room.prototype.removeOutline = function () {
        this.roomUnSelectedCallbacks.fire(this.box);
      }

      Room.prototype.getUuid = function () {
        var cornerUuids = BP3D.Core.Utils.map(this.corners, function (c) {
          return c.id;
        });
        cornerUuids.sort();
        return cornerUuids.join();
      };
      Room.prototype.fireOnFloorChange = function (callback) {
        this.floorChangeCallbacks.add(callback);
      };
      Room.prototype.getTexture = function () {
        var uuid = this.getUuid();
        var tex = this.floorplan.getFloorTexture(uuid);

        return tex || defaultRoomTexture;
      };
      /**
       * textureStretch always true, just an argument for consistency with walls
       */
      Room.prototype.setTexture = function (textureUrl, textureStretch, textureScale) {
        var uuid = this.getUuid();
        this.floorplan.setFloorTexture(uuid, textureUrl, textureScale);
        this.floorChangeCallbacks.fire();
      };
      Room.prototype.generatePlane = function () {
        var points = [];
        this.interiorCorners.forEach(function (corner) {
          points.push(new THREE.Vector2(corner.x, corner.y));
        });
        var shape = new THREE.Shape(points);
        var geometry = new THREE.ShapeGeometry(shape);
        this.floorPlane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
          side: THREE.DoubleSide
        }));
        this.floorPlane.visible = false;
        this.floorPlane.rotation.set(Math.PI / 2, 0, 0);
        this.floorPlane.room = this; // js monkey patch
      };
      Room.prototype.cycleIndex = function (index) {
        if (index < 0) {
          return index += this.corners.length;
        } else {
          return index % this.corners.length;
        }
      };

      Room.prototype.updateInteriorCorners = function () {
        var edge = this.edgePointer;
        while (true) {
          this.interiorCorners.push(edge.interiorStart());
          edge.generatePlane();
          if (edge.next === this.edgePointer) {
            break;
          } else {
            edge = edge.next;
          }
        }
      };
      /**
       * Populates each wall's half edge relating to this room
       * this creates a fancy doubly connected edge list (DCEL)
       */
      Room.prototype.updateWalls = function () {
        var prevEdge = null;
        var firstEdge = null;
        for (var i = 0; i < this.corners.length; i++) {
          var firstCorner = this.corners[i];
          var secondCorner = this.corners[(i + 1) % this.corners.length];
          // find if wall is heading in that direction
          var wallTo = firstCorner.wallTo(secondCorner);
          var wallFrom = firstCorner.wallFrom(secondCorner);
          var edge;
          if (wallTo) {
            edge = new Model.HalfEdge(this, wallTo, true);
          } else if (wallFrom) {
            edge = new Model.HalfEdge(this, wallFrom, false);
          } else {
            // something horrible has happened
            // console.log("corners arent connected by a wall, uh oh");
          }
          if (i === 0) {
            firstEdge = edge;
          } else {
            edge.prev = prevEdge;
            prevEdge.next = edge;
            if (i + 1 === this.corners.length) {
              firstEdge.prev = edge;
              edge.next = firstEdge;
            }
          }
          prevEdge = edge;
        }
        // hold on to an edge reference
        this.edgePointer = firstEdge;
      };
      return Room;
    })();
    Model.Room = Room;
  })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Model;
  (function (Model) {
    /** */
    var defaultFloorPlanTolerance = 10.0;
    /**
     * A Floorplan represents a number of Walls, Corners and Rooms.
     */
    var Floorplan = (function () {
      /** Constructs a floorplan. */
      function Floorplan() {
        /** */
        this.walls = [];
        /** */
        this.corners = [];
        /** */
        this.rooms = [];
        /** */
        this.new_wall_callbacks = $.Callbacks();
        /** */
        this.new_corner_callbacks = $.Callbacks();
        /** */
        this.redraw_callbacks = $.Callbacks();
        /** */
        this.updated_rooms = $.Callbacks();
        /** */
        this.roomLoadedCallbacks = $.Callbacks();
        /**
         * Floor textures are owned by the floorplan, because room objects are
         * destroyed and created each time we change the floorplan.
         * floorTextures is a map of room UUIDs (string) to a object with
         * url and scale attributes.
         */
        this.floorTextures = {};
      }
      // hack
      Floorplan.prototype.wallEdges = function () {
        var edges = [];
        this.walls.forEach(function (wall) {
          if (wall.frontEdge) {
            edges.push(wall.frontEdge);
          }
          if (wall.backEdge) {
            edges.push(wall.backEdge);
          }
        });
        return edges;
      };
      // hack
      Floorplan.prototype.wallEdgePlanes = function () {
        var planes = [];
        this.walls.forEach(function (wall) {
          if (wall.frontEdge) {
            planes.push(wall.frontEdge.plane);
          }
          if (wall.backEdge) {
            planes.push(wall.backEdge.plane);
          }
        });
        return planes;
      };
      Floorplan.prototype.floorPlanes = function () {
        return BP3D.Core.Utils.map(this.rooms, function (room) {
          return room.floorPlane;
        });
      };
      Floorplan.prototype.fireOnNewWall = function (callback) {
        this.new_wall_callbacks.add(callback);
      };
      Floorplan.prototype.fireOnNewCorner = function (callback) {
        this.new_corner_callbacks.add(callback);
      };
      Floorplan.prototype.fireOnRedraw = function (callback) {
        this.redraw_callbacks.add(callback);
      };
      Floorplan.prototype.fireOnUpdatedRooms = function (callback) {
        this.updated_rooms.add(callback);
      };
      /**
       * Creates a new wall.
       * @param start The start corner.
       * @param end he end corner.
       * @returns The new wall.
       */
      Floorplan.prototype.newWall = function (start, end) {
        var wall = new Model.Wall(start, end);
        this.walls.push(wall);
        var scope = this;
        wall.fireOnDelete(function () {
          scope.removeWall(wall);
        });
        this.new_wall_callbacks.fire(wall);
        this.update();
        return wall;
      };
      /** Removes a wall.
       * @param wall The wall to be removed.
       */
      Floorplan.prototype.removeWall = function (wall) {
        BP3D.Core.Utils.removeValue(this.walls, wall);
        this.update();
      };
      /**
       * Creates a new corner.
       * @param x The x coordinate.
       * @param y The y coordinate.
       * @param id An optional id. If unspecified, the id will be created internally.
       * @returns The new corner.
       */
      Floorplan.prototype.newCorner = function (x, y, id) {
        var _this = this;
        var corner = new Model.Corner(this, x, y, id);
        this.corners.push(corner);
        corner.fireOnDelete(function () {
          // eslint-disable-next-line no-unused-expressions
          _this.removeCorner;
        });
        this.new_corner_callbacks.fire(corner);
        return corner;
      };
      /** Removes a corner.
       * @param corner The corner to be removed.
       */
      Floorplan.prototype.removeCorner = function (corner) {
        BP3D.Core.Utils.removeValue(this.corners, corner);
      };
      /** Gets the walls. */
      Floorplan.prototype.getWalls = function () {
        return this.walls;
      };

      Floorplan.prototype.updateMaxLenghtOfPartitionWall = function () {

        let maxLengthFromTop = 0
        let maxLengthFromBottom = 0
        let partitionWall = this.getWalls()[4]
        let distanceOfTopCornerFromBottomWall = partitionWall.end.distanceFromWall(this.getWalls()[reducerBlueprint?.configuration2D?.partitionType == 'vertical' ? 1 : 2]) - reducerBlueprint?.configuration2D?.minimumWallLength
        maxLengthFromTop = distanceOfTopCornerFromBottomWall + partitionWall.getLength()

        let distanceOfBottomCornerFromTopWall = partitionWall.start.distanceFromWall(this.getWalls()[reducerBlueprint?.configuration2D?.partitionType == 'vertical' ? 3 : 0]) - reducerBlueprint?.configuration2D?.minimumWallLength
        maxLengthFromBottom = distanceOfBottomCornerFromTopWall + partitionWall.getLength()
        dispatch(updateConfigurationStates(maxLengthFromBottom, 'maxValueOfLengthTopFloating'))
        dispatch(updateConfigurationStates(maxLengthFromTop, 'maxValueOfLengthBottomFloating'))


      }

      /** Gets current wall position walls. */
      Floorplan.prototype.getWallPosition = function (activeWall) {
        let wallPosition
        for (var i = 0; i < this.walls.length; i++) {
          let wall = this.walls[i]
          // console.log(`this is wall check ${i}`, wall)
          if (wall.start.x === wall.end.x && activeWall.start.x === activeWall.end.x && activeWall != wall) {
            //Wall is vertical
            if (wall.start.x < activeWall.start.x) {
              wallPosition = "right"
            } else {
              wallPosition = "left"
            }
          } else if (wall.start.y === wall.end.y && activeWall.start.y === activeWall.end.y && activeWall != wall) {
            if (wall.start.y < activeWall.start.y) {
              wallPosition = "bottom"
            } else {
              wallPosition = "top"
            }
            // wall is horizontal
          }
        }

        if (activeWall.id == this.walls[4]?.id) {
          wallPosition = "partition" // we are assuming that the last wall(5 one) will always be partition wall,
        }
        return wallPosition
      };
      /** Gets the corners. */
      Floorplan.prototype.getCorners = function () {
        return this.corners;
      };
      /** Gets the rooms. */
      Floorplan.prototype.getRooms = function () {
        return this.rooms;
      };
      Floorplan.prototype.overlappedCorner = function (x, y, tolerance) {
        tolerance = tolerance || defaultFloorPlanTolerance;
        for (var i = 0; i < this.corners.length; i++) {
          if (this.corners[i].distanceFrom(x, y) < tolerance) {
            return this.corners[i];
          }
        }
        return null;
      };
      Floorplan.prototype.overlappedWall = function (x, y, tolerance) {
        tolerance = tolerance || defaultFloorPlanTolerance;
        for (var i = 0; i < this.walls.length; i++) {
          if (this.walls[i].distanceFrom(x, y) < tolerance) {
            return this.walls[i];
          }
        }
        return null;
      };
      // import and export -- cleanup
      Floorplan.prototype.saveFloorplan = function () {
        var floorplan = {
          corners: {},
          walls: [],
          wallTextures: [],
          floorTextures: {},
          newFloorTextures: {}
        };
        this.corners.forEach(function (corner) {
          floorplan.corners[corner.id] = {
            'x': corner.x,
            'y': corner.y
          };
        });
        this.walls.forEach(function (wall) {
          floorplan.walls.push({
            'corner1': wall.getStart().id,
            'corner2': wall.getEnd().id,
            'frontTexture': wall.frontTexture,
            'backTexture': wall.backTexture
          });
        });
        floorplan.newFloorTextures = this.floorTextures;
        return floorplan;
      };
      Floorplan.prototype.loadFloorplan = function (floorplan) {
        this.reset();
        var corners = {};
        if (floorplan == null || !('corners' in floorplan) || !('walls' in floorplan)) {
          return;
        }
        for (var id in floorplan.corners) {
          var corner = floorplan.corners[id];
          corners[id] = this.newCorner(corner.x, corner.y, id);
        }
        var scope = this;
        floorplan.walls.forEach(function (wall) {
          var newWall = scope.newWall(corners[wall.corner1], corners[wall.corner2]);
          // console.log("this is first generate = ", corners[wall.corner1])
          if (wall.frontTexture) {
            newWall.frontTexture = wall.frontTexture;
          }
          if (wall.backTexture) {
            newWall.backTexture = wall.backTexture;
          }
        });
        if ('newFloorTextures' in floorplan) {
          this.floorTextures = floorplan.newFloorTextures;
        }
        this.update();
        this.roomLoadedCallbacks.fire();
      };
      Floorplan.prototype.getFloorTexture = function (uuid) {
        if (uuid in this.floorTextures) {
          return this.floorTextures[uuid];
        } else {
          return null;
        }
      };
      Floorplan.prototype.setFloorTexture = function (uuid, url, scale) {
        this.floorTextures[uuid] = {
          url: url,
          scale: scale
        };
      };
      /** clear out obsolete floor textures */
      Floorplan.prototype.updateFloorTextures = function () {
        var uuids = BP3D.Core.Utils.map(this.rooms, function (room) {
          return room.getUuid();
        });
        for (var uuid in this.floorTextures) {
          if (!BP3D.Core.Utils.hasValue(uuids, uuid)) {
            delete this.floorTextures[uuid];
          }
        }
      };
      /** */
      Floorplan.prototype.reset = function () {
        var tmpCorners = this.corners.slice(0);
        var tmpWalls = this.walls.slice(0);
        tmpCorners.forEach(function (corner) {
          corner.remove();
        });
        tmpWalls.forEach(function (wall) {
          wall.remove();
        });
        this.corners = [];
        this.walls = [];
      };
      /**
       * Update rooms
       */
      Floorplan.prototype.update = function () {
        this.walls.forEach(function (wall) {
          wall.resetFrontBack();
        });
        var roomCorners = this.findRooms(this.corners);
        this.rooms = [];
        var scope = this;
        roomCorners.forEach(function (corners) {
          scope.rooms.push(new Model.Room(scope, corners));
        });
        this.assignOrphanEdges();
        this.updateFloorTextures();
        this.updated_rooms.fire();
      };
      /**
       * Returns the center of the floorplan in the y plane
       */
      Floorplan.prototype.getCenter = function () {
        return this.getDimensions(true);
      };
      Floorplan.prototype.getSize = function () {
        return this.getDimensions(false);
      };
      Floorplan.prototype.getDimensions = function (center) {
        center = center || false; // otherwise, get size
        var xMin = Infinity;
        var xMax = -Infinity;
        var zMin = Infinity;
        var zMax = -Infinity;
        this.corners.forEach(function (corner) {
          if (corner.x < xMin)
            xMin = corner.x;
          if (corner.x > xMax)
            xMax = corner.x;
          if (corner.y < zMin)
            zMin = corner.y;
          if (corner.y > zMax)
            zMax = corner.y;
        });
        var ret;
        if (xMin === Infinity || xMax === -Infinity || zMin === Infinity || zMax === -Infinity) {
          ret = new THREE.Vector3();
        } else {
          if (center) {
            // center
            ret = new THREE.Vector3((xMin + xMax) * 0.5, 0, (zMin + zMax) * 0.5);
          } else {
            // size
            ret = new THREE.Vector3((xMax - xMin), 0, (zMax - zMin));
          }
        }
        return ret;
      };
      Floorplan.prototype.assignOrphanEdges = function () {
        // kinda hacky
        // find orphaned wall segments (i.e. not part of rooms) and
        // give them edges
        var orphanWalls = [];
        this.walls.forEach(function (wall) {
          if (!wall.backEdge && !wall.frontEdge) {
            wall.orphan = true;
            var back = new Model.HalfEdge(null, wall, false);
            back.generatePlane();
            var front = new Model.HalfEdge(null, wall, true);
            front.generatePlane();
            orphanWalls.push(wall);
          }
        });
      };
      /*
       * Find the "rooms" in our planar straight-line graph.
       * Rooms are set of the smallest (by area) possible cycles in this graph.
       * @param corners The corners of the floorplan.
       * @returns The rooms, each room as an array of corners.
       */
      Floorplan.prototype.findRooms = function (corners) {
        function _calculateTheta(previousCorner, currentCorner, nextCorner) {
          var theta = BP3D.Core.Utils.angle2pi(previousCorner.x - currentCorner.x, previousCorner.y - currentCorner.y, nextCorner.x - currentCorner.x, nextCorner.y - currentCorner.y);
          return theta;
        }

        function _removeDuplicateRooms(roomArray) {
          var results = [];
          var lookup = {};
          var hashFunc = function (corner) {
            return corner.id;
          };
          var sep = '-';
          for (var i = 0; i < roomArray.length; i++) {
            // rooms are cycles, shift it around to check uniqueness
            var add = true;
            var room = roomArray[i];
            for (var j = 0; j < room.length; j++) {
              var roomShift = BP3D.Core.Utils.cycle(room, j);
              var str = BP3D.Core.Utils.map(roomShift, hashFunc).join(sep);
              if (lookup.hasOwnProperty(str)) {
                add = false;
              }
            }
            if (add) {
              results.push(roomArray[i]);
              lookup[str] = true;
            }
          }
          return results;
        }

        function _findTightestCycle(firstCorner, secondCorner) {
          var stack = [];
          var next = {
            corner: secondCorner,
            previousCorners: [firstCorner]
          };
          var visited = {};
          visited[firstCorner.id] = true;
          var compFunc = function (a, b) {
            return (_calculateTheta(previousCorner, currentCorner, b) -
              _calculateTheta(previousCorner, currentCorner, a));
          }
          var pushFunc = function (corner) {
            stack.push({
              corner: corner,
              previousCorners: previousCorners
            });
          }

          while (next) {
            // update previous corners, current corner, and visited corners
            var currentCorner = next.corner;
            visited[currentCorner.id] = true;
            // did we make it back to the startCorner?
            if (next.corner === firstCorner && currentCorner !== secondCorner) {
              return next.previousCorners;
            }
            var addToStack = [];
            var adjacentCorners = next.corner.adjacentCorners();
            for (let i = 0; i < adjacentCorners.length; i++) {
              var nextCorner = adjacentCorners[i];
              // is this where we came from?
              // give an exception if its the first corner and we aren't at the second corner
              if (nextCorner.id in visited &&
                !(nextCorner === firstCorner && currentCorner !== secondCorner)) {
                continue;
              }
              // nope, throw it on the queue  
              addToStack.push(nextCorner);
            }
            var previousCorners = next.previousCorners.slice(0);
            previousCorners.push(currentCorner);

            if (addToStack.length > 1) {
              // visit the ones with smallest theta first
              var previousCorner = next.previousCorners[next.previousCorners.length - 1];
              addToStack.sort(compFunc);
            }
            if (addToStack.length > 0) {
              // add to the stack
              addToStack.forEach(pushFunc);
            }
            // pop off the next one
            next = stack.pop();
          }
          return [];
        }
        // find tightest loops, for each corner, for each adjacent
        // TODO: optimize this, only check corners with > 2 adjacents, or isolated cycles
        var loops = [];
        corners.forEach(function (firstCorner) {
          firstCorner.adjacentCorners().forEach(function (secondCorner) {
            loops.push(_findTightestCycle(firstCorner, secondCorner));
          });
        });
        // remove duplicates
        var uniqueLoops = _removeDuplicateRooms(loops);
        //remove CW loops
        var uniqueCCWLoops = BP3D.Core.Utils.removeIf(uniqueLoops, BP3D.Core.Utils.isClockwise);
        return uniqueCCWLoops;
      };
      return Floorplan;
    })();
    Model.Floorplan = Floorplan;
  })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /**
     * A Floor Item is an entity to be placed related to a floor.
     */
    var FloorItem = (function (_super) {
      // __extends(FloorItem, _super);

      class FloorItem extends _super {
        constructor(model, metadata, geometry, material, position, rotation, scale) {
          super(model, metadata, geometry, material, position, rotation, scale);
        }
        /** */
        placeInRoom() {
          if (!this.position_set) {
            var center = this.model.floorplan.getCenter();
            this.position.x = center.x;
            this.position.z = center.z;
            this.position.y = 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y);
          }
        }
        setYPos(yPos) {
        }
        /** Take action after a resize */
        resized() {
          this.position.y = this.halfSize.y;
        }
        /** */
        moveToPosition(vec3, intersection) {
          // keeps the position in the room and on the floor
          if (!this.isValidPosition(vec3)) {
            this.showError(vec3);
            return;
          } else {
            this.hideError();
            vec3.y = this.position.y; // keep it on the floor!
            this.position.copy(vec3);
          }
        }
        /** */
        isValidPosition(vec3) {
          var corners = this.getCorners('x', 'z', vec3);
          // check if we are in a room
          var rooms = this.model.floorplan.getRooms();
          var isInARoom = false;
          for (let i = 0; i < rooms.length; i++) {
            if (BP3D.Core.Utils.pointInPolygon(vec3.x, vec3.z, rooms[i].interiorCorners) &&
              !BP3D.Core.Utils.polygonPolygonIntersect(corners, rooms[i].interiorCorners)) {
              isInARoom = true;
            }
          }
          if (!isInARoom) {
            //// console.log('object not in a room');
            return false;
          }

          // check if we are outside all other objects
          if (this.obstructFloorMoves) {
            let objects = this.model.scene.getItems();
            for (let i = 0; i < objects.length; i++) {
              if (objects[i] === this || !objects[i].obstructFloorMoves) {
                continue;
              }
              if (!BP3D.Core.Utils.polygonOutsidePolygon(corners, objects[i].getCorners('x', 'z')) ||
                BP3D.Core.Utils.polygonPolygonIntersect(corners, objects[i].getCorners('x', 'z'))) {
                //// console.log('object not outside other objects');
                return false;
              }
            }
          }

          // check if we are outside all other on floor objects
          if (this.obstructOnFloorMoves) {
            let objects = this.model.scene.getItems();
            for (let i = 0; i < objects.length; i++) {
              if (objects[i] === this || !objects[i].obstructOnFloorMoves) {
                continue;
              }
              if (!BP3D.Core.Utils.polygonOutsidePolygon(corners, objects[i].getCorners('x', 'z')) ||
                BP3D.Core.Utils.polygonPolygonIntersect(corners, objects[i].getCorners('x', 'z'))) {
                //// console.log('object not outside other objects');
                return false;
              }
            }
          }
          return true;
        }
      };

      return FloorItem;
    })(Items.Item);
    Items.FloorItem = FloorItem;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));

(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /**
     * AnyWhere Item
     */
    var AnywhereItem = (function (_super) {
      __extends(AnywhereItem, _super);

      function AnywhereItem(model, metadata, geometry, material, position, rotation, scale) {
        _super.call(this, model, metadata, geometry, material, position, rotation, scale);
      };
      /** */
      AnywhereItem.prototype.placeInRoom = function (pos) {
        if (!this.position_set) {
          var center = this.model.floorplan.getCenter();
          this.position.x = center.x;
          this.position.z = center.z;
          if (pos !== null && pos !== undefined) {
            this.position.y = pos.y;
          } else {
            this.position.y = 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y);
          }
        }
      };

      AnywhereItem.prototype.setYPos = function (yPos) {
        this.position.y = yPos;
      }

      /** */
      AnywhereItem.prototype.isElevationAdjustable = function () {
        return true;
      };

      AnywhereItem.prototype.moveToPosition = function (vec3, intersection) {
        // keeps the position in the room
        if (!this.isValidPosition(vec3)) {
          this.showError(vec3);
          return;
        } else {
          let yPos = this.getYPos(vec3);
          vec3.y = yPos;
          $("#item-elevation").val(this.cmToIn(this.getElevation()).toFixed(0));
          this.hideError();
          this.position.copy(vec3);
        }
      };

      AnywhereItem.prototype.cmToIn = function (cm) {
        return cm / 2.54;
      }

      /** */
      AnywhereItem.prototype.isValidPosition = function (vec3) {
        var corners = this.getCorners('x', 'z', vec3);
        // check if we are in a room
        var rooms = this.model.floorplan.getRooms();
        var isInARoom = false;
        for (let i = 0; i < rooms.length; i++) {
          if (BP3D.Core.Utils.pointInPolygon(vec3.x, vec3.z, rooms[i].interiorCorners) &&
            !BP3D.Core.Utils.polygonPolygonIntersect(corners, rooms[i].interiorCorners)) {
            isInARoom = true;
          }
        }
        if (!isInARoom) {
          //// console.log('object not in a room');
          return false;
        }

        return true;
      };

      AnywhereItem.prototype.getYPos = function (vec3) {
        var corners = this.getCorners('x', 'z', vec3);
        // check if we are outside all other objects

        let objects = this.model.scene.getItems();
        for (let i = 0; i < objects.length; i++) {
          if (objects[i] === this || objects[i].obstructCeilingMoves || objects[i].obstructOnFloorMoves) {
            continue;
          }
          if (
            BP3D.Core.Utils.polygonPolygonIntersect(corners, objects[i].getCorners('x', 'z'))) {
            // // console.log('object not outside other objects');
            return objects[i].position.y + objects[i].halfSize.y + this.halfSize.y;
          }
          if (!BP3D.Core.Utils.polygonOutsidePolygon(corners, objects[i].getCorners('x', 'z'))) {
            return this.position.y;
          }
        }


        return 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y);
      }

      return AnywhereItem;
    })(Items.FloorItem);
    Items.AnywhereItem = AnywhereItem;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));

(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /**
     * AnyWhere Item
     */
    var CeilingItem = (function (_super) {
      __extends(CeilingItem, _super);

      function CeilingItem(model, metadata, geometry, material, position, rotation, scale) {
        _super.call(this, model, metadata, geometry, material, position, rotation, scale);
        this.obstructCeilingMoves = true;
        this.obstructFloorMoves = false;
        this.castShadow = false;
        this.receiveShadow = false;
      };
      /** */
      CeilingItem.prototype.placeInRoom = function () {
        if (!this.position_set) {
          var center = this.model.floorplan.getCenter();
          this.position.x = center.x;
          this.position.z = center.z;
          this.position.y = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallHeight) - 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y);
        }
      };

      CeilingItem.prototype.setYPos = function (yPos) {

      }

      CeilingItem.prototype.resized = function () {
        this.position.y = BP3D.Core.Configuration.getNumericValue(BP3D.Core.configWallHeight) - this.halfSize.y;
      };

      CeilingItem.prototype.moveToPosition = function (vec3, intersection) {
        // keeps the position in the room
        if (!this.isValidPosition(vec3)) {
          this.showError(vec3);
          return;
        } else {
          this.hideError();
          // if (vec3.y < 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y)) {
          //     vec3.y = this.position.y;
          // } else {
          vec3.y = this.position.y;
          // }
          this.position.copy(vec3);
        }
      };
      /** */
      CeilingItem.prototype.isValidPosition = function (vec3) {
        var corners = this.getCorners('x', 'z', vec3);
        // check if we are in a room
        var rooms = this.model.floorplan.getRooms();
        var isInARoom = false;
        for (let i = 0; i < rooms.length; i++) {
          if (BP3D.Core.Utils.pointInPolygon(vec3.x, vec3.z, rooms[i].interiorCorners) &&
            !BP3D.Core.Utils.polygonPolygonIntersect(corners, rooms[i].interiorCorners)) {
            isInARoom = true;
          }
        }
        if (!isInARoom) {
          //// console.log('object not in a room');
          return false;
        }

        // check if we are outside all other on floor objects
        if (this.obstructCeilingMoves) {
          let objects = this.model.scene.getItems();
          for (let i = 0; i < objects.length; i++) {
            if (objects[i] === this || !objects[i].obstructCeilingMoves) {
              continue;
            }
            if (!BP3D.Core.Utils.polygonOutsidePolygon(corners, objects[i].getCorners('x', 'z')) ||
              BP3D.Core.Utils.polygonPolygonIntersect(corners, objects[i].getCorners('x', 'z'))) {
              //// console.log('object not outside other objects');
              return false;
            }
          }
        }

        return true;
      };
      return CeilingItem;
    })(Items.FloorItem);
    Items.CeilingItem = CeilingItem;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /**
     * A Wall Item is an entity to be placed related to a wall.
     */
    var WallItem = (function (_super) {
      __extends(WallItem, _super);

      function WallItem(model, metadata, geometry, material, position, rotation, scale) {
        _super.call(this, model, metadata, geometry, material, position, rotation, scale);
        /** The currently applied wall edge. */
        this.currentWallEdge = null;
        /* TODO:
           This caused a huge headache.
           HalfEdges get destroyed/created every time floorplan is edited.
           This item should store a reference to a wall and front/back,
           and grab its edge reference dynamically whenever it needs it.
         */
        /** used for finding rotations */
        this.refVec = new THREE.Vector2(0, 1.0);
        /** */
        this.wallOffsetScalar = 0;
        /** */
        this.sizeX = 0;
        /** */
        this.sizeY = 0;
        /** */
        this.addToWall = false;
        /** */
        this.boundToFloor = false;

        this.obstructInWallMoves = false;
        /** */
        this.frontVisible = false;
        /** */
        this.backVisible = false;
        this.allowRotate = false;
      };
      /** Get the closet wall edge.
       * @returns The wall edge.
       */
      WallItem.prototype.closestWallEdge = function () {
        var wallEdges = this.model.floorplan.wallEdges();
        var wallEdge = null;
        var minDistance = null;
        var itemX = this.position.x;
        var itemZ = this.position.z;
        wallEdges.forEach(function (edge) {
          var distance = edge.distanceTo(itemX, itemZ);
          if (minDistance === null || distance < minDistance) {
            minDistance = distance;
            wallEdge = edge;
          }
        });
        return wallEdge;
      };
      /** */
      WallItem.prototype.removed = function () {
        if (this.currentWallEdge != null && this.addToWall) {
          BP3D.Core.Utils.removeValue(this.currentWallEdge.wall.items, this);
          this.redrawWall();
        }
      };
      /** */
      WallItem.prototype.redrawWall = function () {
        if (this.addToWall) {
          this.currentWallEdge.wall.fireRedraw();
        }
      };
      /** */
      WallItem.prototype.updateEdgeVisibility = function (visible, front) {
        if (front) {
          this.frontVisible = visible;
        } else {
          this.backVisible = visible;
        }

        this.visible = (this.frontVisible || this.backVisible);
      };
      /** */
      WallItem.prototype.updateSize = function () {
        this.wallOffsetScalar = (this.geometry.boundingBox.max.z - this.geometry.boundingBox.min.z) * this.scale.z / 2.0;
        this.sizeX = (this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x) * this.scale.x;
        this.sizeY = (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) * this.scale.y;
      };
      /** */
      WallItem.prototype.resized = function () {
        if (this.boundToFloor) {
          this.position.y = 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) * this.scale.y + 0.01;
        }
        this.updateSize();
        this.redrawWall();
      };
      /** */
      WallItem.prototype.placeInRoom = function () {
        var closestWallEdge = this.closestWallEdge();
        this.changeWallEdge(closestWallEdge);
        this.updateSize();
        if (!this.position_set) {
          // position not set
          var center = closestWallEdge.interiorCenter();
          var newPos = new THREE.Vector3(center.x, closestWallEdge.wall.height / 2.0, center.y);
          this.boundMove(newPos);
          this.position.copy(newPos);
          this.redrawWall();
        }
      };

      WallItem.prototype.setYPos = function (yPos) {

      }
      /** */
      WallItem.prototype.moveToPosition = function (vec3, intersection) {
        this.changeWallEdge(intersection.object.edge);
        this.boundMove(vec3);
        this.position.copy(vec3);
        this.redrawWall();
      };



      /** */
      WallItem.prototype.getWallOffset = function () {
        return this.wallOffsetScalar;
      };
      /** */
      WallItem.prototype.changeWallEdge = function (wallEdge) {
        if (this.currentWallEdge != null) {
          if (this.addToWall) {
            BP3D.Core.Utils.removeValue(this.currentWallEdge.wall.items, this);
            this.redrawWall();
          } else {
            BP3D.Core.Utils.removeValue(this.currentWallEdge.wall.onItems, this);
          }
        }
        // handle subscription to wall being removed
        if (this.currentWallEdge != null) {
          this.currentWallEdge.wall.dontFireOnDelete(this.remove.bind(this));
        }
        wallEdge.wall.fireOnDelete(this.remove.bind(this));
        // find angle between wall normals
        var normal2 = new THREE.Vector2();
        var normal3 = wallEdge.plane.geometry.faces[0].normal;
        normal2.x = normal3.x;
        normal2.y = normal3.z;
        var angle = BP3D.Core.Utils.angle(this.refVec.x, this.refVec.y, normal2.x, normal2.y);
        this.rotation.y = angle;
        // update currentWall
        this.currentWallEdge = wallEdge;
        if (this.addToWall) {
          wallEdge.wall.items.push(this);
          this.redrawWall();
        } else {
          wallEdge.wall.onItems.push(this);
        }
      };
      /** Returns an array of planes to use other than the ground plane
       * for passing intersection to clickPressed and clickDragged */
      WallItem.prototype.customIntersectionPlanes = function () {
        return this.model.floorplan.wallEdgePlanes();
      };
      /** takes the move vec3, and makes sure object stays bounded on plane */
      WallItem.prototype.boundMove = function (vec3) {
        var tolerance = 1;
        var edge = this.currentWallEdge;
        vec3.applyMatrix4(edge.interiorTransform);
        if (vec3.x < this.sizeX / 2.0 + tolerance) {
          vec3.x = this.sizeX / 2.0 + tolerance;
        } else if (vec3.x > (edge.interiorDistance() - this.sizeX / 2.0 - tolerance)) {
          vec3.x = edge.interiorDistance() - this.sizeX / 2.0 - tolerance;
        }
        if (this.boundToFloor) {
          vec3.y = 0.5 * (this.geometry.boundingBox.max.y - this.geometry.boundingBox.min.y) * this.scale.y + 0.01;
        } else {
          if (vec3.y < this.sizeY / 2.0 + tolerance) {
            vec3.y = this.sizeY / 2.0 + tolerance;
          } else if (vec3.y > edge.height - this.sizeY / 2.0 - tolerance) {
            vec3.y = edge.height - this.sizeY / 2.0 - tolerance;
          }
        }
        vec3.z = this.getWallOffset();
        vec3.applyMatrix4(edge.invInteriorTransform);
      };

      //obstruct
      return WallItem;
    })(Items.Item);
    Items.WallItem = WallItem;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /** */
    var InWallItem = (function (_super) {
      __extends(InWallItem, _super);

      function InWallItem(model, metadata, geometry, material, position, rotation, scale) {
        _super.call(this, model, metadata, geometry, material, position, rotation, scale);
        this.addToWall = true;
        this.obstructInWallMoves = true;
      };

      /** */
      InWallItem.prototype.moveToPosition = function (vec3, intersection) {
        if (this.isValidPosition(vec3)) {
          this.changeWallEdge(intersection.object.edge);
          this.boundMove(vec3);
          this.position.copy(vec3);
          this.redrawWall();
        } else {
          return;
        }
      };

      /** */
      InWallItem.prototype.getWallOffset = function () {
        // fudge factor so it saves to the right wall
        return -this.currentWallEdge.offset + 0.5;
      };

      InWallItem.prototype.isValidPosition = function (vec3) {
        var cornersXZ = this.getCornersXZBIG('x', 'z', vec3);

        var objects = this.model.scene.getItems();
        for (let i = 0; i < objects.length; i++) {
          if (objects[i] === this || !objects[i].obstructInWallMoves) {
            continue;
          }

          if (!BP3D.Core.Utils.polygonOutsidePolygon(cornersXZ, objects[i].getCornersXZ('x', 'z')) ||
            !BP3D.Core.Utils.polygonOutsidePolygon(objects[i].getCornersXZ('x', 'z'), cornersXZ) ||
            BP3D.Core.Utils.polygonPolygonIntersect(cornersXZ, objects[i].getCornersXZ('x', 'z'))) {
            // // console.log('object not outside other objects  XY');
            return false;
          }


          // if (!BP3D.Core.Utils.polygonOutsidePolygon(cornersXZ, objects[i].getCorners('x', 'z')) ||
          //     BP3D.Core.Utils.polygonPolygonIntersect(cornersXZ, objects[i].getCorners('x', 'z'))) {
          //     // console.log('object not outside other objects  XZ');
          //     return false;
          // }
          // if (!BP3D.Core.Utils.polygonOutsidePolygon(cornersYZ, objects[i].getCornersYZ('y', 'z')) ||
          //     BP3D.Core.Utils.polygonPolygonIntersect(cornersYZ, objects[i].getCornersYZ('y', 'z'))) {
          //     // console.log('object not outside other objects YZ');
          //     return false;
          // }

        }

        return true;
      };
      return InWallItem;
    })(Items.WallItem);
    Items.InWallItem = InWallItem;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /** */
    var InWallFloorItem = (function (_super) {
      __extends(InWallFloorItem, _super);

      function InWallFloorItem(model, metadata, geometry, material, position, rotation, scale) {
        _super.call(this, model, metadata, geometry, material, position, rotation, scale);
        this.boundToFloor = true;
        this.obstructInWallMoves = true;
        this.obstructFloorMoves = true;
        this.addToWall = true;
      };
      return InWallFloorItem;
    })(Items.InWallItem);
    Items.InWallFloorItem = InWallFloorItem;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /** */
    var OnFloorItem = (function (_super) {
      __extends(OnFloorItem, _super);

      function OnFloorItem(model, metadata, geometry, material, position, rotation, scale) {
        _super.call(this, model, metadata, geometry, material, position, rotation, scale);
        this.obstructFloorMoves = false;
        this.receiveShadow = true;
        this.obstructOnFloorMoves = true;
      };
      return OnFloorItem;
    })(Items.FloorItem);
    Items.OnFloorItem = OnFloorItem;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /** */
    var WallFloorItem = (function (_super) {
      __extends(WallFloorItem, _super);

      function WallFloorItem(model, metadata, geometry, material, position, rotation, scale) {
        _super.call(this, model, metadata, geometry, material, position, rotation, scale);
        this.boundToFloor = true;
      };
      return WallFloorItem;
    })(Items.WallItem);
    Items.WallFloorItem = WallFloorItem;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Items;
  (function (Items) {
    /** Enumeration of item types. */
    var item_types = {
      1: Items.FloorItem,
      2: Items.WallItem,
      3: Items.InWallItem,
      7: Items.InWallFloorItem,
      8: Items.OnFloorItem,
      9: Items.WallFloorItem,
      10: Items.AnywhereItem,
      11: Items.CeilingItem,
    };
    /** Factory class to create items. */
    var Factory = (function () {
      function Factory() { }
      /** Gets the class for the specified item. */
      Factory.getClass = function (itemType) {
        return item_types[itemType];
      };
      return Factory;
    })();
    Items.Factory = Factory;
  })(Items = BP3D.Items || (BP3D.Items = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Model;
  (function (Model) {
    /**
     * The Scene is a manager of Items and also links to a ThreeJS scene.
     */
    var Scene = (function () {
      /**
       * Constructs a scene.
       * @param model The associated model.
       * @param textureDir The directory from which to load the textures.
       */
      function Scene(model, textureDir) {
        this.model = model;
        this.textureDir = textureDir;
        /** */
        this.items = [];
        /** */
        this.needsUpdate = false;
        /** */
        this.itemLoadingCallbacks = $.Callbacks();
        /** Item */
        this.itemLoadedCallbacks = $.Callbacks();
        /** Item */
        this.itemRemovedCallbacks = $.Callbacks();
        this.scene = new THREE.Scene();
        // init item loader
        this.loader = new GLTFLoader();
        // this.loader.crossOrigin = "";
        // this.loader.setCrossOrigin('use-credentials');
      }
      /** Adds a non-item, basically a mesh, to the scene.
       * @param mesh The mesh to be added.
       */
      Scene.prototype.add = function (mesh) {
        // // console.log("this is add mesh = ", mesh)
        this.scene.add(mesh);
      };
      /** Removes a non-item, basically a mesh, from the scene.
       * @param mesh The mesh to be removed.
       */
      Scene.prototype.remove = function (mesh) {
        this.scene.remove(mesh);
        BP3D.Core.Utils.removeValue(this.items, mesh);
      };
      /** Gets the scene.
       * @returns The scene.
       */
      Scene.prototype.getScene = function () {
        return this.scene;
      };
      /** Gets the items.
       * @returns The items.
       */
      Scene.prototype.getItems = function () {
        return this.items;
      };
      /** Gets the count of items.
       * @returns The count.
       */
      Scene.prototype.itemCount = function () {
        return this.items.length;
      };
      /** Removes all items. */
      Scene.prototype.clearItems = function () {
        // var items_copy = this.items;
        var scope = this;
        this.items.forEach(function (item) {
          scope.removeItem(item, true);
        });
        this.items = [];
      };
      /**
       * Removes an item.
       * @param item The item to be removed.
       * @param dontRemove If not set, also remove the item from the items list.
       */
      Scene.prototype.removeItem = function (item, dontRemove) {
        dontRemove = dontRemove || false;
        // use this for item meshes
        this.itemRemovedCallbacks.fire(item);
        item.removed();
        this.scene.remove(item);
        if (!dontRemove) {
          BP3D.Core.Utils.removeValue(this.items, item);
        }
      };
      /**
       * Creates an item and adds it to the scene.
       * @param itemType The type of the item given by an enumerator.
       * @param fileName The name of the file to load.
       * @param metadata TODO
       * @param position The initial position.
       * @param rotation The initial rotation around the y axis.
       * @param scale The initial scaling.
       * @param fixed True if fixed.
       */
      Scene.prototype.addItem = function (itemType, fileName, metadata, position, rotation, scale, fixed) {
        itemType = itemType || 1;
        var scope = this;

        var loaderCallback = function (geometry, materials) {
          // console.log("this is custrrr", geometry.morphAttributes, "tt", geometry)

          var item = new (BP3D.Items.Factory.getClass(itemType))(reducerBlueprint?.BP3DData.model, metadata, geometry, materials, position, rotation, scale);
          // console.log("this is custrrr 2")
          item.fixed = fixed || false;
          scope.items.push(item);
          scope.add(item);
          item.initObject(position);
          if (position !== null && position !== undefined) {
            item.setYPos(position.y)
          }
          scope.itemLoadedCallbacks.fire(item);
          THREE.Cache.add(fileName, {
            geometry: geometry,
            materials: materials
          });

        };

        function addToMaterials(materials, newmaterial) {
          for (var i = 0; i < materials.length; i++) {
            var mat = materials[i];
            if (mat.name === newmaterial.name) {
              return [materials, i];
            }
          }
          materials.push(newmaterial);
          return [materials, materials.length - 1];
        }
        var gltfCallback = function (gltfModel) {
          // // console.log(gltfModel)
          var newmaterials = [];
          var newGeometry = new THREE.BufferGeometry();
          gltfModel.scene.traverse(function (child) {
            if (child.isMesh) {
              var materialindices = [];
              if (child.material.length) {
                for (var k = 0; k < child.material.length; k++) {
                  var newItems = addToMaterials(newmaterials, child.material[k]);
                  newmaterials = newItems[0];
                  materialindices.push(newItems[1]);
                }
              } else {
                newItems = addToMaterials(newmaterials, child.material); //materials.push(child.material);
                newmaterials = newItems[0];
                materialindices.push(newItems[1]);
              }

              if (child.geometry.isBufferGeometry) {
                // console.log("this is child =>", child, newGeometry)
                // var tGeometry = new THREE.BufferGeometry().fromBufferGeometry(child.geometry);
                // tGeometry.faces.forEach((face) => {
                //     face.materialIndex = materialindices[face.materialIndex];
                // });
                // child.updateMatrix();
                newGeometry = mergeBufferGeometries([newGeometry, child.geometry])
                // newGeometry = child.geometry
                // newGeometry.merge(child.geometry, child.matrix);
              } else {
                child.geometry.faces.forEach((face) => {
                  face.materialIndex = materialindices[face.materialIndex];
                });
                child.updateMatrix();
                newGeometry.mergeMesh(child);
              }
            }
          });
          // console.log("this is new Geometry =>", newGeometry, gltfModel)

          loaderCallback(newGeometry, newmaterials);

          // loaderCallback(gltfModel.scene, newmaterials, true);
        };
        this.itemLoadingCallbacks.fire();
        if (THREE.Cache.get(fileName) === undefined) {
          try {
            this.loader.load(fileName, gltfCallback, null, null); // TODO_Ekki
          } catch (e) {
            // console.log(e);
            this.itemLoadedCallbacks.fire();
          }

        } else {
          loaderCallback(THREE.Cache.get(fileName).geometry, THREE.Cache.get(fileName).materials);
        }
        // this.loader.load(fileName, gltfCallback, null, null);
      };
      return Scene;
    })();
    Model.Scene = Scene;
  })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Model;
  (function (Model_1) {
    /**
     * A Model connects a Floorplan and a Scene.
     */
    var Model = (function () {
      /** Constructs a new model.
       * @param textureDir The directory containing the textures.
       */
      function Model(textureDir) {
        /** */
        this.roomLoadingCallbacks = $.Callbacks();
        /** */
        this.roomLoadedCallbacks = $.Callbacks();
        /** name */
        this.roomSavedCallbacks = $.Callbacks();
        /** success (bool), copy (bool) */
        this.roomDeletedCallbacks = $.Callbacks();
        this.floorplan = new Model_1.Floorplan();
        this.scene = new Model_1.Scene(this, textureDir);
      }
      Model.prototype.loadSerialized = function (json) {
        // TODO: better documentation on serialization format.
        // TODO: a much better serialization format.
        this.roomLoadingCallbacks.fire();
        var data = json;
        this.newRoom(data.floorplan, data.items);
        this.roomLoadedCallbacks.fire();
      };
      Model.prototype.exportSerialized = function () {
        var items_arr = [];
        var objects = this.scene.getItems();
        for (var i = 0; i < objects.length; i++) {
          var object = objects[i];
          items_arr[i] = {
            item_name: object.metadata.itemName,
            item_type: object.metadata.itemType,
            model_url: object.metadata.modelUrl,
            xpos: object.position.x,
            ypos: object.position.y,
            zpos: object.position.z,
            rotation: object.rotation.y,
            scale_x: object.scale.x,
            scale_y: object.scale.y,
            scale_z: object.scale.z,
            fixed: object.fixed
          };
        }
        var room = {
          floorplan: (this.floorplan.saveFloorplan()),
          items: items_arr
        };
        return JSON.stringify(room);
      };
      Model.prototype.newRoom = function (floorplan, items) {
        var _this = this;
        this.scene.clearItems();
        this.floorplan.loadFloorplan(floorplan);
        items.forEach(function (item) {
          var position = new THREE.Vector3(item.xpos, item.ypos, item.zpos);
          var metadata = {
            itemName: item.item_name,
            resizable: item.resizable,
            itemType: item.item_type,
            modelUrl: item.model_url
          };
          var scale = new THREE.Vector3(item.scale_x, item.scale_y, item.scale_z);
          _this.scene.addItem(item.item_type, item.model_url, metadata, position, item.rotation, scale, item.fixed);
        });
      };
      return Model;
    })();
    Model_1.Model = Model;
  })(Model = BP3D.Model || (BP3D.Model = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Floorplanner;
  (function (Floorplanner) {
    /** */
    Floorplanner.floorplannerModes = {
      MOVE: 0,
      DRAW: 1,
      DELETE: 2
    };
    // grid parameters
    var gridSpacing = 20; // pixels
    var gridWidth = 1;
    var gridColor = "#f1f1f1";
    // room config
    var roomColor = "#f9f9f9";
    // wall config
    var wallWidth = 5;  // 5
    var wallWidthHover = 7; // 7
    var wallColor = "#dddddd";
    var wallColorHover = "#475a6f";
    var isWallHover = false;
    var edgeColor = "#888888";
    var edgeColorHover = "#475a6f";
    var edgeWidth = 1; //1
    var deleteColor = "#ff0000";
    // corner config
    var cornerRadius = 0;
    var cornerRadiusHover = 7;
    var cornerColor = "#cccccc";
    var cornerColorHover = "#475a6f";
    /**
     * The View to be used by a Floorplanner to render in/interact with.
     */
    var FloorplannerView = (function () {
      /** */
      function FloorplannerView(floorplan, viewmodel, canvas) {
        // console.log(floorplan, viewmodel, canvas)
        this.floorplan = floorplan;
        this.viewmodel = viewmodel;
        this.canvas = canvas;
        this.canvasElement = document.getElementById(canvas);
        this.context = this.canvasElement.getContext('2d');
        var scope = this;
        $(window).resize(function () {
          scope.handleWindowResize();
        });
        this.handleWindowResize();

      }
      /** */
      FloorplannerView.prototype.handleWindowResize = function () {
        var canvasSel = $("#" + this.canvas);
        var parent = canvasSel.parent();
        canvasSel.height(parent.innerHeight());
        canvasSel.width(parent.innerWidth());
        this.canvasElement.height = parent.innerHeight();
        this.canvasElement.width = parent.innerWidth();

        this.draw();
      };
      /** */
      FloorplannerView.prototype.draw = function (callback = () => { }) {
        var _this = this;
        this.context.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.drawGrid();
        this.floorplan.getRooms().forEach(function (room) {
          _this.drawRoom(room);
        });
        // reducerBlueprint?.BP3DData?.globals?.setGlobal("selectedType", "3D") 
        // // console.log("this is he gloabs upd=>", reducerBlueprint?.BP3DData?.globals?.variables)   

        if (this.floorplan.getWalls().length == 5) {
          if (reducerBlueprint?.configuration2D?.partitionType == "vertical") {
            _this.drawLineIndicators(this.floorplan.getWalls()[4], this.floorplan.getWalls()[0], true, true)
            _this.drawLineIndicatorLabelsVertical(this.floorplan.getWalls()[4], this.floorplan.getWalls()[0], true)
            _this.drawLineIndicators(this.floorplan.getWalls()[4], this.floorplan.getWalls()[3], true, false)
            _this.drawLineIndicatorLabelsHorizontal(this.floorplan.getWalls()[4], this.floorplan.getWalls()[3], false)
          } else {
            _this.drawLineIndicators(this.floorplan.getWalls()[4], this.floorplan.getWalls()[3], false, true)
            _this.drawLineIndicatorLabelsHorizontal(this.floorplan.getWalls()[4], this.floorplan.getWalls()[3], true)

            _this.drawLineIndicators(this.floorplan.getWalls()[4], this.floorplan.getWalls()[0], false, false)
            _this.drawLineIndicatorLabelsVertical(this.floorplan.getWalls()[4], this.floorplan.getWalls()[0], false)
          }

        }

        this.floorplan.getWalls().forEach(function (wall) {
          _this.drawWall(wall);
        });
        this.floorplan.getCorners().forEach(function (corner) {
          _this.drawCorner(corner);
        });
        if (this.viewmodel.mode === Floorplanner.floorplannerModes.DRAW) {
          this.drawTarget(this.viewmodel.targetX, this.viewmodel.targetY, this.viewmodel.lastNode);
        }


        this.floorplan.getWalls().forEach(function (wall) {
          _this.drawWallLabels(wall);
        });




        // callback()

      };
      /** */
      FloorplannerView.prototype.drawWallLabels = function (wall) {
        // we'll just draw the shorter label... idk
        if (wall.backEdge && wall.frontEdge) {
          if (wall.backEdge.interiorDistance < wall.frontEdge.interiorDistance) {
            this.drawEdgeLabel(wall.backEdge);
          } else {
            this.drawEdgeLabel(wall.frontEdge);
          }
        } else if (wall.backEdge) {
          this.drawEdgeLabel(wall.backEdge);
        } else if (wall.frontEdge) {
          this.drawEdgeLabel(wall.frontEdge);
        }
      };


      FloorplannerView.prototype.drawLineIndicatorLabelsVertical = function (indicationWall, respectiveWall, isForCornerDrag) {
        let topPos = {}
        let bottomPos = {}
        let topLength = 0
        let bottomLength = 0
        const localStoragePartitionType = DataManager.getPartitionType()




        if (localStoragePartitionType == "floating" || (localStoragePartitionType == "single" && (reducerBlueprint?.configuration2D?.connectWith == "top")) || (localStoragePartitionType === "fixed")) {
          topPos = {
            x: respectiveWall.start.x - 100,
            y: (indicationWall.start.y + respectiveWall.start.y) / 2
          }
          bottomPos = {
            x: respectiveWall.end.x - 100,
            y: (indicationWall.end.y + respectiveWall.end.y + (isForCornerDrag ? 0 : 10)) / 2
          }

          topLength = Math.abs((respectiveWall.start.y) - indicationWall.start.y) - 5 + 0.05
          bottomLength = Math.abs((respectiveWall.end.y) - indicationWall.end.y) - 5 + 0.05

        } else if (localStoragePartitionType == "single" && (reducerBlueprint?.configuration2D?.connectWith == "left" || reducerBlueprint?.configuration2D?.connectWith == "right")) {
          topPos = {
            x: respectiveWall.start.x - 100,
            y: (indicationWall.start.y + respectiveWall.start.y) / 2
          }
          bottomPos = {
            x: respectiveWall.end.x - 100,
            y: (indicationWall.end.y + respectiveWall.end.y + (isForCornerDrag ? 0 : 10)) / 2
          }

          topLength = Math.abs((respectiveWall.start.y) - indicationWall.start.y) - 5 + 0.05
          bottomLength = Math.abs((respectiveWall.end.y) - indicationWall.end.y) - 5 + 0.05
        } else if ((localStoragePartitionType == "single" && (reducerBlueprint?.configuration2D?.connectWith == "bottom"))) {
          topPos = {
            x: respectiveWall.start.x - 100,
            y: (indicationWall.end.y + respectiveWall.start.y) / 2
          }
          bottomPos = {
            x: respectiveWall.end.x - 100,
            y: (indicationWall.end.y + respectiveWall.end.y + (isForCornerDrag ? 0 : 10)) / 2
          }

          topLength = Math.abs(Math.abs(respectiveWall.start.y) - Math.abs(indicationWall.end.y)) - 5 + 0.05
          bottomLength = Math.abs((respectiveWall.end.y) + indicationWall.end.y)
        }
        if (isForCornerDrag && localStoragePartitionType == "single") {
          topLength = topLength - 0.9
          bottomLength = bottomLength - 0.9
        }



        if (localStoragePartitionType == "floating" || !isForCornerDrag) {
          this.drawLineIndicatorLabelByPosition(topPos, topLength)
          this.drawLineIndicatorLabelByPosition(bottomPos, bottomLength)
          return;
        }

        if (localStoragePartitionType == "fixed") {
          return; // do not draw any label
        }
        if (localStoragePartitionType == "single") {
          if (reducerBlueprint?.configuration2D?.connectWith == "top") {
            this.drawLineIndicatorLabelByPosition(bottomPos, bottomLength)
          } else {
            this.drawLineIndicatorLabelByPosition(topPos, topLength)
          }
        }

      }


      FloorplannerView.prototype.drawLineIndicatorLabelsHorizontal = function (indicationWall, respectiveWall, isForCornerDrag) {
        let leftPos = {}
        let rightPos = {}
        let leftLength = 0
        let rightLength = 0
        if (isForCornerDrag) {
          leftPos = {
            x: (indicationWall.start.x + respectiveWall.end.x) / 2,
            y: respectiveWall.start.y - 100
          }

          rightPos = {
            x: (indicationWall.end.x + respectiveWall.start.x) / 2,
            y: respectiveWall.start.y - 100
          }

          rightLength = Math.abs(respectiveWall.start.x - indicationWall.end.x) - 5 + 0.05
          leftLength = Math.abs(respectiveWall.end.x - indicationWall.start.x) - 5 + 0.05
        } else {
          leftPos = {
            x: (indicationWall.start.x + respectiveWall.end.x) / 2,
            y: respectiveWall.start.y - 100
          }

          rightPos = {
            x: (indicationWall.start.x + 10 + respectiveWall.start.x) / 2,
            y: respectiveWall.start.y - 100
          }
          rightLength = Math.abs(respectiveWall.start.x - indicationWall.start.x) - 5 + 0.05
          leftLength = Math.abs(respectiveWall.end.x - indicationWall.start.x) - 5 + 0.05
        }
        const localStoragePartitionType = DataManager.getPartitionType()
        if (isForCornerDrag && localStoragePartitionType == "single") {
          rightLength = rightLength - 0.9
          leftLength = leftLength - 0.9
        }
        if (localStoragePartitionType == "single" && reducerBlueprint?.configuration2D?.connectWith == "right") {
          leftPos = {
            x: (indicationWall.end.x + respectiveWall.end.x) / 2,
            y: respectiveWall.start.y - 100
          }

          rightPos = {
            x: (indicationWall.end.x + 10 + respectiveWall.start.x) / 2,
            y: respectiveWall.start.y - 100
          }
          rightLength = Math.abs((respectiveWall.start.x - indicationWall.end.x))
          leftLength = Math.abs(respectiveWall.end.x - indicationWall.end.x) - 5 + 0.05 - 0.9
        }


        if (localStoragePartitionType == "floating" || !isForCornerDrag) {
          this.drawLineIndicatorLabelByPosition(rightPos, rightLength)
          this.drawLineIndicatorLabelByPosition(leftPos, leftLength)
        }

        if (localStoragePartitionType == "fixed") {
          return; // do not draw any label
        }
        if (localStoragePartitionType == "single") {
          if (reducerBlueprint?.configuration2D?.connectWith == "right") {
            this.drawLineIndicatorLabelByPosition(leftPos, leftLength)
          } else {
            this.drawLineIndicatorLabelByPosition(rightPos, rightLength)
          }
        }

      }

      /** */
      FloorplannerView.prototype.drawWall = function (wall) {
        var hover = (wall === this.viewmodel.activeWall);
        // console.log("this is updated value => ", reducerBlueprint?.configurationStep)
        var color = wallColor;
        if (hover && this.viewmodel.mode === Floorplanner.floorplannerModes.DELETE) {
          color = deleteColor;
        } else if (hover) {
          if (
            (reducerBlueprint?.configurationStep == 1 && ((this.viewmodel.activeWall == this.floorplan.getWalls()[0]) || (this.viewmodel.activeWall == this.floorplan.getWalls()[2])))|| 
            (reducerBlueprint?.configurationStep == 2 && this.viewmodel.activeWall == this.floorplan.getWalls()[4])
          ) {  // active color in step base
            color = wallColorHover;
            isWallHover = true
          } else {
            isWallHover = false
            hover = false
          }

        } else if (!hover && !this.viewmodel.activeWall) {
          isWallHover = false
        }
        // this.drawLine(this.viewmodel.convertX(wall.getStartX() + 100), this.viewmodel.convertY(wall.getStartY() + 100), this.viewmodel.convertX(wall.getEndX() + 100), this.viewmodel.convertY(wall.getEndY() + 100), 2, "black", false);
        this.drawLine(this.viewmodel.convertX(wall.getStartX()), this.viewmodel.convertY(wall.getStartY()), this.viewmodel.convertX(wall.getEndX()), this.viewmodel.convertY(wall.getEndY()), hover ? wallWidthHover : wallWidth, color, isWallHover);
        if (!hover && wall.frontEdge) {
          this.drawEdge(wall.frontEdge, hover);
        }
        if (!hover && wall.backEdge) {
          this.drawEdge(wall.backEdge, hover);
        }
      };
      /** */
      FloorplannerView.prototype.drawEdgeLabel = function (edge) {
        var pos = edge.interiorCenter();
        var length = edge.interiorDistance();
        if (length < 60) {
          // dont draw labels on walls this short
          return;
        }
        this.context.font = "normal 12px Arial";
        this.context.fillStyle = "#000000";
        this.context.textBaseline = "middle";
        this.context.textAlign = "center";
        this.context.strokeStyle = "#ffffff";
        this.context.lineWidth = 4;
        this.context.strokeText(BP3D.Core.Dimensioning.cmToMeasure(length), this.viewmodel.convertX(pos.x), this.viewmodel.convertY(pos.y));
        this.context.fillText(BP3D.Core.Dimensioning.cmToMeasure(length), this.viewmodel.convertX(pos.x), this.viewmodel.convertY(pos.y));
      };

      FloorplannerView.prototype.drawLineIndicatorLabelByPosition = function (pos, length) {
        if (length < 60) {
          // dont draw labels on walls this short
          // return;
        }
        this.context.font = "normal 12px Arial";
        this.context.fillStyle = "#000000";
        this.context.textBaseline = "middle";
        this.context.textAlign = "center";
        this.context.strokeStyle = "#ffffff";
        this.context.lineWidth = 4;
        this.context.strokeText(`${BP3D.Core.Dimensioning.cmToMeasure(length)} mm`, this.viewmodel.convertX(pos.x), this.viewmodel.convertY(pos.y));
        this.context.fillText(`${BP3D.Core.Dimensioning.cmToMeasure(length)} mm`, this.viewmodel.convertX(pos.x), this.viewmodel.convertY(pos.y));
      }

      /** */
      FloorplannerView.prototype.drawEdge = function (edge, hover) {
        var color = edgeColor;
        if (hover && this.viewmodel.mode === Floorplanner.floorplannerModes.DELETE) {
          color = deleteColor;
        } else if (hover) {
          color = edgeColorHover;
        }
        var corners = edge.corners();
        var scope = this;
        this.drawPolygon(BP3D.Core.Utils.map(corners, function (corner) {
          return scope.viewmodel.convertX(corner.x);
        }), BP3D.Core.Utils.map(corners, function (corner) {
          return scope.viewmodel.convertY(corner.y);
        }), false, null, true, color, edgeWidth);
      };
      /** */
      FloorplannerView.prototype.drawRoom = function (room) {
        var scope = this;
        this.drawPolygon(BP3D.Core.Utils.map(room.corners, function (corner) {
          return scope.viewmodel.convertX(corner.x);
        }), BP3D.Core.Utils.map(room.corners, function (corner) {
          return scope.viewmodel.convertY(corner.y);
        }), true, roomColor);
      };
      /**
       * 
       * @param {Wall} indicationWall 
       * @param {Wall} respectiveWall 
       * @param {Boolean} isVertical 
       * @param {Boolean} isForCornerDrag if it's corner drag then it will be for wall length, else for wall width(it's fixed)
       */
      FloorplannerView.prototype.drawLineIndicators = function (indicationWall, respectiveWall, isVertical, isForCornerDrag) {
        if (!respectiveWall && !indicationWall) return false
        if (isVertical) {
          if (isForCornerDrag) {
            this.drawLine(this.viewmodel.convertX(respectiveWall.getStartX() - 100), this.viewmodel.convertY(respectiveWall.getStartY()), this.viewmodel.convertX(respectiveWall.getEndX() - 100), this.viewmodel.convertY(respectiveWall.getEndY()), 3, "#cbaf87", false);
            this.drawLine(this.viewmodel.convertX(respectiveWall.getStartX() - 100), this.viewmodel.convertY(indicationWall.getStartY()), this.viewmodel.convertX(respectiveWall.getEndX() - 100), this.viewmodel.convertY(indicationWall.getEndY()), 6, "#475a6f", false);
          } else {
            this.drawLine(this.viewmodel.convertX(respectiveWall.getStartX()), this.viewmodel.convertY(respectiveWall.getStartY() - 100), this.viewmodel.convertX(respectiveWall.getEndX()), this.viewmodel.convertY(respectiveWall.getEndY() - 100), 3, "#cbaf87", false);
            this.drawLine(this.viewmodel.convertX(indicationWall.getStartX()), this.viewmodel.convertY(respectiveWall.getStartY() - 100), this.viewmodel.convertX(indicationWall.getStartX() + wallThicknessForAllScreens), this.viewmodel.convertY(respectiveWall.getEndY() - 100), 6, "#475a6f", false);
          }
        } else {
          if (isForCornerDrag) {
            this.drawLine(this.viewmodel.convertX(respectiveWall.getStartX()), this.viewmodel.convertY(respectiveWall.getStartY() - 100), this.viewmodel.convertX(respectiveWall.getEndX()), this.viewmodel.convertY(respectiveWall.getEndY() - 100), 3, "#cbaf87", false);
            this.drawLine(this.viewmodel.convertX(indicationWall.getStartX()), this.viewmodel.convertY(respectiveWall.getStartY() - 100), this.viewmodel.convertX(indicationWall.getEndX()), this.viewmodel.convertY(respectiveWall.getEndY() - 100), 6, "#475a6f", false);
          } else {
            this.drawLine(this.viewmodel.convertX(respectiveWall.getStartX() - 100), this.viewmodel.convertY(respectiveWall.getStartY()), this.viewmodel.convertX(respectiveWall.getEndX() - 100), this.viewmodel.convertY(respectiveWall.getEndY()), 3, "#cbaf87", false);
            this.drawLine(this.viewmodel.convertX(respectiveWall.getStartX() - 100), this.viewmodel.convertY(indicationWall.getStartY() + wallThicknessForAllScreens), this.viewmodel.convertX(respectiveWall.getEndX() - 100), this.viewmodel.convertY(indicationWall.getEndY()), 6, "#475a6f", false);
          }

        }

      }
      /** */
      FloorplannerView.prototype.drawCorner = function (corner) {
        var hover = (corner === this.viewmodel.activeCorner);
        var color = cornerColor;
        var isPartitionCornerHover = (this.viewmodel.activeCorner == this.floorplan.getWalls()[4].start || this.viewmodel.activeCorner == this.floorplan.getWalls()[4].end)
        if (hover) {
          if (reducerBlueprint?.configurationStep == 1 && isPartitionCornerHover) {
            hover = false
          } else if (reducerBlueprint?.configurationStep == 2 && !isPartitionCornerHover) {
            hover = false
          } else {
            color = cornerColorHover;
          }
        }
        const localStoragePartitionType = DataManager.getPartitionType()
        if (reducerBlueprint?.configurationStep == 2 && localStoragePartitionType == "floating") {
          if (corner == this.floorplan.getWalls()[4].start && reducerBlueprint?.configuration2D?.partionHeightAdjustFrom == "topToBottom") {
            hover = true
            color = cornerColorHover;
          } else if (corner == this.floorplan.getWalls()[4].end && reducerBlueprint?.configuration2D?.partionHeightAdjustFrom !== "topToBottom") {
            hover = true
            color = cornerColorHover;
          }
        }
        this.drawCircle(this.viewmodel.convertX(corner.x), this.viewmodel.convertY(corner.y), hover ? cornerRadiusHover : cornerRadius, color);
      };
      /** */
      FloorplannerView.prototype.drawTarget = function (x, y, lastNode) {
        this.drawCircle(this.viewmodel.convertX(x), this.viewmodel.convertY(y), cornerRadiusHover, cornerColorHover);
        if (this.viewmodel.lastNode) {
          this.drawLine(this.viewmodel.convertX(lastNode.x), this.viewmodel.convertY(lastNode.y), this.viewmodel.convertX(x), this.viewmodel.convertY(y), wallWidthHover, wallColorHover);
        }
      };
      /** */
      FloorplannerView.prototype.drawLine = function (startX, startY, endX, endY, width, color, isHover) {
        let hoverWall = this.viewmodel.activeWall
        let partitionWall = this.floorplan.getWalls()[4]
        let isActiveWallPartition = (hoverWall && partitionWall) ? (hoverWall == partitionWall) ? true : false : false
        if ((isHover && !isActiveWallPartition && (reducerBlueprint?.configurationStep == 1) || (isHover && isActiveWallPartition && reducerBlueprint?.configurationStep == 2))) {
          // // console.log("this is hover")
          this.canvasElement.style.cursor = 'pointer'

        } else {
          this.canvasElement.style.cursor = 'default'
        }
        this.context.beginPath();
        this.context.moveTo(startX, startY);
        this.context.lineTo(endX, endY);
        this.context.lineWidth = width;
        this.context.strokeStyle = color;
        this.context.stroke();
      };
      /** */
      FloorplannerView.prototype.drawPolygon = function (xArr, yArr, fill, fillColor, stroke, strokeColor, strokeWidth) {
        // fillColor is a hex string, i.e. #ff0000
        fill = fill || false;
        stroke = stroke || false;
        this.context.beginPath();
        this.context.moveTo(xArr[0], yArr[0]);
        for (var i = 1; i < xArr.length; i++) {
          this.context.lineTo(xArr[i], yArr[i]);
        }
        this.context.closePath();
        if (fill) {
          this.context.fillStyle = fillColor;
          this.context.fill();
        }
        if (stroke) {
          this.context.lineWidth = strokeWidth;
          this.context.strokeStyle = strokeColor;
          this.context.stroke();
        }
      };
      /** */
      FloorplannerView.prototype.drawCircle = function (centerX, centerY, radius, fillColor) {
        this.context.beginPath();
        this.context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        this.context.fillStyle = fillColor;
        this.context.fill();
      };
      /** returns n where -gridSize/2 < n <= gridSize/2  */
      FloorplannerView.prototype.calculateGridOffset = function (n) {
        if (n >= 0) {
          return (n + gridSpacing / 2.0) % gridSpacing - gridSpacing / 2.0;
        } else {
          return (n - gridSpacing / 2.0) % gridSpacing + gridSpacing / 2.0;
        }
      };
      /** */
      FloorplannerView.prototype.drawGrid = function () {
        var offsetX = this.calculateGridOffset(-this.viewmodel.originX);
        var offsetY = this.calculateGridOffset(-this.viewmodel.originY);
        var width = this.canvasElement.width;
        var height = this.canvasElement.height;
        for (var x = 0; x <= (width / gridSpacing); x++) {
          this.drawLine(gridSpacing * x + offsetX, 0, gridSpacing * x + offsetX, height, gridWidth, gridColor);
        }
        for (var y = 0; y <= (height / gridSpacing); y++) {
          this.drawLine(0, gridSpacing * y + offsetY, width, gridSpacing * y + offsetY, gridWidth, gridColor);
        }
      };
      return FloorplannerView;
    })();
    Floorplanner.FloorplannerView = FloorplannerView;
  })(Floorplanner = BP3D.Floorplanner || (BP3D.Floorplanner = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Floorplanner;
  (function (Floorplanner_1) {
    /** how much will we move a corner to make a wall axis aligned (cm) */
    var snapTolerance = 25;
    /**
     * The Floorplanner implements an interactive tool for creation of floorplans.
     */
    var Floorplanner = (function () {
      /** */
      function Floorplanner(canvas, floorplan) {
        this.floorplan = floorplan;
        /** */
        this.mode = 0;
        /** */
        this.activeWall = null;
        /** */
        this.activeCorner = null;
        /** */
        this.originX = 0;
        /** */
        this.originY = 0;
        /** drawing state */
        this.targetX = 0;
        /** drawing state */
        this.targetY = 0;
        /** drawing state */
        this.lastNode = null;
        /** */
        this.modeResetCallbacks = $.Callbacks();
        /** */
        this.mouseDown = false;
        /** */
        this.mouseMoved = false;
        /** */
        this.mouseMovedCount = 0;
        /** in ThreeJS coords */
        this.mouseX = 0;
        /** in ThreeJS coords */
        this.mouseY = 0;
        /** in ThreeJS coords */
        this.rawMouseX = 0;
        /** in ThreeJS coords */
        this.rawMouseY = 0;
        /** mouse position at last click */
        this.lastX = 0;
        /** mouse position at last click */
        this.lastY = 0;
        this.canvasElement = $("#" + canvas);
        this.view = new Floorplanner_1.FloorplannerView(this.floorplan, this, canvas);
        var cmPerFoot = 30.48;
        var pixelsPerFoot = 15.0;
        this.cmPerPixel = cmPerFoot * (1.0 / pixelsPerFoot);
        this.pixelsPerCm = 1.0 / this.cmPerPixel;
        this.wallWidth = parseInt(`${wallThicknessForAllScreens}.0`) * this.pixelsPerCm;
        // Initialization:
        this.setMode(Floorplanner_1.floorplannerModes.MOVE);
        var scope = this;
        this.canvasElement.mousedown(function () {
          scope.mousedown();
        });
        this.canvasElement.mousemove(function (event) {
          scope.mousemove(event);
        });
        this.canvasElement.mouseup(function () {
          scope.mouseup();
        });
        this.canvasElement.mouseleave(function () {
          scope.mouseleave();
        });
        /**
         * This is for mobile view touch events
         */

        // this.canvasElement.ready(function () {
        //     // Handler for .ready() called.
        //     // console.log("this is ready event")
        //     $("#floorplanner-canvas").css("transform", 'translate3d(' + 0.25 + 'px, ' + 0.5 + 'px,0) scale(' + 1.5 + ')').css('transition-duration', '300ms');
        // });

        this.canvasElement.on("touchstart", function (event) {
          event.preventDefault();
          event.stopPropagation();
          if (event.touches[0] !== undefined) {
            scope.updateLastXY(event)
            scope.touchMove(event);
            scope.touchStart();
          }
        });
        this.canvasElement.on("touchmove", function (event) {
          if (event.touches[0] !== undefined) {
            scope.touchMove(event);
          }
        });
        this.canvasElement.on("touchend", function (event) {
          scope.view.viewmodel.activeWall = null
          scope.activeCorner = null
          scope.view.viewmodel.mouseDown = false
          scope.view.draw()
          if (event.touches[0] !== undefined) {
            // scope.updateLastXY(event);
            scope.touchEnd();
            scope.touchMove(event);
          }
        });
        // this.canvasElement.on("mousewheel DOMMouseScroll", function (e) {
        //     e.preventDefault();
        //     // // console.log("this is the scale = ", e.screenX)
        //     var delta = e.delta || e.originalEvent.wheelDelta;
        //     var zoomOut;
        //     if (delta === undefined) {
        //         //we are on firefox
        //         delta = e.originalEvent.detail;
        //         zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        //         zoomOut = !zoomOut;
        //     } else {
        //         zoomOut = delta ? delta < 0 : e.originalEvent.deltaY > 0;
        //     }
        //     var touchX = e.type === 'touchend' ? e.changedTouches[0].pageX : e.pageX;
        //     var touchY = e.type === 'touchend' ? e.changedTouches[0].pageY : e.pageY;
        //     var scale = 1, translateX, translateY;

        //     if (zoomOut) {
        //         //we are zooming out
        //         //not interested in this yet
        //     } else {
        //         //we are zooming in
        //         scale = scale + 0.5;
        //         var dimensionMultiplier = scale - 0.5;//when image is scaled up offsetWidth/offsetHeight doesn't take this into account so we must multiply by scale to get the correct width/height
        //         var slideWidth = $("#floorplanner-canvas")[0].offsetWidth * dimensionMultiplier;
        //         var slideHeight = $("#floorplanner-canvas")[0].offsetHeight * dimensionMultiplier;

        //         var offsetX = $("#floorplanner-canvas").offset().left;//distance from the left of the viewport to the slide
        //         var offsetY = $("#floorplanner-canvas").offset().top;//distance from the top of the viewport to the slide
        //         var diffX = offsetX + slideWidth / 2 - touchX;//this is distance from the mouse to the center of the image
        //         var diffY = offsetY + slideHeight / 2 - touchY;//this is distance from the mouse to the center of the image
        //         // console.log("this is the scale = ", "diffX = ", diffX, "diffY = ", diffY, "e.pageX = ", e.pageX, "e.pageY = ", e.pageY, "e.clientX = ", e.clientX, "e.clientY = ", e.clientY, "e.screenX = ", e.screenX, "e.screenY = ", e.screenY)
        //         //how much to translate by x and y so that poin on image is alway under the mouse
        //         //we must multiply by 0.5 because the difference between previous and current scale is always 0.5
        //         translateX = ((diffX) * (0.5));
        //         translateY = ((diffY) * (0.5));

        //     }
        //     // console.log("this is all the fields are = ", translateX, translateY)
        //     $("#floorplanner-canvas").css("transform", 'translate3d(' + translateX + 'px, ' + translateY + 'px,0) scale(' + scale + ')').css('transition-duration', '300ms');

        // })

        $(document).keyup(function (e) {
          if (e.keyCode === 27) {
            scope.escapeKey();
          }
        });
        floorplan.roomLoadedCallbacks.add(function () {
          scope.reset();
        });
      }
      /** */
      Floorplanner.prototype.escapeKey = function () {
        this.setMode(Floorplanner_1.floorplannerModes.MOVE);
      };
      /** */
      Floorplanner.prototype.updateTarget = function () {
        if (this.mode === Floorplanner_1.floorplannerModes.DRAW && this.lastNode) {
          if (Math.abs(this.mouseX - this.lastNode.x) < snapTolerance) {
            this.targetX = this.lastNode.x;
          } else {
            this.targetX = this.mouseX;
          }
          if (Math.abs(this.mouseY - this.lastNode.y) < snapTolerance) {
            this.targetY = this.lastNode.y;
          } else {
            this.targetY = this.mouseY;
          }
        } else {
          this.targetX = this.mouseX;
          this.targetY = this.mouseY;
        }
        this.view.draw();
      };
      /** */
      Floorplanner.prototype.mousedown = function () {
        this.mouseDown = true;
        this.mouseMoved = false;
        this.mouseMovedCount = 0;
        this.lastX = this.rawMouseX;
        this.lastY = this.rawMouseY;
        // delete
        if (this.mode === Floorplanner_1.floorplannerModes.DELETE) {
          if (this.activeCorner) {
            this.activeCorner.removeAll();
          } else if (this.activeWall) {
            this.activeWall.remove();
          } else {
            this.setMode(Floorplanner_1.floorplannerModes.MOVE);
          }
        }
      };
      // Floorplanner.prototype.getWallType = function (event) {
      //     // console.log("event = ", event);
      // }
      /** */
      Floorplanner.prototype.mousemove = function (event) {
        this.mouseMovedCount++;
        this.mouseMoved = true;
        // update mouse
        this.rawMouseX = event.clientX;
        this.rawMouseY = event.clientY;
        // // console.log("this is hover event = ", this.canvasElement.offset().left)
        this.mouseX = (event.clientX - this.canvasElement.offset().left) * this.cmPerPixel + this.originX * this.cmPerPixel;
        this.mouseY = (event.clientY - this.canvasElement.offset().top) * this.cmPerPixel + this.originY * this.cmPerPixel;
        // update target (snapped position of actual mouse)
        if (this.mode === Floorplanner_1.floorplannerModes.DRAW || (this.mode === Floorplanner_1.floorplannerModes.MOVE && this.mouseDown)) {
          this.updateTarget();
        }
        // update object target
        if (this.mode !== Floorplanner_1.floorplannerModes.DRAW && !this.mouseDown) {
          var hoverCorner = this.floorplan.overlappedCorner(this.mouseX, this.mouseY);
          var hoverWall = this.floorplan.overlappedWall(this.mouseX, this.mouseY);
          var draw = false;
          if (hoverCorner !== this.activeCorner) {
            this.activeCorner = hoverCorner;
            draw = true;
          }
          // corner takes precendence
          if (this.activeCorner == null) {
            if (hoverWall !== this.activeWall) {
              this.activeWall = hoverWall;
              draw = true;
            }
          } else {
            this.activeWall = null;
          }
          if (draw) {
            this.view.draw();
          }
        }
        // panning
        if (this.mouseDown && !this.activeCorner && !this.activeWall) {
          // console.log("second if")
          this.originX += (this.lastX - this.rawMouseX);
          this.originY += (this.lastY - this.rawMouseY);
          this.lastX = this.rawMouseX;
          this.lastY = this.rawMouseY;
          this.view.draw();
        }
        // dragging

        if (this.mode === Floorplanner_1.floorplannerModes.MOVE && this.mouseDown && window.innerWidth > 500 && !reducerBlueprint.configuration2D.isZoomIn) {

          const localStoragePartitionType = DataManager.getPartitionType()
          if (this.activeCorner) { // drag corner


            let checkWallStartOrEnd = (this.activeCorner.wallEnds && this.activeCorner.wallEnds.length > 0) ? 'end' : 'start'
            const currentWalPosition = this.floorplan.getWallPosition(checkWallStartOrEnd == 'end' ? this.activeCorner.wallEnds[0] : this.activeCorner.wallStarts[0]);
            let moveX = (this.rawMouseX - this.lastX) * this.cmPerPixel // get drag value/pixes from point A to B of X axis
            let moveY = (this.rawMouseY - this.lastY) * this.cmPerPixel // get drag value/pixes from point A to B of Y axis
            if (localStoragePartitionType == "single" && reducerBlueprint?.configurationStep == 2 && currentWalPosition == "partition") {
              if (this.activeCorner == this.floorplan.getWalls()[4].start) return false;
              if (
                reducerBlueprint?.configuration2D?.partitionType == 'vertical'
              ) {
                let minLength = reducerBlueprint?.configuration2D?.minimumWallLength

                let isYNegetive = moveY < 0

                let oppWall = this.floorplan.getWalls()[reducerBlueprint?.configuration2D?.connectWith == "top" ? 1 : 3]

                let distanceFromOppWall = this.activeCorner.distanceFromWall(oppWall)
                let futuredistanceFromOppWall;
                let futureWallLength;
                if (reducerBlueprint?.configuration2D?.connectWith == "top") {
                  futuredistanceFromOppWall = distanceFromOppWall - moveY
                  futureWallLength = this.floorplan.getWalls()[4].getLength() + moveY
                } else {
                  futuredistanceFromOppWall = distanceFromOppWall + moveY
                  futureWallLength = this.floorplan.getWalls()[4].getLength() - moveY
                }
                if (futuredistanceFromOppWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                  if (reducerBlueprint?.configuration2D?.connectWith == "top") {
                    moveY = Math.abs(distanceFromOppWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                    if (isYNegetive) {
                      moveY = -moveY
                    }
                  } else {
                    moveY = Math.abs(distanceFromOppWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                    if (isYNegetive) {
                      moveY = -moveY
                    }
                  }
                }



                if (futureWallLength < minLength) {
                  moveY = this.floorplan.getWalls()[4].getLength() - minLength
                  if (isYNegetive) {
                    moveY = -moveY
                  }
                }
                this.activeCorner.relativeMove(0, moveY);
                this.activeCorner.snapToAxis(snapTolerance);
              } else if (reducerBlueprint?.configuration2D?.partitionType == 'horizontal') {

                let minLength = reducerBlueprint?.configuration2D?.minimumWallLength
                let isYNegetive = moveX < 0
                let oppWall = this.floorplan.getWalls()[reducerBlueprint?.configuration2D?.connectWith == "left" ? 2 : 0]

                let distanceFromOppWall = this.activeCorner.distanceFromWall(oppWall)
                let futuredistanceFromOppWall;
                let futureWallLength;
                if (reducerBlueprint?.configuration2D?.connectWith == "left") {
                  futuredistanceFromOppWall = distanceFromOppWall - moveX
                  futureWallLength = this.floorplan.getWalls()[4].getLength() + moveX
                } else {
                  futuredistanceFromOppWall = distanceFromOppWall + moveX
                  futureWallLength = this.floorplan.getWalls()[4].getLength() - moveX
                }
                if (futuredistanceFromOppWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                  if (reducerBlueprint?.configuration2D?.connectWith == "left") {
                    moveX = Math.abs(distanceFromOppWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                    if (isYNegetive) {
                      moveX = -moveX
                    }
                  } else {
                    moveX = Math.abs(distanceFromOppWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                    if (isYNegetive) {
                      moveX = -moveX
                    }
                  }
                }

                if (futureWallLength < minLength) {
                  moveX = this.floorplan.getWalls()[4].getLength() - minLength
                  if (isYNegetive) {
                    moveX = -moveX
                  }
                }


                this.activeCorner.relativeMove(moveX, 0);
                this.activeCorner.snapToAxis(snapTolerance);
              }
            } else if (localStoragePartitionType == "floating" && reducerBlueprint?.configurationStep == 2 && currentWalPosition == "partition") {
              // corner dragging

              let partitionWall = this.floorplan.getWalls()[4]
              if (reducerBlueprint?.configuration2D?.partitionType == 'horizontal') {

                if (this.activeCorner.x == partitionWall.start.x) { // if  active corner is the left corner
                  let distanceFromLeftWall = this.activeCorner.distanceFromWall(this.floorplan.getWalls()[0])
                  let distanceFromRightCorner = this.activeCorner.distanceFromCorner(this.floorplan.getWalls()[4].end)
                  let futureDistanceFromLeftWall = distanceFromLeftWall + moveX
                  let futureDistanceFromRightCorner = distanceFromRightCorner - moveX
                  if (futureDistanceFromLeftWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveX = -Math.abs(distanceFromLeftWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }

                  if (futureDistanceFromRightCorner < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveX = Math.abs(distanceFromRightCorner - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }
                }

                if (this.activeCorner.x == partitionWall.end.x) { // if  active corner is the right corner
                  let distanceFromRightWall = this.activeCorner.distanceFromWall(this.floorplan.getWalls()[2])
                  let distanceFromLeftCorner = this.activeCorner.distanceFromCorner(this.floorplan.getWalls()[4].start)
                  let futureDistanceFromRigthWall = distanceFromRightWall - moveX
                  let futureDistanceFromRightCorner = distanceFromLeftCorner + moveX
                  if (futureDistanceFromRigthWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveX = Math.abs(distanceFromRightWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }

                  if (futureDistanceFromRightCorner < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveX = -Math.abs(distanceFromLeftCorner - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }
                }

                this.activeCorner.relativeMove(moveX, 0);
                this.activeCorner.snapToAxis(snapTolerance);

              } else {
                if (this.activeCorner.y == partitionWall.end.y) { // if  active corner is the bottom corner
                  let distanceFromBottomWall = this.activeCorner.distanceFromWall(this.floorplan.getWalls()[1])
                  let distanceFromTopCorner = this.activeCorner.distanceFromCorner(this.floorplan.getWalls()[4].start)
                  let futureDistanceFromBottomWall = distanceFromBottomWall - moveY
                  let futureDistanceFromTopCorner = distanceFromTopCorner + moveY
                  if (futureDistanceFromBottomWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveY = Math.abs(distanceFromBottomWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }

                  if (futureDistanceFromTopCorner < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveY = -Math.abs(distanceFromTopCorner - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }
                }

                if (this.activeCorner.y == partitionWall.start.y) { // if  active corner is the top corner
                  let distanceFromTopWall = this.activeCorner.distanceFromWall(this.floorplan.getWalls()[3])
                  let distanceFromBottomCorner = this.activeCorner.distanceFromCorner(this.floorplan.getWalls()[4].end)
                  let futureDistanceFromTopWall = distanceFromTopWall + moveY
                  let futureDistanceFromTopCorner = distanceFromBottomCorner - moveY
                  if (futureDistanceFromTopWall < reducerBlueprint?.configuration2D?.minimumWallLength) { // max check
                    moveY = -Math.abs(distanceFromTopWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }

                  if (futureDistanceFromTopCorner < reducerBlueprint?.configuration2D?.minimumWallLength) { // min check
                    moveY = Math.abs(distanceFromBottomCorner - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }
                }



                this.activeCorner.relativeMove(0, moveY);

                this.activeCorner.snapToAxis(snapTolerance);
              }
            }

          } else if (this.activeWall) { // drag wall

            // let tt = this.floorplan.corners;
            // tt.length = 4;

            let isWallHorizontal = this.activeWall.start.y === this.activeWall.end.y;
            let moveX = (this.rawMouseX - this.lastX) * this.cmPerPixel // get drag value/pixes from point A to B of X axis
            let moveY = (this.rawMouseY - this.lastY) * this.cmPerPixel // get drag value/pixes from point A to B of Y axis
            const currentWalPosition = this.floorplan.getWallPosition(this.activeWall);
            if (currentWalPosition == "top" || currentWalPosition == "bottom") {
              return false
            }
            if (currentWalPosition == "partition" && reducerBlueprint?.configurationStep == 2) { // drag partition Wall in step 2
              let leftWall = this.floorplan.getWalls()[0]
              let rightWall = this.floorplan.getWalls()[2]
              let topWall = this.floorplan.getWalls()[3]
              let bottomWall = this.floorplan.getWalls()[1]
              if (reducerBlueprint?.configuration2D?.partitionType == 'vertical') {

                if ((this.activeWall.start.x + moveX) < (leftWall.start.x + reducerBlueprint?.configuration2D?.minimumWallLength)) {
                  moveX = -Math.abs((leftWall.start.x + reducerBlueprint?.configuration2D?.minimumWallLength) - (this.activeWall.start.x))
                } else if ((this.activeWall.start.x + moveX) > (rightWall.start.x - reducerBlueprint?.configuration2D?.minimumWallLength)) {
                  moveX = Math.abs((rightWall.start.x - reducerBlueprint?.configuration2D?.minimumWallLength) - (this.activeWall.start.x))
                };
                this.activeWall.relativeMove(moveX, 0);


              } else {
                if ((this.activeWall.start.y + moveY) < (topWall.start.y + reducerBlueprint?.configuration2D?.minimumWallLength)) {
                  moveY = -Math.abs((topWall.start.y + reducerBlueprint?.configuration2D?.minimumWallLength) - (this.activeWall.start.y))
                } else if ((this.activeWall.start.y + moveY) > (bottomWall.start.y - reducerBlueprint?.configuration2D?.minimumWallLength)) {
                  moveY = Math.abs((bottomWall.start.y - reducerBlueprint?.configuration2D?.minimumWallLength) - (this.activeWall.start.y))
                };
                this.activeWall.relativeMove(0, moveY);
              }

            } else if (currentWalPosition == "partition") {
              return false;
            }
            // This loop for dragg all wall except partition wall
            for (let i = 0; i < (this.floorplan.getWalls().length - 1); i++) {
              var wall = this.floorplan.getWalls()[i];

              if (this.activeWall == wall) continue; // if wall is active wall then continue loop;

              if (wall.start.x === wall.end.x && isWallHorizontal) { // if wall is horizontal
                if (((wall.getLength() - (moveY)) < minWallLengthWeb) && currentWalPosition === 'top') { // if wall is top wall, for minimum length of room
                  moveY = Math.abs(minWallLengthWeb - wall.getLength()) // if moveY is more than needed length, set moveY to manually  
                  break;

                } else if ((wall.getLength() + moveY) < minWallLengthWeb && currentWalPosition === 'bottom') { // if wall is bottom wall, for minimum length of room
                  moveY = -Math.abs(minWallLengthWeb - wall.getLength())
                  break;
                } else if ((wall.getLength() - moveY) > maxWallLengthWeb && currentWalPosition === "top") { // if wall is top wall, for maximum length of room
                  moveY = -(Math.abs(maxWallLengthWeb - wall.getLength()))
                  break;
                } else if ((wall.getLength() + moveY) > maxWallLengthWeb && currentWalPosition === "bottom") { // if wall is bottom wall, for maximum length of room
                  moveY = (Math.abs(maxWallLengthWeb - wall.getLength()))
                  break;
                }
              } else if (wall.start.y === wall.end.y && !isWallHorizontal) { // if wall is vertial

                if ((wall.getLength() - (moveX)) < minWallLengthWeb && currentWalPosition === 'left') { // if wall is left wall
                  moveX = Math.abs(minWallLengthWeb - wall.getLength())
                  break;
                } else if ((wall.getLength() + moveX) < minWallLengthWeb && currentWalPosition === 'right') { // if wall is right wall
                  moveX = -Math.abs(minWallLengthWeb - wall.getLength())
                  break;
                } else if ((wall.getLength() - moveX) > maxWallLengthWeb && currentWalPosition === "left") { // if wall is top wall, for maximum length of room
                  moveX = -(Math.abs(maxWallLengthWeb - wall.getLength()))
                  break;
                } else if ((wall.getLength() + moveX) > maxWallLengthWeb && currentWalPosition === "right") { // if wall is bottom wall, for maximum length of room
                  moveX = (Math.abs(maxWallLengthWeb - wall.getLength()))
                  break;
                }
              }
            }
            // console.log("this is the difference =>", this.floorplan?.getWalls()[4]?.end?.distanceFromWall(this.floorplan.getWalls()[1]), this.floorplan?.getWalls()[4]?.start?.distanceFromWall(this.floorplan.getWalls()[3]))
            if (this.activeWall.start.x == this.activeWall.end.x && reducerBlueprint?.configurationStep == 1) { // left or right wall

              // move current wall
              this.activeWall.relativeMove(moveX, wallThicknessForAllScreens);

              // move partition wall x-axis
              let leftWall = this.floorplan.getWalls()[0]
              let rightWall = this.floorplan.getWalls()[2]
              if (reducerBlueprint?.configuration2D?.partitionType == 'vertical') {
                this.floorplan.getWalls()[4].start.relativeMove(moveX / 2, 0)
                this.floorplan.getWalls()[4].end.relativeMove(moveX / 2, 0)
              } else {
                if (currentWalPosition == 'right') {
                  if (reducerBlueprint?.configuration2D?.connectWith == 'left') {
                    this.floorplan.getWalls()[4].end.relativeMove(moveX, 0)
                  } else {
                    this.floorplan.getWalls()[4].start.relativeMove(moveX, 0)
                  }
                } else {
                  if (reducerBlueprint?.configuration2D?.connectWith == 'left') {
                    this.floorplan.getWalls()[4].start.relativeMove(moveX, 0)
                  } else {
                    this.floorplan.getWalls()[4].end.relativeMove(moveX, 0)
                  }
                }
              }
            } else if (this.activeWall.start.y == this.activeWall.end.y && reducerBlueprint?.configurationStep == 1) { // top or bottom wall
              // move current wall

              this.activeWall.relativeMove(wallThicknessForAllScreens, moveY);


              // move partition wall y-axis
              if (reducerBlueprint?.configuration2D?.partitionType == 'vertical') {
                if (currentWalPosition == "top") {
                  if (reducerBlueprint?.configuration2D?.connectWith == 'bottom') {
                    this.floorplan.getWalls()[4].end.relativeMove(0, moveY)
                  } else {
                    this.floorplan.getWalls()[4].start.relativeMove(0, moveY)
                  }
                } else {
                  if (reducerBlueprint?.configuration2D?.connectWith == 'bottom') {
                    this.floorplan.getWalls()[4].start.relativeMove(0, moveY)
                  } else {
                    this.floorplan.getWalls()[4].end.relativeMove(0, moveY)
                  }
                }
              } else {
                this.floorplan.getWalls()[4].start.relativeMove(0, moveY / 2)
                this.floorplan.getWalls()[4].end.relativeMove(0, moveY / 2)
              }
            } else if (reducerBlueprint?.configurationStep == 1) {
              this.activeWall.relativeMove((this.rawMouseX - this.lastX) * this.cmPerPixel, (this.rawMouseY - this.lastY) * this.cmPerPixel);
            }
            this.activeWall.snapToAxis(snapTolerance);
          }
          this.lastX = this.rawMouseX;
          this.lastY = this.rawMouseY;
          // console.log("cna=hange = = = = ", this.floorplan.getWalls()[1].getLength());
          this.view.draw();
          dispatch(updateConfigurationStates(this.floorplan.getWalls()[1].getLength() - wallThicknessForAllScreens, 'roomBreath'))
          dispatch(updateConfigurationStates(this.floorplan.getWalls()[0].getLength() - wallThicknessForAllScreens, 'roomLength'))
          dispatch(updateConfigurationStates(this.floorplan.getWalls()[4].getLength(), 'partitionWallLength'))

          if (this.activeCorner && localStoragePartitionType == "floating") { // drag topcorner
            this.floorplan.updateMaxLenghtOfPartitionWall()
            // let maxLengthFromTop = 0
            // let maxLengthFromBottom = 0
            // let partitionWall = this.floorplan.getWalls()[4]
            // let distanceOfTopCornerFromBottomWall = partitionWall.end.distanceFromWall(this.floorplan.getWalls()[1]) - 64.06400000000002
            // maxLengthFromTop = distanceOfTopCornerFromBottomWall + partitionWall.getLength()

            // let distanceOfBottomCornerFromTopWall = partitionWall.start.distanceFromWall(this.floorplan.getWalls()[3]) - 64.06400000000002
            // maxLengthFromBottom = distanceOfBottomCornerFromTopWall + partitionWall.getLength()
            // dispatch(updateConfigurationStates(maxLengthFromBottom, 'maxValueOfLengthTopFloating'))
            // dispatch(updateConfigurationStates(maxLengthFromTop, 'maxValueOfLengthBottomFloating'))
          }
        }
      };
      /** */
      Floorplanner.prototype.mouseup = function () {
        var drawMode = 'single'
        this.mouseDown = false;
        var isNewWallCrossingOldWall = false;
        // drawing
        if (this.mode === Floorplanner_1.floorplannerModes.DRAW && (this.mouseMovedCount === 1 || this.mouseMovedCount === 0)) {
          var corner = this.floorplan.newCorner(this.targetX, this.targetY);
          // console.log("lastNode = ", this.lastNode);
          // check walls
          var isOnWall = false;
          for (let i = 0; i < this.floorplan.getWalls().length; i++) {
            var wall = this.floorplan.getWalls()[i];
            // console.log("distance = ", corner.distanceFromWall(wall))
            if (this.lastNode) {
              isNewWallCrossingOldWall = isNewWallCrossingOldWall ? isNewWallCrossingOldWall : this.intersects(wall.start.x, wall.start.y, wall.end.x, wall.end.y, this.lastNode.x, this.lastNode.y, corner.x, corner.y)
              // console.log(isNewWallCrossingOldWall)
            }

            isOnWall = corner.distanceFromWall(wall) < wallThicknessForAllScreens && !corner.isWallConnected(wall);
            if (isOnWall) break;
          }

          let tt = this.floorplan.corners;
          tt.length = 4;


          let arrX = tt.map((i, k) => k < 4 && i.x).sort()
          let arrY = tt.map((i, k) => k < 4 && i.y).sort()

          if ((this.targetX >= arrX[0] && this.targetX <= arrX[arrX.length - 1]) && (this.targetY >= arrY[0] && this.targetY <= arrY[arrY.length - 1])) {
            switch (drawMode) {
              case 'fixed':
                if (isOnWall && !isNewWallCrossingOldWall) {

                  if (this.lastNode != null) {
                    this.floorplan.newWall(this.lastNode, corner);
                  }
                  if (this.lastNode != null) {
                    // console.log("LEFT")
                    this.setMode(Floorplanner_1.floorplannerModes.MOVE);
                  }
                  this.lastNode = corner;
                } else {
                  this.floorplan.removeCorner(corner)
                }
                break;

              case 'float':
                if (!isOnWall && !isNewWallCrossingOldWall) {
                  // console.log("test")
                  if (this.lastNode != null) {
                    this.floorplan.newWall(this.lastNode, corner);
                  }
                  if (this.lastNode != null) {
                    // console.log("LEFT")
                    this.setMode(Floorplanner_1.floorplannerModes.MOVE);
                  }
                  this.lastNode = corner;
                } else {
                  this.floorplan.removeCorner(corner)
                }

                break;

              case 'single':
                var isLastNodeOnWall = false;
                if (this.lastNode && !isNewWallCrossingOldWall) {
                  for (let i = 0; i < this.floorplan.getWalls().length; i++) {
                    var wall = this.floorplan.getWalls()[i];

                    isLastNodeOnWall = this.lastNode.distanceFromWall(wall) < wallThicknessForAllScreens && !this.lastNode.isWallConnected(wall);
                    if (isLastNodeOnWall) break;
                  }
                  if ((isLastNodeOnWall && !isOnWall) || (!isLastNodeOnWall && isOnWall)) {
                    // console.log("test")
                    if (this.lastNode != null) {
                      this.floorplan.newWall(this.lastNode, corner);
                    }
                    if (this.lastNode != null) {
                      // console.log("LEFT")
                      this.setMode(Floorplanner_1.floorplannerModes.MOVE);
                    }
                    this.lastNode = corner;
                  }
                  else {
                    this.floorplan.removeCorner(corner)
                  }
                  isNewWallCrossingOldWall = false
                } else if (!isNewWallCrossingOldWall) {
                  // console.log("test")
                  if (this.lastNode != null) {
                    this.floorplan.newWall(this.lastNode, corner);
                  }
                  if (this.lastNode != null) {
                    // console.log("LEFT")
                    this.setMode(Floorplanner_1.floorplannerModes.MOVE);
                  }
                  this.lastNode = corner;
                  isNewWallCrossingOldWall = false
                }

                break;

              default:
                break;
            }
          }

        }
      };
      /** */
      Floorplanner.prototype.mouseleave = function () {
        this.mouseDown = false;
        //scope.setMode(scope.modes.MOVE);
      };
      /**
       * This is for mobile view touch events
      */
      Floorplanner.prototype.touchStart = function () {
        // // console.log("Touch Start");
        this.mouseDown = true;
        this.mouseMoved = false;
        this.mouseMovedCount = 0;
        this.lastX = this.rawMouseX;
        this.lastY = this.rawMouseY;
        // delete
        if (this.mode === Floorplanner_1.floorplannerModes.DELETE) {
          if (this.activeCorner) {
            this.activeCorner.removeAll();
          } else if (this.activeWall) {
            this.activeWall.remove();
          } else {
            this.setMode(Floorplanner_1.floorplannerModes.MOVE);
          }
        }
      };


      Floorplanner.prototype.updateLastXY = function (event) {
        this.rawMouseX = event.touches[0].clientX;
        this.rawMouseY = event.touches[0].clientY;
        this.lastX = this.rawMouseX;
        this.lastY = this.rawMouseY;
      }

      /** */
      Floorplanner.prototype.touchMove = function (event) {

        this.mouseMovedCount++;
        this.mouseMoved = true;
        // // console.log(event)
        // update mouse
        this.rawMouseX = event.touches[0].clientX;
        this.rawMouseY = event.touches[0].clientY;
        this.mouseX = (this.rawMouseX - this.canvasElement.offset().left) * this.cmPerPixel + this.originX * this.cmPerPixel;
        this.mouseY = (this.rawMouseY - this.canvasElement.offset().top) * this.cmPerPixel + this.originY * this.cmPerPixel;
        // update target (snapped position of actual mouse)
        if (this.mode === Floorplanner_1.floorplannerModes.DRAW || (this.mode === Floorplanner_1.floorplannerModes.MOVE && this.mouseDown)) {
          this.updateTarget();
        }
        // update object target
        if (this.mode !== Floorplanner_1.floorplannerModes.DRAW && !this.mouseDown) {
          var hoverCorner = this.floorplan.overlappedCorner(this.mouseX, this.mouseY, 20);
          var hoverWall = this.floorplan.overlappedWall(this.mouseX, this.mouseY, 20);
          var draw = false;
          if (hoverCorner !== this.activeCorner) {
            this.activeCorner = hoverCorner;
            draw = true;
          }
          // corner takes precendence
          if (this.activeCorner == null) {
            if (hoverWall !== this.activeWall) {
              this.activeWall = hoverWall;
              draw = true;
            }
          } else {
            this.activeWall = null;
          }
          if (draw) {
            this.view.draw();
          }
        }
        // panning
        if (this.mouseDown && !this.activeCorner && !this.activeWall) {
          this.originX += (this.lastX - this.rawMouseX);
          this.originY += (this.lastY - this.rawMouseY);
          this.lastX = this.rawMouseX;
          this.lastY = this.rawMouseY;
          // // console.log("panning")
          this.view.draw();
        }
        // dragging
        if (this.mode === Floorplanner_1.floorplannerModes.MOVE && this.mouseDown && window.innerWidth <= 500 && !reducerBlueprint.configuration2D.isZoomIn) {

          const localStoragePartitionType = DataManager.getPartitionType()
          if (this.activeCorner) { // drag corner

            let checkWallStartOrEnd = (this.activeCorner.wallEnds && this.activeCorner.wallEnds.length > 0) ? 'end' : 'start'
            const currentWalPosition = this.floorplan.getWallPosition(checkWallStartOrEnd == 'end' ? this.activeCorner.wallEnds[0] : this.activeCorner.wallStarts[0]);
            let moveX = (this.rawMouseX - this.lastX) * this.cmPerPixel // get drag value/pixes from point A to B of X axis
            let moveY = (this.rawMouseY - this.lastY) * this.cmPerPixel // get drag value/pixes from point A to B of Y axis
            if (localStoragePartitionType == "single" && reducerBlueprint?.configurationStep == 2 && currentWalPosition == "partition") {
              if (this.activeCorner == this.floorplan.getWalls()[4].start) return false;
              if (
                reducerBlueprint?.configuration2D?.partitionType == 'vertical'
              ) {
                let minLength = reducerBlueprint?.configuration2D?.minimumWallLength

                let isYNegetive = moveY < 0

                let oppWall = this.floorplan.getWalls()[reducerBlueprint?.configuration2D?.connectWith == "top" ? 1 : 3]

                let distanceFromOppWall = this.activeCorner.distanceFromWall(oppWall)
                let futuredistanceFromOppWall;
                let futureWallLength;
                if (reducerBlueprint?.configuration2D?.connectWith == "top") {
                  futuredistanceFromOppWall = Math.abs(distanceFromOppWall - moveY)
                  futureWallLength = this.floorplan.getWalls()[4].getLength() + moveY
                } else {
                  futuredistanceFromOppWall = Math.abs(distanceFromOppWall + moveY)
                  futureWallLength = this.floorplan.getWalls()[4].getLength() - moveY
                }
                if (futuredistanceFromOppWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                  // console.log("THIS IS MOVE Y BEFORE =>", moveY)
                  if (reducerBlueprint?.configuration2D?.connectWith == "top") {
                    moveY = Math.abs(distanceFromOppWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                    if (isYNegetive) {
                      moveY = -moveY
                    }
                  } else {
                    moveY = Math.abs(distanceFromOppWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                    if (isYNegetive) {
                      moveY = -moveY
                    }
                  }
                }
                // console.log("THIS IS FINAL MOVEY =>", moveY)


                if (futureWallLength < minLength) {
                  moveY = this.floorplan.getWalls()[4].getLength() - minLength
                  if (isYNegetive) {
                    moveY = -moveY
                  }
                }
                this.activeCorner.relativeMove(0, moveY);
                this.activeCorner.snapToAxis(snapTolerance);
              } else if (reducerBlueprint?.configuration2D?.partitionType == 'horizontal') {

                let minLength = reducerBlueprint?.configuration2D?.minimumWallLength
                let isYNegetive = moveX < 0
                let oppWall = this.floorplan.getWalls()[reducerBlueprint?.configuration2D?.connectWith == "left" ? 2 : 0]

                let distanceFromOppWall = this.activeCorner.distanceFromWall(oppWall)
                let futuredistanceFromOppWall;
                let futureWallLength;
                if (reducerBlueprint?.configuration2D?.connectWith == "left") {
                  futuredistanceFromOppWall = Math.abs(distanceFromOppWall - moveX)
                  futureWallLength = this.floorplan.getWalls()[4].getLength() + moveX
                } else {
                  futuredistanceFromOppWall = Math.abs(distanceFromOppWall + moveX)
                  futureWallLength = this.floorplan.getWalls()[4].getLength() - moveX
                }
                if (futuredistanceFromOppWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                  if (reducerBlueprint?.configuration2D?.connectWith == "left") {
                    moveX = Math.abs(distanceFromOppWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                    if (isYNegetive) {
                      moveX = -moveX
                    }
                  } else {
                    moveX = Math.abs(distanceFromOppWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                    if (isYNegetive) {
                      moveX = -moveX
                    }
                  }
                }

                if (futureWallLength < minLength) {
                  moveX = this.floorplan.getWalls()[4].getLength() - minLength
                  if (isYNegetive) {
                    moveX = -moveX
                  }
                }


                this.activeCorner.relativeMove(moveX, 0);
                this.activeCorner.snapToAxis(snapTolerance);
              }
            } else if (localStoragePartitionType == "floating" && reducerBlueprint?.configurationStep == 2 && currentWalPosition == "partition") {
              // corner dragging

              let partitionWall = this.floorplan.getWalls()[4]
              if (reducerBlueprint?.configuration2D?.partitionType == 'horizontal') {

                if (this.activeCorner.x == partitionWall.start.x) { // if  active corner is the left corner
                  let distanceFromLeftWall = this.activeCorner.distanceFromWall(this.floorplan.getWalls()[0])
                  let distanceFromRightCorner = this.activeCorner.distanceFromCorner(this.floorplan.getWalls()[4].end)
                  let futureDistanceFromLeftWall = distanceFromLeftWall + moveX
                  let futureDistanceFromRightCorner = distanceFromRightCorner - moveX
                  if (futureDistanceFromLeftWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveX = -Math.abs(distanceFromLeftWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }

                  if (futureDistanceFromRightCorner < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveX = Math.abs(distanceFromRightCorner - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }
                }

                if (this.activeCorner.x == partitionWall.end.x) { // if  active corner is the right corner
                  let distanceFromRightWall = this.activeCorner.distanceFromWall(this.floorplan.getWalls()[2])
                  let distanceFromLeftCorner = this.activeCorner.distanceFromCorner(this.floorplan.getWalls()[4].start)
                  let futureDistanceFromRigthWall = distanceFromRightWall - moveX
                  let futureDistanceFromRightCorner = distanceFromLeftCorner + moveX
                  if (futureDistanceFromRigthWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveX = Math.abs(distanceFromRightWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }

                  if (futureDistanceFromRightCorner < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveX = -Math.abs(distanceFromLeftCorner - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }
                }

                this.activeCorner.relativeMove(moveX, 0);
                this.activeCorner.snapToAxis(snapTolerance);

              } else {
                if (this.activeCorner.y == partitionWall.end.y) { // if  active corner is the bottom corner
                  let distanceFromBottomWall = this.activeCorner.distanceFromWall(this.floorplan.getWalls()[1])
                  let distanceFromTopCorner = this.activeCorner.distanceFromCorner(this.floorplan.getWalls()[4].start)
                  let futureDistanceFromBottomWall = distanceFromBottomWall - moveY
                  let futureDistanceFromTopCorner = distanceFromTopCorner + moveY
                  if (futureDistanceFromBottomWall < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveY = Math.abs(distanceFromBottomWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }

                  if (futureDistanceFromTopCorner < reducerBlueprint?.configuration2D?.minimumWallLength) {
                    moveY = -Math.abs(distanceFromTopCorner - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }
                }

                if (this.activeCorner.y == partitionWall.start.y) { // if  active corner is the top corner
                  let distanceFromTopWall = this.activeCorner.distanceFromWall(this.floorplan.getWalls()[3])
                  let distanceFromBottomCorner = this.activeCorner.distanceFromCorner(this.floorplan.getWalls()[4].end)
                  let futureDistanceFromTopWall = distanceFromTopWall + moveY
                  let futureDistanceFromTopCorner = distanceFromBottomCorner - moveY
                  if (futureDistanceFromTopWall < reducerBlueprint?.configuration2D?.minimumWallLength) { // max check
                    moveY = -Math.abs(distanceFromTopWall - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }

                  if (futureDistanceFromTopCorner < reducerBlueprint?.configuration2D?.minimumWallLength) { // min check
                    moveY = Math.abs(distanceFromBottomCorner - reducerBlueprint?.configuration2D?.minimumWallLength)
                  }
                }



                this.activeCorner.relativeMove(0, moveY);

                this.activeCorner.snapToAxis(snapTolerance);
              }
            }

          } else if (this.activeWall) { // drag wall


            // let tt = this.floorplan.corners;
            // tt.length = 4;


            let isWallHorizontal = this.activeWall.start.y === this.activeWall.end.y;
            let moveX = (this.rawMouseX - this.lastX) * this.cmPerPixel // get drag value/pixes from point A to B of X axis
            let moveY = (this.rawMouseY - this.lastY) * this.cmPerPixel // get drag value/pixes from point A to B of Y axis
            const currentWalPosition = this.floorplan.getWallPosition(this.activeWall);
            if (currentWalPosition == "partition" && reducerBlueprint?.configurationStep == 2) { // drag partition Wall in step 2
              let leftWall = this.floorplan.getWalls()[0]
              let rightWall = this.floorplan.getWalls()[2]
              let topWall = this.floorplan.getWalls()[3]
              let bottomWall = this.floorplan.getWalls()[1]
              if (reducerBlueprint?.configuration2D?.partitionType == 'vertical') {

                if ((this.activeWall.start.x + moveX) < (leftWall.start.x + reducerBlueprint?.configuration2D?.minimumWallLength)) {
                  moveX = -Math.abs((leftWall.start.x + reducerBlueprint?.configuration2D?.minimumWallLength) - (this.activeWall.start.x))
                } else if ((this.activeWall.start.x + moveX) > (rightWall.start.x - reducerBlueprint?.configuration2D?.minimumWallLength)) {
                  moveX = Math.abs((rightWall.start.x - reducerBlueprint?.configuration2D?.minimumWallLength) - (this.activeWall.start.x))
                };
                this.activeWall.relativeMove(moveX, 0);


              } else {
                if ((this.activeWall.start.y + moveY) < (topWall.start.y + reducerBlueprint?.configuration2D?.minimumWallLength)) {
                  moveY = -Math.abs((topWall.start.y + reducerBlueprint?.configuration2D?.minimumWallLength) - (this.activeWall.start.y))
                } else if ((this.activeWall.start.y + moveY) > (bottomWall.start.y - reducerBlueprint?.configuration2D?.minimumWallLength)) {
                  moveY = Math.abs((bottomWall.start.y - reducerBlueprint?.configuration2D?.minimumWallLength) - (this.activeWall.start.y))
                };
                this.activeWall.relativeMove(0, moveY);
              }

            } else if (currentWalPosition == "partition") {
              return false;
            }
            // This loop for dragg all wall except partition wall
            for (let i = 0; i < (this.floorplan.getWalls().length - 1); i++) {
              var wall = this.floorplan.getWalls()[i];

              if (this.activeWall == wall) continue; // if wall is active wall then continue loop;

              if (wall.start.x === wall.end.x && isWallHorizontal) { // if wall is horizontal

                if (((wall.getLength() - (moveY)) < minWallLengthPhone) && currentWalPosition === 'top') { // if wall is top wall, for minimum length of room
                  moveY = Math.abs(minWallLengthPhone - wall.getLength()) // if moveY is more than needed length, set moveY to manually  
                  break;

                } else if ((wall.getLength() + moveY) < minWallLengthPhone && currentWalPosition === 'bottom') { // if wall is bottom wall, for minimum length of room
                  moveY = -Math.abs(minWallLengthPhone - wall.getLength())
                  break;
                } else if ((wall.getLength() - moveY) > maxWallLengthPhone && currentWalPosition === "top") { // if wall is top wall, for maximum length of room
                  moveY = -(Math.abs(maxWallLengthPhone - wall.getLength()))
                  break;
                } else if ((wall.getLength() + moveY) > maxWallLengthPhone && currentWalPosition === "bottom") { // if wall is bottom wall, for maximum length of room
                  moveY = (Math.abs(maxWallLengthPhone - wall.getLength()))
                  break;
                }
              } else if (wall.start.y === wall.end.y && !isWallHorizontal) { // if wall is vertial
                if ((wall.getLength() - (moveX)) < minWallLengthPhone && currentWalPosition === 'left') { // if wall is left wall
                  moveX = Math.abs(minWallLengthPhone - wall.getLength())
                  break;
                } else if ((wall.getLength() + moveX) < minWallLengthPhone && currentWalPosition === 'right') { // if wall is right wall
                  moveX = -Math.abs(minWallLengthPhone - wall.getLength())
                  break;
                } else if ((wall.getLength() - moveX) > maxWallLengthPhone && currentWalPosition === "left") { // if wall is top wall, for maximum length of room
                  moveX = -(Math.abs(maxWallLengthPhone - wall.getLength()))
                  break;
                } else if ((wall.getLength() + moveX) > maxWallLengthPhone && currentWalPosition === "right") { // if wall is bottom wall, for maximum length of room
                  moveX = (Math.abs(maxWallLengthPhone - wall.getLength()))
                  break;
                }
              }
            }
            if (this.activeWall.start.x == this.activeWall.end.x && reducerBlueprint?.configurationStep == 1) { // left or right wall
              // move current wall
              this.activeWall.relativeMove(moveX, wallThicknessForAllScreens);

              // move partition wall x-axis
              let leftWall = this.floorplan.getWalls()[0]
              let rightWall = this.floorplan.getWalls()[2]
              if (reducerBlueprint?.configuration2D?.partitionType == 'vertical') {
                this.floorplan.getWalls()[4].start.relativeMove(moveX / 2, 0)
                this.floorplan.getWalls()[4].end.relativeMove(moveX / 2, 0)
              } else {
                if (currentWalPosition == 'right') {
                  if (reducerBlueprint?.configuration2D?.connectWith == 'left') {
                    this.floorplan.getWalls()[4].end.relativeMove(moveX, 0)
                  } else {
                    this.floorplan.getWalls()[4].start.relativeMove(moveX, 0)
                  }
                } else {
                  if (reducerBlueprint?.configuration2D?.connectWith == 'left') {
                    this.floorplan.getWalls()[4].start.relativeMove(moveX, 0)
                  } else {
                    this.floorplan.getWalls()[4].end.relativeMove(moveX, 0)
                  }
                }
              }
            } else if (this.activeWall.start.y == this.activeWall.end.y && reducerBlueprint?.configurationStep == 1) { // top or bottom wall
              // move current wall
              this.activeWall.relativeMove(wallThicknessForAllScreens, moveY);


              // move partition wall y-axis
              if (reducerBlueprint?.configuration2D?.partitionType == 'vertical') {
                if (currentWalPosition == "top") {
                  if (reducerBlueprint?.configuration2D?.connectWith == 'bottom') {
                    this.floorplan.getWalls()[4].end.relativeMove(0, moveY)
                  } else {
                    this.floorplan.getWalls()[4].start.relativeMove(0, moveY)
                  }
                } else {
                  if (reducerBlueprint?.configuration2D?.connectWith == 'bottom') {
                    this.floorplan.getWalls()[4].start.relativeMove(0, moveY)
                  } else {
                    this.floorplan.getWalls()[4].end.relativeMove(0, moveY)
                  }
                }
              } else {
                this.floorplan.getWalls()[4].start.relativeMove(0, moveY / 2)
                this.floorplan.getWalls()[4].end.relativeMove(0, moveY / 2)
              }
            } else if (reducerBlueprint?.configurationStep == 1) {
              this.activeWall.relativeMove((this.rawMouseX - this.lastX) * this.cmPerPixel, (this.rawMouseY - this.lastY) * this.cmPerPixel);
            }
            this.activeWall.snapToAxis(snapTolerance);
          }
          this.lastX = this.rawMouseX;
          this.lastY = this.rawMouseY;
          // console.log("cna=hange = = = = ", this.floorplan.getWalls()[1].getLength());
          this.view.draw();
          dispatch(updateConfigurationStates(this.floorplan.getWalls()[1].getLength() - wallThicknessForAllScreens, 'roomBreath'))
          dispatch(updateConfigurationStates(this.floorplan.getWalls()[0].getLength() - wallThicknessForAllScreens, 'roomLength'))
          dispatch(updateConfigurationStates(this.floorplan.getWalls()[4].getLength(), 'partitionWallLength'))

          if (this.activeCorner && localStoragePartitionType == "floating") { // drag topcorner
            this.floorplan.updateMaxLenghtOfPartitionWall()
            // let maxLengthFromTop = 0
            // let maxLengthFromBottom = 0
            // let partitionWall = this.floorplan.getWalls()[4]
            // let distanceOfTopCornerFromBottomWall = partitionWall.end.distanceFromWall(this.floorplan.getWalls()[1]) - 64.06400000000002
            // maxLengthFromTop = distanceOfTopCornerFromBottomWall + partitionWall.getLength()

            // let distanceOfBottomCornerFromTopWall = partitionWall.start.distanceFromWall(this.floorplan.getWalls()[3]) - 64.06400000000002
            // maxLengthFromBottom = distanceOfBottomCornerFromTopWall + partitionWall.getLength()
            // dispatch(updateConfigurationStates(maxLengthFromBottom, 'maxValueOfLengthTopFloating'))
            // dispatch(updateConfigurationStates(maxLengthFromTop, 'maxValueOfLengthBottomFloating'))
          }
        }
      }

      /** */
      Floorplanner.prototype.touchEnd = function () {
        this.mouseDown = false;
        // // console.log("mouse up");
        // // console.log(this.mouseMoved);
        // drawing
        if (this.mode === Floorplanner_1.floorplannerModes.DRAW && (this.mouseMovedCount === 1 || this.mouseMovedCount === 0)) {
          // // console.log(this.targetX);
          // // console.log(this.targetY);
          var corner = this.floorplan.newCorner(this.targetX, this.targetY);
          if (this.lastNode != null) {
            this.floorplan.newWall(this.lastNode, corner);
          }
          if (corner.mergeWithIntersected() && this.lastNode != null) {
            this.setMode(Floorplanner_1.floorplannerModes.MOVE);
          }
          this.lastNode = corner;
        }
      }
      /**
       * This is end for mobile view touch events
      */
      Floorplanner.prototype.reset = function () {
        this.resizeView();
        this.setMode(Floorplanner_1.floorplannerModes.MOVE);
        this.resetOrigin();
        this.view.draw();
      };
      /** */
      Floorplanner.prototype.resizeView = function () {
        this.view.handleWindowResize();
      };
      /** */
      Floorplanner.prototype.setMode = function (mode) {
        this.lastNode = null;
        this.mode = mode;
        this.modeResetCallbacks.fire(mode);
        this.updateTarget();
      };
      /** Sets the origin so that floorplan is centered */
      Floorplanner.prototype.resetOrigin = function () {
        var centerX = this.canvasElement.innerWidth() / 2;
        var centerY = this.canvasElement.innerHeight() / 2;
        var centerFloorplan = this.floorplan.getCenter();
        this.originX = centerFloorplan.x * this.pixelsPerCm - centerX;
        this.originY = centerFloorplan.z * this.pixelsPerCm - centerY;
      };
      /** Convert from THREEjs coords to canvas coords. */
      Floorplanner.prototype.convertX = function (x) {
        return (x - this.originX * this.cmPerPixel) * this.pixelsPerCm;
      };
      /** Convert from THREEjs coords to canvas coords. */
      Floorplanner.prototype.convertY = function (y) {
        return (y - this.originY * this.cmPerPixel) * this.pixelsPerCm;
      };

      /** Check if two line intersect CUSTOM */
      Floorplanner.prototype.intersects = function (a, b, c, d, p, q, r, s) {
        var det, gamma, lambda;
        det = (c - a) * (s - q) - (r - p) * (d - b);
        if (det === 0) {
          return false;
        } else {
          lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
          gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
          return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
        }
      };
      return Floorplanner;
    })();
    Floorplanner_1.Floorplanner = Floorplanner;
  })(Floorplanner = BP3D.Floorplanner || (BP3D.Floorplanner = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Three;
  (function (Three) {
    Three.Controller = function (three, model, camera, element, controls, hud) {
      var scope = this;
      this.enabled = true;
      // var three = three;
      // var model = model;
      var scene = model.scene;
      // var element = element;
      // var camera = camera;
      // var controls = controls;
      // var hud = hud;
      var plane; // ground plane used for intersection testing
      var mouse;
      var intersectedObject;
      var mouseoverObject;
      var selectedObject;
      var mouseDown = false;
      // eslint-disable-next-line no-unused-vars
      var mouseMoved = false; // has mouse moved since down click
      var mouseMovedCounter = 0;
      var rotateMouseOver = false;
      var states = {
        UNSELECTED: 0,
        SELECTED: 1,
        DRAGGING: 2,
        ROTATING: 3,
        ROTATING_FREE: 4,
        PANNING: 5,
        DRAGGING_FREE: 6
      };
      var raycaster = new THREE.Raycaster()
      var state = states.UNSELECTED;
      this.needsUpdate = true;

      function init() {
        element.mousedown(mouseDownEvent);
        element.mouseup(mouseUpEvent);
        element.mousemove(mouseMoveEvent);
        element.on("touchstart", touchStartEvent);
        element.on("touchmove", touchMoveEvent);
        element.on("touchend", touchEndEvent);


        element.on("dragover", function (event) {
          event.preventDefault();
          event.stopPropagation();
          $(this).addClass('dragging');
        });

        element.on("dragleave", function (event) {
          event.preventDefault();
          event.stopPropagation();
          $(this).removeClass('dragging');
        });


        element.on('drop', e => {
          e.preventDefault()
          checkWallsAndFloors(e);
        })

        mouse = new THREE.Vector2();
        scene.itemRemovedCallbacks.add(itemRemoved);
        scene.itemLoadedCallbacks.add(itemLoaded);
        setGroundPlane();
      }
      // invoked via callback when item is loaded
      function itemLoaded(item) {
        if (item !== undefined && item !== null) {
          if (!item.position_set) {
            scope.setSelectedObject(item);
            switchState(states.DRAGGING_FREE);
          }
          item.position_set = true;
        }
      }

      function clickPressed(vec2) {
        vec2 = vec2 || mouse;
        var intersection = scope.itemIntersection(mouse, selectedObject);
        if (intersection) {
          selectedObject.clickPressed(intersection);
        }
      }

      function clickDragged(vec2) {
        vec2 = vec2 || mouse;
        var intersection = scope.itemIntersection(mouse, selectedObject);
        if (intersection) {
          if (scope.isRotating()) {
            selectedObject.rotate(intersection);
          } else {
            selectedObject.clickDragged(intersection);
          }
        }
      }

      function itemRemoved(item) {
        // invoked as a callback to event in Scene
        if (item === selectedObject) {
          selectedObject.setUnselected();
          selectedObject.mouseOff();
          scope.setSelectedObject(null);
        }
      }

      function setGroundPlane() {
        // ground plane used to find intersections
        var size = 10000;
        plane = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial());
        plane.rotation.x = -Math.PI / 2;
        plane.visible = false;
        scene.add(plane);
      }
      function getPosOfMouse(evt, isTouch = false) {
        var vec = new THREE.Vector3(); // create once and reuse
        var pos = new THREE.Vector3(); // create once and reuse

        vec.set(
          (evt.clientX / window.innerWidth) * 2 - 1,
          - (evt.clientY / window.innerHeight) * 2 + 1,
          0.5);
        if (isTouch) {
          vec.set((reducerBlueprint?.BP3DData?.globals?.getGlobal("touches")[0].clientX / window.innerWidth) * 2 - 1,
            -(reducerBlueprint?.BP3DData?.globals?.getGlobal("touches")[0].clientY / window.innerHeight) * 2 + 1
            , 0.5)
        }
        vec.unproject(camera);

        vec.sub(camera.position).normalize();

        var distance = - camera.position.z / vec.z;

        pos.copy(camera.position).add(vec.multiplyScalar(distance));
        return pos
      }
      function getIntersectionsFromPoint(evt, isTouch) {
        let canvas = document.querySelector("canvas").getBoundingClientRect()
        let x = evt.clientX - canvas.left;
        let y = evt.clientY - canvas.top;
        if (isTouch) {
          x = reducerBlueprint?.BP3DData?.globals?.getGlobal("touches")[0].clientX - canvas.left;;
          y = reducerBlueprint?.BP3DData?.globals?.getGlobal("touches")[0].clientY - canvas.top;
        }
        let vectorX = 2 * x / canvas.width - 1;
        let vectorY = 1 - 2 * y / canvas.height;
        let point = new THREE.Vector2(vectorX, vectorY)
        let cameraTemp = reducerBlueprint?.BP3DData.three.getCamera()
        raycaster.setFromCamera(point, cameraTemp)
        return raycaster.intersectObjects(reducerBlueprint?.BP3DData.model.scene.scene.children)
      }

      function checkWallsAndFloors(evt, isTouch = false) {

        let checkColor = evt?.originalEvent?.dataTransfer?.getData("dragedId")
        if (checkColor) {
          reducerBlueprint?.BP3DData?.globals?.setGlobal("activePanelColor", checkColor)
        }
        const zoomScope = [1, 1.1, 1.21, 1.33, 1.46,]
        let intersections = getIntersectionsFromPoint(evt, isTouch)
        let intersectedPartitionMesh = intersections.find(e => e?.object?.userData?.groupName == "partitionGroup")
        let pos = getPosOfMouse(evt, isTouch)
        if (intersectedPartitionMesh) {
          let doorStart = reducerBlueprint?.BP3DData?.globals?.getGlobal("doorStartVector")
          let oldMouseVector = reducerBlueprint?.BP3DData?.globals?.getGlobal("mouseVectorForDoorDrag")
          if (oldMouseVector) {
            doorStart.x = doorStart.x - (oldMouseVector.x - pos.x)
          }

          if (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedStep") == 3 && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "2D") {
            if (reducerBlueprint?.BP3DData?.globals?.getGlobal("wasDoorClicked")) {
              reducerBlueprint?.BP3DData?.globals?.setGlobal("doorStartVector", doorStart)
            } else {
              reducerBlueprint?.BP3DData?.globals?.setGlobal("doorStartVector", pos)
            }
            reducerBlueprint?.BP3DData.model.floorplan.update()
            reducerBlueprint?.BP3DData.three.controls.dollyIn(zoomScope[setdollyInCount])
            reducerBlueprint?.BP3DData.three.controls.update();

          }
          reducerBlueprint?.BP3DData?.globals?.setGlobal("mouseVectorForDoorDrag", pos)
        }
      }

      // function checkWallsAndFloors() {
      //     // // console.log("checking floor and wall")
      //     // double click on a wall or floor brings up texture change modal
      //     if (state === states.UNSELECTED && mouseoverObject == null) {
      //         // check walls
      //         let raycaster = new THREE.Raycaster()
      //         // mouse.y = mouse.y - 60
      //         mouse.x = (mouse.x / window.innerWidth) * 2 -1
      //         mouse.y = -(mouse.y / window.innerHeight) * 2 + 1
      //         let cameraTemp = reducerBlueprint?.BP3DData.three.getCamera()
      //         // cameraTemp.position.y = 0
      //         raycaster.setFromCamera(mouse,cameraTemp )
      //         let intersections = raycaster.intersectObjects(reducerBlueprint?.BP3DData.model.scene.scene.children)
      //         let intersectedPartitionMesh = intersections.find(e => e?.object.name == "Partition Wall Mesh")
      //         if(intersectedPartitionMesh){
      //             if(intersectedPartitionMesh?.object?.userData.index >= 0){
      //                 reducerBlueprint?.BP3DData?.globals?.setGlobal("activePanelIndex", intersectedPartitionMesh?.object?.userData?.index) 
      //                 reducerBlueprint?.BP3DData.model.floorplan.update() 
      //             }
      //         }

      //         // selecte                    
      //         // var wallIntersects = scope.getIntersections(mouse, wallEdgePlanes, true);
      //         // if (wallIntersects.length > 0) {
      //         //     var wall = wallIntersects[0].object.edge;
      //         //     three.wallClicked.fire(wall);
      //         //     return;
      //         // }
      //         // check floors
      //         // var floorPlanes = model.floorplan.floorPlanes();
      //         // var floorIntersects = scope.getIntersections(mouse, floorPlanes, false);
      //         // if (floorIntersects.length > 0) {
      //         //     var room = floorIntersects[0].object.room;
      //         //     three.floorClicked.fire(room);
      //         //     return;
      //         // }
      //         // three.nothingClicked.fire();
      //     }
      // }


      function mouseMoveEvent(event) {
        if (scope.enabled) {
          event.preventDefault();
          mouseMoved = true;
          // // console.log("mousemoved")
          mouseMovedCounter++;
          mouse.x = event.clientX;
          mouse.y = event.clientY;
          if (!isObjEmpty(reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedDoorConfiguration"))) {
            (mouseDown && reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "2D")
              && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") === 3
              && checkWallsAndFloors(event)
          }
          if (!mouseDown) {
            // // console.log("Mouse Moving");
            if (state === states.DRAGGING_FREE) {
              // // console.log("in Dragging without mouse down")
              clickDragged();
              hud.update();
              scope.needsUpdate = true;
            } else {
              // // console.log("updating intersections");
              updateIntersections();
            }
          }
          switch (state) {
            case states.UNSELECTED:
              updateMouseover();
              break;
            case states.SELECTED:
              updateMouseover();
              // if(mouseDown){
              // checkWallsAndFloors(event)
              // }
              break;
            case states.DRAGGING:
            case states.ROTATING:
            case states.ROTATING_FREE:
              clickDragged();
              hud.update();
              scope.needsUpdate = true;
              break;
            default:
              break;
          }
        }
      }
      this.isRotating = function () {
        return (state === states.ROTATING || state === states.ROTATING_FREE);
      };

      // eslint-disable-next-line no-unused-vars
      function touchStartEvent(event) {
        if (!isObjEmpty(reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedDoorConfiguration"))) {
          (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "2D")
            && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") === 3
            && reducerBlueprint?.BP3DData?.globals?.setGlobal("touches", event.originalEvent.touches)
        }
        touchMoveEvent(event);
        if (scope.enabled) {
          event.preventDefault();
          mouseMoved = false;
          // // console.log("mousedown")
          mouseMovedCounter = 0;
          mouseDown = true;
          switch (state) {
            case states.SELECTED:
              if (rotateMouseOver) {
                switchState(states.ROTATING);
              } else if (intersectedObject != null) {
                scope.setSelectedObject(intersectedObject);
                if (!intersectedObject.fixed) {
                  switchState(states.DRAGGING);
                }
              }
              break;
            case states.UNSELECTED:

              if (intersectedObject != null) {
                // // console.log("calling set sel1bjhbjhbj")
                scope.setSelectedObject(intersectedObject);
                if (!intersectedObject.fixed) {
                  switchState(states.DRAGGING);
                }
              } else {
                // // console.log("no object")
              }
              break;
            case states.DRAGGING:
            case states.ROTATING:
              break;
            case states.ROTATING_FREE:
              switchState(states.SELECTED);
              break;
            case states.DRAGGING_FREE:
              switchState(states.DRAGGING);
              break;
            default:
              break;
          }
        }
      }

      // eslint-disable-next-line no-unused-vars
      function touchMoveEvent(event) {
        if (!isObjEmpty(reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedDoorConfiguration"))) {
          (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "2D")
            && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") === 3
            && reducerBlueprint?.BP3DData?.globals?.setGlobal("touches", event.originalEvent.touches)
        }
        if (scope.enabled) {
          event.preventDefault();
          mouseMoved = true;
          // // console.log("mousemoved")
          mouseMovedCounter++;
          mouse.x = event.touches[0].clientX;
          mouse.y = event.touches[0].clientY;
          checkWallsAndFloors(event, true)
          if (!mouseDown) {
            // // console.log("Mouse Moving");
            if (state === states.DRAGGING_FREE) {
              // // console.log("in Dragging without mouse down")
              clickDragged();
              hud.update();
              scope.needsUpdate = true;
            } else {
              // // console.log("updating intersections");
              updateIntersections();
            }
          }
          switch (state) {
            case states.UNSELECTED:
              // // console.log("updating")
              updateMouseover();
              break;
            case states.SELECTED:
              updateMouseover();
              break;
            case states.DRAGGING:
            case states.ROTATING:
            case states.ROTATING_FREE:
              clickDragged();
              hud.update();
              scope.needsUpdate = true;
              break;
            default:
              updateMouseover();
              break;
          }
        }
      }

      // eslint-disable-next-line no-unused-vars
      function touchEndEvent(event) {
        if (!isObjEmpty(reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedDoorConfiguration"))) {
          (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "2D")
            && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") === 3
            && reducerBlueprint?.BP3DData?.globals?.setGlobal("touches", event.originalEvent.touches)
        }
        if (scope.enabled) {
          mouseDown = false;
          switch (state) {
            case states.DRAGGING:
              if (selectedObject != null) {
                selectedObject.clickReleased();
              }
              switchState(states.SELECTED);

              break;
            case states.ROTATING:
              if (mouseMovedCounter === 0 || mouseMovedCounter === 1) {
                switchState(states.ROTATING_FREE);
              } else {
                switchState(states.SELECTED);
              }
              break;
            case states.UNSELECTED:
              if (mouseMovedCounter === 0 || mouseMovedCounter === 1) {
                checkWallsAndFloors(event, true);
              }
              break;
            case states.SELECTED:
              if (intersectedObject == null && (mouseMovedCounter === 0 || mouseMovedCounter === 1)) {
                switchState(states.UNSELECTED);
                checkWallsAndFloors(event, true);
              }
              break;
            case states.ROTATING_FREE:
              break;
            default:
              checkWallsAndFloors(event, true);
              break;
          }
        }
      }

      function mouseDownEvent(event) {

        let pos = getPosOfMouse(event, false)
        reducerBlueprint?.BP3DData?.globals?.setGlobal("mouseVectorForDoorDrag", pos)
        let intersections = getIntersectionsFromPoint(event, false)
        let intersectedPartitionMesh = intersections.find(e => e?.object?.userData?.name == "DoorMesh")
        if (intersectedPartitionMesh) {
          reducerBlueprint?.BP3DData?.globals?.setGlobal("wasDoorClicked", true)
        }
        if (scope.enabled) {
          event.preventDefault();
          mouseMoved = false;
          // // console.log("mousedown")
          mouseMovedCounter = 0;
          mouseDown = true;
          switch (state) {
            case states.SELECTED:
              if (rotateMouseOver) {
                switchState(states.ROTATING);
              } else if (intersectedObject != null) {
                scope.setSelectedObject(intersectedObject);
                if (!intersectedObject.fixed) {
                  switchState(states.DRAGGING);
                }
              }
              break;
            case states.UNSELECTED:
              if (intersectedObject != null) {
                scope.setSelectedObject(intersectedObject);
                if (!intersectedObject.fixed) {
                  switchState(states.DRAGGING);
                }
              }
              break;
            case states.DRAGGING:
            case states.ROTATING:
              break;
            case states.ROTATING_FREE:
              switchState(states.SELECTED);
              break;
            case states.DRAGGING_FREE:
              switchState(states.DRAGGING);
              break;
            default:
              break;
          }
        }
      }

      function mouseUpEvent(event) {
        reducerBlueprint?.BP3DData?.globals?.setGlobal("wasDoorClicked", false)
        if (scope.enabled) {
          mouseDown = false;
          switch (state) {
            case states.DRAGGING:
              if (selectedObject != null) {
                selectedObject.clickReleased();
              }
              switchState(states.SELECTED);

              break;
            case states.ROTATING:
              if (mouseMovedCounter === 0 || mouseMovedCounter === 1) {
                switchState(states.ROTATING_FREE);
              } else {
                switchState(states.SELECTED);
              }
              break;
            case states.UNSELECTED:
              if (mouseMovedCounter === 0 || mouseMovedCounter === 1) {

                checkWallsAndFloors(event);

              }
              break;
            case states.SELECTED:
              if (intersectedObject == null && (mouseMovedCounter === 0 || mouseMovedCounter === 1)) {
                switchState(states.UNSELECTED);

                checkWallsAndFloors(event);

              }
              break;
            case states.ROTATING_FREE:
              break;
            default:
              checkWallsAndFloors(event);
              break;
          }
        }
      }

      function switchState(newState) {
        if (newState !== state) {
          onExit(state);
          onEntry(newState);
        }
        state = newState;
        hud.setRotating(scope.isRotating());
      }

      function onEntry(state) {
        switch (state) {
          case states.UNSELECTED:
            scope.setSelectedObject(null);
          // eslint-disable-next-line no-fallthrough
          case states.SELECTED:
            controls.enabled = true;
            break;
          case states.ROTATING:
          case states.ROTATING_FREE:
            controls.enabled = false;
            break;
          case states.DRAGGING:
            three.setCursorStyle("move");
            clickPressed();
            controls.enabled = false;
            break;
          case states.DRAGGING_FREE:
            three.setCursorStyle("move");
            break;
          default:
            break;
        }
      }

      function onExit(state) {
        switch (state) {
          case states.UNSELECTED:
          case states.SELECTED:
            break;
          case states.DRAGGING:
            if (mouseoverObject) {
              three.setCursorStyle("pointer");
            } else {
              three.setCursorStyle("auto");
            }
            break;
          case states.ROTATING:
          case states.ROTATING_FREE:
            break;
          default:
            break;
        }
      }
      this.selectedObject = function () {
        return selectedObject;
      };
      // updates the vector of the intersection with the plane of a given
      // mouse position, and the intersected object
      // both may be set to null if no intersection found
      function updateIntersections() {
        // check the rotate arrow
        var hudObject = hud.getObject();
        if (hudObject != null) {
          var hudIntersects = scope.getIntersections(mouse, hudObject, false, false, true);
          if (hudIntersects.length > 0) {
            rotateMouseOver = true;
            hud.setMouseover(true);
            intersectedObject = null;
            return;
          }
        }
        rotateMouseOver = false;
        hud.setMouseover(false);
        // check objects
        var items = model.scene.getItems();
        var intersects = scope.getIntersections(mouse, items, false, true);
        if (intersects.length > 0) {
          intersectedObject = intersects[0].object;
        } else {
          intersectedObject = null;
        }
      }
      // sets coords to -1 to 1
      function normalizeVector2(vec2) {
        var retVec = new THREE.Vector2();
        retVec.x = ((vec2.x - three.widthMargin) / (window.innerWidth - three.widthMargin)) * 2 - 1;
        retVec.y = -((vec2.y - three.heightMargin) / (window.innerHeight - three.heightMargin)) * 2 + 1;
        return retVec;
      }
      //
      function mouseToVec3(vec2) {
        var normVec2 = normalizeVector2(vec2);
        var vector = new THREE.Vector3(normVec2.x, normVec2.y, 0.5);
        vector.unproject(camera);
        return vector;
      }
      // returns the first intersection object
      this.itemIntersection = function (vec2, item) {
        if (item == null) {
          return null;
        }
        var customIntersections = item.customIntersectionPlanes();
        var intersections = null;
        if (customIntersections && customIntersections.length > 0) {
          intersections = this.getIntersections(vec2, customIntersections, true);
        } else {
          intersections = this.getIntersections(vec2, plane);
        }
        if (intersections.length > 0) {
          return intersections[0];
        } else {
          return null;
        }
      };
      // filter by normals will only return objects facing the camera
      // objects can be an array of objects or a single object
      this.getIntersections = function (vec2, objects, filterByNormals, onlyVisible, recursive, linePrecision) {
        var vector = mouseToVec3(vec2);
        onlyVisible = onlyVisible || false;
        filterByNormals = filterByNormals || false;
        recursive = recursive || false;
        linePrecision = linePrecision || 20;
        var direction = vector.sub(camera.position).normalize();
        // var raycaster = new THREE.Raycaster(camera.position, direction);
        // raycaster.params.Line.threshold = linePrecision;
        // raycaster.linePrecision = linePrecision;
        var intersections = [];
        // if (objects instanceof Array) {
        //     intersections = raycaster.intersectObjects(objects, recursive);
        // } else {
        //     intersections = raycaster.intersectObject(objects, recursive);
        // }
        // filter by visible, if true
        if (onlyVisible) {
          intersections = BP3D.Core.Utils.removeIf(intersections, function (intersection) {
            return !intersection.object.visible;
          });
        }
        // filter by normals, if true
        if (filterByNormals) {
          intersections = BP3D.Core.Utils.removeIf(intersections, function (intersection) {
            var dot = intersection.face.normal.dot(direction);
            return (dot > 0);
          });
        }
        return intersections;
      };
      // manage the selected object
      this.setSelectedObject = function (object) {
        if (state === states.UNSELECTED) {
          switchState(states.SELECTED);
        }
        if (selectedObject != null) {
          selectedObject.setUnselected();
        }
        if (object != null) {
          selectedObject = object;
          selectedObject.setSelected();
          three.itemSelectedCallbacks.fire(object);
        } else {
          selectedObject = null;
          three.itemUnselectedCallbacks.fire();
        }
        this.needsUpdate = true;
      };
      // TODO: there MUST be simpler logic for expressing this
      function updateMouseover() {
        if (intersectedObject != null) {
          if (mouseoverObject != null) {
            if (mouseoverObject !== intersectedObject) {
              mouseoverObject.mouseOff();
              mouseoverObject = intersectedObject;
              mouseoverObject.mouseOver();
              scope.needsUpdate = true;
            } else { }
          } else {
            mouseoverObject = intersectedObject;
            mouseoverObject.mouseOver();
            three.setCursorStyle("pointer");
            scope.needsUpdate = true;
          }
        } else if (mouseoverObject != null) {
          mouseoverObject.mouseOff();
          three.setCursorStyle("auto");
          mouseoverObject = null;
          scope.needsUpdate = true;
        }
      }
      init();
    };
  })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Three;
  (function (Three) {
    Three.Floor = function (scene, room) {
      var scope = this;
      this.room = room;
      // var scene = scene;
      var floorPlane = null;
      // var roofPlane = null;
      init();

      function init() {
        scope.room.fireOnFloorChange(redraw);
        floorPlane = buildFloor();
        scope.room.roomSelectedCallbacks.add(drawOutline);
        scope.room.roomUnSelectedCallbacks.add(removeOutline);
        // roofs look weird, so commented out
        //roofPlane = buildRoof();
      }

      function drawOutline(box) {
        // console.log("thisi st he box =>", box, box.plane)
        scene.add(box);
      }

      function removeOutline(box) {
        scene.remove(box);
      }

      function redraw() {
        scope.removeFromScene();
        floorPlane = buildFloor();
        scope.addToScene();
      }
      // floor
      function buildFloor() {
        var textureSettings = scope.room.getTexture();
        // setup texture
        var texLoader = new THREE.TextureLoader();
        texLoader.setCrossOrigin('');
        var floorTexture = texLoader.load(textureSettings.url);
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(1, 1);
        var floorMaterialTop = new THREE.MeshPhongMaterial({
          map: floorTexture,
          side: THREE.DoubleSide,
          // ambient: 0xffffff, TODO_Ekki
          color: 0xB2B2B2,
          specular: 0x0a0a0a,
          emissive: 0x0a0a0a,
          reflectivity: 1,
          shininess: 40


        });
        var textureScale = textureSettings.scale;
        // http://stackoverflow.com/questions/19182298/how-to-texture-a-three-js-mesh-created-with-shapegeometry
        // scale down coords to fit 0 -> 1, then rescale
        var points = [];
        scope.room.interiorCorners.forEach(function (corner) {
          points.push(new THREE.Vector2(corner.x / textureScale, corner.y / textureScale));
        });
        var shape = new THREE.Shape(points);
        var geometry = new THREE.ShapeGeometry(shape);
        var floor = new THREE.Mesh(geometry, floorMaterialTop);
        floor.rotation.set(Math.PI / 2, 0, 0);
        floor.scale.set(textureScale, textureScale, textureScale);
        floor.receiveShadow = false;
        floor.castShadow = false;
        return floor;
      }

      // eslint-disable-next-line no-unused-vars
      function buildRoof() {
        // setup texture
        var roofMaterial = new THREE.MeshBasicMaterial({
          side: THREE.FrontSide,
          color: 0xe5e5e5
        });
        var points = [];
        scope.room.interiorCorners.forEach(function (corner) {
          points.push(new THREE.Vector2(corner.x, corner.y));
        });
        var shape = new THREE.Shape(points);
        var geometry = new THREE.ShapeGeometry(shape);
        var roof = new THREE.Mesh(geometry, roofMaterial);
        roof.rotation.set(Math.PI / 2, 0, 0);
        roof.position.y = 200;
        return roof;
      }
      this.addToScene = function () {
        reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "3D" && scene.add(floorPlane);
        //scene.add(roofPlane);
        // hack so we can do intersect testing
        scene.add(room.floorPlane);
      };
      this.removeFromScene = function () {
        scene.remove(floorPlane);
        //scene.remove(roofPlane);
        scene.remove(room.floorPlane);
      };
    };
  })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Three;
  (function (Three) {
    Three.Edge = function (scene, edge, controls) {
      // console.log("this is selected type =>", reducerBlueprint)
      // controls.enabled = reducerBlueprint?.selectedType === "3D";
      var scope = this;
      // var scene = scene;
      // var edge = edge;
      // var controls = controls;
      var wall = edge.wall;
      var front = edge.front;
      var planes = [];
      var basePlanes = []; // always visible
      var indicators = [];
      var items = []
      var texture = null;
      // var lightMap = new THREE.TextureLoader().load("http://localhost:8001/assets/5ef849ed8188602a98c95525");
      // var lightMap = THREE.ImageUtils.loadTexture("rooms/textures/walllightmap.png");
      var fillerColor = 0xdddddd;
      var sideColor = 0xcccccc;
      var baseColor = 0xdddddd;
      this.visible = false;
      this.remove = function () {
        edge.redrawCallbacks.remove(redraw);
        controls.cameraMovedCallbacks.remove(updateVisibility);
        removeFromScene();
      };

      function init() {
        edge.redrawCallbacks.add(redraw);
        edge.edgeSelectedCallbacks.add(drawOutline);
        edge.edgeUnSelectedCallbacks.add(removeOutline);
        controls.cameraMovedCallbacks.add(updateVisibility);
        updateTexture();
        updatePlanes();
        addToScene();

      }

      function drawOutline(box) {
        scene.add(box);

        updatePlanes();
      }

      function removeOutline(box) {
        scene.remove(box);
        updatePlanes();
      }

      function redraw() {
        removeFromScene();
        updateTexture();
        updatePlanes();
        addToScene();
      }

      function removeFromScene() {
        planes.forEach(function (plane) {
          scene.remove(plane);
        });
        basePlanes.forEach(function (plane) {
          scene.remove(plane);
        });
        indicators.forEach(function (indicatorMesh) {
          scene.remove(indicatorMesh)
        })
        items.forEach(e => {
          scene.remove(e)
        })
        planes = [];
        basePlanes = [];
        indicators = []
        items = []
      }
      function addToScene() {
        // window.globalThis.planes = []              
        planes.forEach(function (plane) {
          // window.globalThis.planes.push(plane)
          scene.add(plane);
        });
        basePlanes.forEach(function (plane) {
          scene.add(plane);
        });
        indicators.forEach(function (indicatorMesh) {
          scene.add(indicatorMesh)
        })
        items.forEach(eachItem => {
          scene.add(eachItem)
        })
        updateVisibility();
      }

      function updateVisibility() {
        // finds the normal from the specified edge
        var start = edge.interiorStart();
        var end = edge.interiorEnd();
        var x = end.x - start.x;
        var y = end.y - start.y;
        // rotate 90 degrees CCW
        var normal = new THREE.Vector3(-y, 0, x);
        normal.normalize();
        // setup camera
        var position = controls.object.position.clone();
        var focus = new THREE.Vector3((start.x + end.x) / 2.0, 0, (start.y + end.y) / 2.0);
        var direction = position.sub(focus).normalize();
        // find dot
        var dot = normal.dot(direction);
        // update visible
        scope.visible = (dot >= 0);
        // show or hide plans
        // hide walls
        planes.forEach(function (plane) {
          plane.visible = scope.visible;
        });
        updateObjectVisibility();
      }

      function updateObjectVisibility() {
        wall.items.forEach(function (item) {
          item.updateEdgeVisibility(scope.visible, front);
        });
        wall.onItems.forEach(function (item) {
          item.updateEdgeVisibility(scope.visible, front);
        });
      }

      function updateTexture(callback) {
        // callback is fired when texture loads
        callback = function (texture) {
          scene.needsUpdate = true;
          THREE.Cache.add(url, texture);
        };
        var textureData = edge.getTexture();
        var stretch = textureData.stretch;
        var url = textureData.url;
        var scale = textureData.scale;
        if (THREE.Cache.get(url) === undefined) {
          texture = new THREE.TextureLoader().load(url, callback, null, null);
        } else {
          texture = THREE.Cache.get(url);
        }

        // texture = THREE.ImageUtils.loadTexture(url, null, callback);
        if (!stretch) {
          var height = wall.height;
          var width = edge.interiorDistance();
          texture.wrapT = THREE.RepeatWrapping;
          texture.wrapS = THREE.RepeatWrapping;
          texture.repeat.set(width / scale, height / scale);
          texture.needsUpdate = true;
        }
      }

      function updatePlanes() {
        const localStoragePartitionType = DataManager.getPartitionType()
        var wallMaterial = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          // ambientColor: 0xffffff, TODO_Ekki
          //ambient: scope.wall.color,
          side: THREE.FrontSide,
          map: texture,
          transparent: true,
          opacity: 0.1
        });

        var fillerMaterial = new THREE.MeshBasicMaterial({
          color: sideColor, //0xdddddd,
          side: THREE.DoubleSide,
          transparent: false,
          opacity: 0.5
        });
        if (edge.wall === reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[4]) {
          // fillerMaterial = new THREE.MeshBasicMaterial({
          //   color: "#DDFAF9", //0xdddddd,
          //   side: THREE.DoubleSide,
          //   transparent: true,
          //   reflectivity: 1000,
          //   opacity: 0.1,

          // });

          // blueprint3d[0]?.globals?.setGlobal("selectedFilm", index+1)
          let index
          var floorTexture
          if (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedFilm")) {
            index = reducerBlueprint?.importedTextures?.film.findIndex(x => x.name === reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedFilm"));
            floorTexture = reducerBlueprint?.importedTextures?.film[index]
          } else {
            floorTexture = null
          }

          if (floorTexture) {
            floorTexture.wrapS = THREE.MirroredRepeatWrapping
            floorTexture.offset.set(0, 0);
            // floorTexture.repeat.set(0.4, 1)
          }
          if (reducerBlueprint?.configurationStep > 6) {
            fillerMaterial = new THREE.MeshBasicMaterial({
              map: floorTexture,
              side: THREE.DoubleSide,
              color: "#FFFFFF",
              transparent: true,
              opacity: 0.1,

            });
          } else {
            fillerMaterial = new THREE.MeshBasicMaterial({
              side: THREE.DoubleSide,
              color: "#FFFFFF",
              transparent: true,
              opacity: 0.1,

            });
          }


        }
        // exterior plane
        let previousWall = null
        if (edge.wall === reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[4] && reducerBlueprint?.configurationStep > 2 && reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "2D") {
          previousWall = {
            start: {
              x: edge.wall.getStartX(),
              y: edge.wall.getStartY(),
            },
            end: {
              x: edge.wall.getEndX(),
              y: edge.wall.getEndY(),
            }
          }
          let wallLength = edge.wall.getLength()
          //   if (reducerBlueprint?.configuration2D?.partitionType == 'vertical') {
          //     let leftWallCenter = (reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[0].start.y + reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[0].end.y) / 2
          //     edge.wall.start.y = leftWallCenter + (wallLength / 2)
          //     edge.wall.end.y = leftWallCenter + (-wallLength / 2)
          // } else {
          //     let topWallCenter = (reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[3].start.x + reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[3].end.x) / 2
          //     edge.wall.start.x = topWallCenter + (wallLength / 2)
          //     edge.wall.end.x = topWallCenter + (-wallLength / 2)
          // }


          if (localStoragePartitionType == "fixed") {
            let topWallCenter = (reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[3].start.x + reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[3].end.x) / 2
            edge.wall.start.x = topWallCenter + (wallLength / 2)
            edge.wall.end.x = topWallCenter + (-wallLength / 2)
          } else if (localStoragePartitionType !== "fixed") {
            let tempStart = edge.wall.start.x
            let tempEnd = edge.wall.end.x

            if (reducerBlueprint?.configuration2D?.connectWith == "left" || localStoragePartitionType == "floating") {
              edge.wall.start.x = tempEnd
              edge.wall.end.x = tempStart
            }
          }

          console.log("ADDING TO SCENE")

        }
        if (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "3D" || edge.wall === reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[4]) {
          if (edge.wall === reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[4]) {
            planes.push(makePartitionWall(edge.interiorStart(), edge.interiorEnd(), edge, fillerMaterial));
            // planes.push(makePartitionWall(edge.interiorStart(), edge.interiorEnd(), edge, wallMaterial));

          } else {
            planes.push(makeWall(edge.exteriorStart(), edge.exteriorEnd(), edge.exteriorTransform, edge.invExteriorTransform, fillerMaterial));
            // interior plane
            planes.push(makeWall(edge.interiorStart(), edge.interiorEnd(), edge.interiorTransform, edge.invInteriorTransform, wallMaterial));
          }

          if (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") == "3D") {
            // bottom
            basePlanes.push(buildFiller(edge, 1, THREE.BackSide, baseColor)); // height is passed 1 because 0 height was glitching with the floor
            // top
            planes.push(buildFiller(edge, wall.height, THREE.DoubleSide, fillerColor));
            // sides
            planes.push(buildSideFillter(edge.interiorStart(), edge.exteriorStart(), wall.height, sideColor));
            planes.push(buildSideFillter(edge.interiorEnd(), edge.exteriorEnd(), wall.height, sideColor));
          }
        }


        // build indicators 
        if (edge.wall === reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[4] && reducerBlueprint?.configurationStep > 2 && reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "2D") {
          if (reducerBlueprint?.configuration2D?.partitionType == 'vertical') {
            indicators.push(buildIndicatorVertical(edge))
            indicators.push(buildIndicatorForHeightVertical(edge))
            // planes.push(buildFillerFor2DVertical(edge, edge.wall.height, sideColor))
            // indicators.push(buildPanelSizeLabelVertical(edge))

          } else {
            indicators.push(buildIndicatorHorizontal(edge))
            indicators.push(buildIndicatorForHeightHorizontal(edge))
            if (!isObjEmpty(reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedDoorConfiguration")) && reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedDoorConfiguration").selectedDoorSize) {
              indicators.push(buildIndicatorForDoorHorizontal(edge))
              indicators.push(buildLeftIndicatorForDoorHorizontal(edge))
              indicators.push(buildRightIndicatorForDoorHorizontal(edge))
            }
            if (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedStep") < 4) {
              // planes.push(buildFillerFor2DHorizontal(edge, edge.wall.height, sideColor))
            }
            // indicators.push(buildPanelSizeLabelHorizontal(edge))
          }

        }
        if (edge.wall === reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[4] && reducerBlueprint?.configurationStep > 2 && reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "2D") {
          edge.wall.start.x = previousWall.start.x
          edge.wall.start.y = previousWall.start.y
          edge.wall.end.x = previousWall.end.x
          edge.wall.end.y = previousWall.end.y
        }
        // console.log("this is the datata =>", edge.wall.start.x);

      }
      // start, end have x and y attributes (i.e. corners)
      function makeWall(start, end, transform, invTransform, material) {
        const count = 2;
        const positionsArray = new Float32Array(count * 3 * 3)
        const positionsArrayValues = [
          start?.x, 0, start?.y,
          end?.x, 0, end?.y,
          end?.x, wall.height, end?.y,
          start?.x, wall.height, start?.y,
          end?.x, wall.height, end?.y,
          start?.x, 0, start?.y
        ]
        for (let i = 0; i < count * 3 * 3; i++) {
          positionsArray[i] = positionsArrayValues[i]
        }
        // console.log("this is floor 32 =>", positionsArray)
        const positionsAttributes = new THREE.BufferAttribute(positionsArray, 3)
        var geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', positionsAttributes)

        var mesh = new THREE.Mesh(geometry, material);
        mesh.name = reducerBlueprint?.BP3DData?.model.floorplan.getWallPosition(wall)
        mesh.castShadow = true
        // mesh.receiveShadow = true

        return mesh;

      }

      function makePartitionWall(start, end, edge, material) {

        // if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedFilm") > 0) {
        //   let color = reducerBlueprint?.BP3DData?.globals.getGlobal("films")[reducerBlueprint?.BP3DData?.globals.getGlobal("selectedFilm") - 1].name
        //   material.color.set(color)
        //   material.opacity = 0.4
        // }

        const localStoragePartitionType = DataManager.getPartitionType()
        if (!edge.front && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") === "3D" && reducerBlueprint?.configuration2D?.connectWith == "left") {
          start = { ...end }
        } else if (edge.front && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") === "2D") {
          start = { ...end }
        } else if (edge.front && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") === "3D" && reducerBlueprint?.configuration2D?.connectWith == "right") {
          start = { ...end }
        }
        let wallLength = wall.getLength()
        let doorBorderWidth = 5
        let doorLength = (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize || 0) / reducerBlueprint?.perCmEqualToMm
        let doorStart = (reducerBlueprint?.BP3DData?.globals.getGlobal("doorStartVector")) || { x: 0, y: start.y }
        doorStart.y = start.y
        if (!reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize) {
          doorStart.x = start.x + doorMinimumSpaceFromEgde
        }
        if (localStoragePartitionType == "single") {
          if (doorStart.x > (start.x + wallLength - doorLength - doorMinimumSpaceFromEgde)) {
            // console.log("this was door Start 1 =>", doorStart, start, end)
            doorStart.x = start.x + wallLength - doorLength - doorMinimumSpaceFromEgde
            reducerBlueprint?.BP3DData?.globals?.setGlobal("doorStartVector", doorStart)
          } else if (doorStart.x < (start.x + doorMinimumSpaceFromEgde)) {
            // console.log("this was door Start 2 =>", doorStart, start, end)
            doorStart.x = start.x + doorMinimumSpaceFromEgde
            reducerBlueprint?.BP3DData?.globals?.setGlobal("doorStartVector", doorStart)
          }
        } else {
          if (doorStart.x > (start.x + wallLength - doorLength - doorMinimumSpaceFromEgde)) {
            doorStart.x = start.x + wallLength - doorLength
            reducerBlueprint?.BP3DData?.globals?.setGlobal("doorStartVector", doorStart)
          } else if (doorStart.x < (start.x + doorMinimumSpaceFromEgde)) {
            doorStart.x = start.x + doorMinimumSpaceFromEgde
            reducerBlueprint?.BP3DData?.globals?.setGlobal("doorStartVector", doorStart)
          }

        }

        let leftLength = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize ? Math.abs(doorStart.x - start.x) : wallLength
        let rightLength = 0
        rightLength = Math.abs((doorStart.x + doorLength) - (start.x + wallLength))
        let leftStart = { ...start }
        let rightStart = { ...start }
        rightStart.x = start.x + leftLength + doorLength
        const partitionGroup = new THREE.Group()
        let numberOfPanelsLeft = reducerBlueprint?.BP3DData?.globals.getGlobal("numberOfPanels")
        let numberOfPanelsRight = reducerBlueprint?.BP3DData?.globals.getGlobal("numberOfPanelsRight")
        console.log("this is number of panels = ", numberOfPanelsLeft)
        if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") > 6) {
          let x = (edge.wall.getLength() / 64) / 6
          material?.map?.repeat?.set(2, 1)
          // let y = ( configuratorData?.partitionRightWallLength / 64) / 6
          // m2?.map?.repeat?.set(y,1)
        }
        let m2 = material.clone()
        const leftGroup = makeDoorSideWall(leftStart, leftLength, edge, material, numberOfPanelsLeft || 1)
        if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize) {
          const rightGroup = makeDoorSideWall(rightStart, rightLength, edge, m2, numberOfPanelsRight ?? 1)
          const doorGroup = makeDoor(doorStart, doorLength, edge, material, doorBorderWidth)
          dispatch(updateConfigurationStates(leftLength, 'partitionLeftWallLength'))
          dispatch(updateConfigurationStates(rightLength, 'partitionRightWallLength'))
          partitionGroup.add(doorGroup, leftGroup, rightGroup)
        } else {
          dispatch(updateConfigurationStates(leftLength, 'partitionLeftWallLength'))
          partitionGroup.add(leftGroup)
        }
        partitionGroup.name = "partitionGroup"
        partitionGroup.userData.text = "partitionGroup"
        return partitionGroup
      }

      function makeDoorSideWall(start, wallLength, edge, material, numberOfMesh) {
        numberOfMesh = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") > 4 ? numberOfMesh : 1
        let lengthForEachMesh = wallLength / numberOfMesh
        const mainGroup = new THREE.Group()
        let positionsArrayValues = []
        let positionsAttributes;
        let borderWidth = 5

        let distanceBetweenEachBorder = (wallLength - ((numberOfMesh + 1) * borderWidth)) / numberOfMesh
        for (let i = 0; i < numberOfMesh; i++) {
          let tempStart = { ...start }
          let tempEnd = { ...tempStart }
          tempStart.x = start.x + (i * lengthForEachMesh)
          tempEnd.x = tempStart.x + lengthForEachMesh
          positionsArrayValues = [
            tempStart?.x, 0, tempStart?.y,
            tempEnd?.x, 0, tempEnd?.y,
            tempEnd?.x, wall.height, tempEnd?.y,
            tempStart?.x, wall.height, tempStart?.y,
            tempEnd?.x, wall.height, tempEnd?.y,
            tempStart?.x, 0, tempStart?.y
          ]
          if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") == 3 && !reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize) {

            reducerBlueprint?.BP3DData?.globals.setGlobal("wallLengthPositionArr", positionsArrayValues)
          }
          let positionsArray
          if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") > 6) {
            let fullPositionArrayValuesOfWall = reducerBlueprint?.BP3DData?.globals.getGlobal("wallLengthPositionArr")
            positionsArray = new Float32Array(fullPositionArrayValuesOfWall)
          } else {
            positionsArray = new Float32Array(positionsArrayValues)
          }

          var quad_uvs =
            [
              0.0, 0.0,
              1.0, 0.0,
              1.0, 1.0,
              0.0, 1.0
            ];

          var quad_indices =
            [
              0, 3, 2,
              0, 2, 1
            ];

          var uvs = new Float32Array(quad_uvs);
          var indices = new Uint32Array(quad_indices)

          var geometry = new THREE.BufferGeometry()

          if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") > 6) {
            positionsAttributes = new THREE.BufferAttribute(positionsArray, 3)
            geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
            geometry.setAttribute('position', positionsAttributes)
            geometry.setIndex(new THREE.BufferAttribute(indices, 1));
          } else {
            positionsAttributes = new THREE.BufferAttribute(positionsArray, 3)
            geometry.setAttribute('position', positionsAttributes)
          }

          var mesh = new THREE.Mesh(geometry, material)
          mesh.castShadow = true
          let color = (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") < 5) ? sideColor : reducerBlueprint?.BP3DData?.globals.getGlobal("selectedColorVariant")
          tempStart.x = start.x + ((borderWidth + distanceBetweenEachBorder) * i)
          if (reducerBlueprint?.configurationStep > 2) {
            let numberOfHorizontalFrames = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedHorizontalFrames") + 1
            console.log("this is call function make birder");
            //Check which border should be thick or not
            
            mainGroup.add(getMeshForPanelBorder(tempStart, wall.height, (distanceBetweenEachBorder + borderWidth), color, borderWidth, true, true, false, numberOfHorizontalFrames, false, i, numberOfMesh))
          }
          if (reducerBlueprint?.configuration2D?.connectWith == "left") {
            if (edge.front) {
              mesh.position.z = mesh.position.z - 2.5
            } else {
              mesh.position.z = mesh.position.z + 2.5
            }
          } else {
            if (edge.front) {
              mesh.position.z = mesh.position.z + 2.5
            } else {
              mesh.position.z = mesh.position.z - 2.5
            }
          }
          if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") > 6) {
            if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") === "2D") {
              mesh.position.z = mesh.position.z - 10
            } else {
              mesh.position.z = mesh.position.z - 5
            }
          }
          mesh.userData.groupName = "partitionGroup"
          mainGroup.add(mesh)
          edge.plane = mainGroup
        }
        mainGroup.name = "Partition wall"
        // mainGroup.castShadow = true

        return mainGroup;
      }

      function makeDoor(start, length, edge, material, borderWidth) {
        const mainGroup = new THREE.Group()
        let tempStart = { ...start }
        let tempEnd = { ...start }
        tempEnd.x = start.x + length
        let positionsArrayValues = [
          tempStart?.x, 0, tempStart?.y,
          tempEnd?.x, 0, tempEnd?.y,
          tempEnd?.x, wall.height, tempEnd?.y,
          tempStart?.x, wall.height, tempStart?.y,
          tempEnd?.x, wall.height, tempEnd?.y,
          tempStart?.x, 0, tempStart?.y
        ]
        const positionsArray = new Float32Array(positionsArrayValues)
        let positionsAttributes = new THREE.BufferAttribute(positionsArray, 3)
        var geometry = new THREE.BufferGeometry()
        if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") < 7) {
          geometry.setAttribute('position', positionsAttributes)
        }

        // material.color.set("#DDFAF9")
        var mesh = new THREE.Mesh(geometry, material)
        mesh.castShadow = true
        let color = (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") < 5) ? sideColor : reducerBlueprint?.BP3DData?.globals.getGlobal("selectedColorVariant")
        if (reducerBlueprint?.configuration2D?.connectWith == "left") {
          if (edge.front) {
            mesh.position.z = mesh.position.z - 2.5
          } else {
            mesh.position.z = mesh.position.z + 2.5
          }
        } else {
          if (edge.front) {
            mesh.position.z = mesh.position.z + 2.5
          } else {
            mesh.position.z = mesh.position.z - 2.5
          }
        }
        if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") == 3 && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "2D") {
          color = 0xcbaf87
        }
        let selectedDoorConfigurationTemp = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration").doorGlass ? reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration").horizontalBarForDoor : 1
        mainGroup.add(getMeshForPanelBorder(tempStart, wall.height, length - borderWidth, color, borderWidth, true, true, true, selectedDoorConfigurationTemp, true))
        mesh.userData.groupName = "partitionGroup"
        mesh.userData.name = "DoorMesh"
        mainGroup.add(mesh)


        const selectedDoorConfiguration = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")


        if (selectedDoorConfiguration?.doorType == "double") {
          let midLinePosition = new Float32Array([
            (tempStart.x + ((length - borderWidth) / 2)), 0, tempStart.y,
            (tempStart.x + ((length - borderWidth) / 2)), wall.height, tempStart.y,
            (tempStart.x + ((length - borderWidth) / 2)) + 2, 0, tempStart.y,

            (tempStart.x + ((length - borderWidth) / 2)) + 2, wall.height, tempStart.y,
            (tempStart.x + ((length - borderWidth) / 2)), wall.height, tempStart.y,
            (tempStart.x + ((length - borderWidth) / 2)) + 2, 0, tempStart.y,
          ])
          let midGeometry = new THREE.BufferGeometry()
          midGeometry.setAttribute('position', new THREE.BufferAttribute(midLinePosition, 3))

          let fillerMaterialCopy = material.clone()
          fillerMaterialCopy.color.set(sideColor)
          let midMesh = new THREE.Mesh(midGeometry, fillerMaterialCopy)
          if (edge.front) {
            midMesh.position.z = midMesh.position.z + 0.2
          } else {
            midMesh.position.z = midMesh.position.z - 0.2
          }
          mainGroup.add(midMesh)
        }






        if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") > 2) {
          if (reducerBlueprint?.importedModels && !isObjEmpty(selectedDoorConfiguration)) {
            let startForHandle = { ...tempStart }
            let startForHinge = { ...tempStart }

            if ((selectedDoorConfiguration?.hinges?.direction == "right") || selectedDoorConfiguration?.doorType == "double") {
              startForHandle.x = startForHandle.x + length - 10
              // startForHinge.x = startForHinge.x + 10.2
            } else {
              startForHandle.x = startForHandle.x + 10
              startForHinge.x = startForHinge.x + length
            }
            startForHinge.z = wall.height - 50
            startForHandle.z = (200 / 2) + 5

            if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "2D" && reducerBlueprint?.configuration2D?.connectWith == "right") {
              startForHinge.y = startForHinge.y + 11
              startForHandle.y = startForHandle.y + 11
            }
            if (edge.front) {
              startForHandle.y = startForHandle.y - 18
              startForHinge.y = startForHinge.y - 5.79
            } else {
              startForHandle.y = startForHandle.y + 18
              startForHinge.y = startForHinge.y + 5.79
            }
            if (selectedDoorConfiguration?.doorType == "single") {
              if (edge.front || reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "3D") {
                items.push(makeCustomMesh(startForHinge, edge, "hinge", selectedDoorConfiguration.hinges.direction == "left"))
                startForHinge.z = 50
                items.push(makeCustomMesh(startForHinge, edge, "hinge", selectedDoorConfiguration.hinges.direction == "left"))
                items.push(makeCustomMesh(startForHandle, edge, "handle"))
              } else {
                items.push(makeCustomMesh(startForHinge, edge, "hinge", selectedDoorConfiguration.hinges.direction == "left"))
                startForHinge.z = 50
                items.push(makeCustomMesh(startForHinge, edge, "hinge", selectedDoorConfiguration.hinges.direction == "left"))
              }
            } else if (selectedDoorConfiguration?.doorType == "double") {
              let tempStartForHinge = { ...startForHinge }
              let tempStartForHandle = { ...startForHandle }
              tempStartForHandle.x = tempStartForHandle.x - ((length + borderWidth) / 2)
              if (edge.front && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "2D") {
                tempStartForHinge.y = tempStartForHinge.y + 3
              }
              if (edge.front || reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "3D") {
                items.push(makeCustomMesh(tempStartForHinge, edge, "hinge"))
                tempStartForHinge.z = 50
                items.push(makeCustomMesh(tempStartForHinge, edge, "hinge"))
                items.push(makeCustomMesh(tempStartForHandle, edge, "handle"))
              }

              tempStartForHinge.x = tempStartForHinge.x + length
              startForHandle.x = (tempStartForHandle.x + 20)
              tempStartForHinge.z = startForHinge.z
              if (edge.front || reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "3D") {
                items.push(makeCustomMesh(tempStartForHinge, edge, "hinge"))
                tempStartForHinge.z = 50
                items.push(makeCustomMesh(tempStartForHinge, edge, "hinge"))
                items.push(makeCustomMesh(startForHandle, edge, "handle"))
              }
            }
          }
        }
        return mainGroup


      }

      function makeCustomMesh(start, edge, type = "handle", rotate = false) {
        let mesh = reducerBlueprint?.importedModels?.[type]
        // console.log(type, "ABS")
        if (type == "handle") {
          // console.log("this is datatu =>", reducerBlueprint?.importedModels, reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedHandle)
          mesh = reducerBlueprint?.importedModels?.[type][
            reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedHandle ?? 0
          ]
          // console.log("this is different mesh = ", mesh)
        }

        let group = new THREE.Group()
        const textureCube = reducerBlueprint?.environmentMap
        mesh.scene.children.forEach(mesh => {
          var meshClone = mesh.clone()
          mesh.material.metalness = 1
          if (type == "hinge") {
            if (rotate) {
              meshClone.rotation.z = Math.PI
            }
            meshClone.scale.x = 0.8
            meshClone.scale.y = 0.8
            meshClone.scale.z = 0.8
          } else {
            meshClone.scale.x = 1
            meshClone.scale.y = 1
            meshClone.scale.z = 1


          }
          if(meshClone.name == "handle"){
            meshClone.position.x = meshClone.position.x - 8
          }
          meshClone.material.envMap = textureCube
          meshClone.material.envMapIntensity = 0.7
          group.add(meshClone)
        })
        if (type == "handle") {
          if (edge.front) {
            group.rotation.y = Math.PI / 2;
          } else {
            group.rotation.y = - Math.PI / 2;
          }
        }

        group.position.x = start.x
        group.position.z = start.y
        group.position.y = start.z || (200 - 10)
        if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "2D" && type == "handle") {
          group.scale.x = 0.01
          group.position.z = start.y + 20
        }
        return group
      }

      function getMeshForPanelBorder(panelStart, panelHeight, panelWidth, color, borderWidth = 5, leftBorder = true, rightBorder = true, makeMid, lines, isDoor, panelPosition, numberOfMesh) {
        var fillerMaterial = new THREE.MeshBasicMaterial({
          color: (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedStep") > 5 || reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedStep") === 3) ? color : sideColor,
          side: THREE.DoubleSide,
        })
        var partitionMaterial = new THREE.MeshBasicMaterial({
          color: (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedStep") > 5 || reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedStep") === 3) ? color : sideColor,
          side: THREE.DoubleSide
        })
        // if (panelPosition == 0) {
        //   borderWidth = borderWidth + 3
        // }

        let leftBorderWidth = borderWidth
        let leftBorderHeight = panelHeight
        let panelZ = panelStart.y
        let partitionBorderWidth = edge.front ? -borderWidth : borderWidth

        let patitionPosition = new Float32Array([
          panelStart.x, 0, panelZ,
          panelStart.x, leftBorderHeight, panelZ,
          panelStart.x + leftBorderWidth, 0, panelZ + partitionBorderWidth,

          panelStart.x, leftBorderHeight, panelZ,
          panelStart.x, leftBorderHeight, panelZ + partitionBorderWidth,
          panelStart.x + leftBorderWidth, 0, panelZ + partitionBorderWidth,
        ])

      
        let leftPosition = new Float32Array([
          panelStart.x, 0, panelZ,
          panelStart.x, leftBorderHeight, panelZ,
          panelStart.x + leftBorderWidth, 0, panelZ,

          panelStart.x + leftBorderWidth, leftBorderHeight, panelZ,
          panelStart.x, leftBorderHeight, panelZ,
          panelStart.x + leftBorderWidth, 0, panelZ,
        ])

        // if (panelPosition > 0 && (panelPosition < numberOfMesh)) {
        //   borderWidth = borderWidth + 3
        // }

        let topPosition = new Float32Array([
          panelStart.x, panelHeight, panelZ,
          panelStart.x + panelWidth, panelHeight, panelZ,
          panelStart.x, panelHeight - borderWidth, panelZ,

          panelStart.x + panelWidth, panelHeight - borderWidth, panelZ,
          panelStart.x + panelWidth, panelHeight, panelZ,
          panelStart.x, panelHeight - borderWidth, panelZ,
        ])

        let bottomPosition = new Float32Array([
          panelStart.x, 0, panelZ,
          panelStart.x + panelWidth, 0, panelZ,
          panelStart.x, borderWidth, panelZ,

          panelStart.x + panelWidth, borderWidth, panelZ,
          panelStart.x + panelWidth, 0, panelZ,
          panelStart.x, borderWidth, panelZ,
        ])

        // if ((panelPosition < (numberOfMesh - 1)) && reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedStep") > 3 ) {
        //   borderWidth = borderWidth - 3
        // }
        let rightPosition = new Float32Array([
          panelStart.x + panelWidth, 0, panelZ,
          panelStart.x + panelWidth, panelHeight, panelZ,
          panelStart.x + panelWidth + borderWidth, 0, panelZ,

          panelStart.x + panelWidth + borderWidth, panelHeight, panelZ,
          panelStart.x + panelWidth, panelHeight, panelZ,
          panelStart.x + panelWidth + borderWidth, 0, panelZ,
        ])

        let partitionGeometry = new THREE.BufferGeometry()
        let topGeometry = new THREE.BufferGeometry()
        let bottomGeometry = new THREE.BufferGeometry()
        let leftGeometry = new THREE.BufferGeometry()
        let rightGeometry = new THREE.BufferGeometry()
        partitionGeometry.setAttribute('position', new THREE.BufferAttribute(patitionPosition, 3))
        topGeometry.setAttribute('position', new THREE.BufferAttribute(topPosition, 3))
        bottomGeometry.setAttribute('position', new THREE.BufferAttribute(bottomPosition, 3))
        leftGeometry.setAttribute('position', new THREE.BufferAttribute(leftPosition, 3))
        rightGeometry.setAttribute('position', new THREE.BufferAttribute(rightPosition, 3))
        let partitionMesh = new THREE.Mesh(partitionGeometry, partitionMaterial)
        let topMesh = new THREE.Mesh(topGeometry, fillerMaterial)
        let bottomMesh = new THREE.Mesh(bottomGeometry, fillerMaterial)
        let leftMesh = new THREE.Mesh(leftGeometry, fillerMaterial)
        let rightMesh = new THREE.Mesh(rightGeometry, fillerMaterial)
        let group = new THREE.Group()
        group.add(topMesh)
        group.add(bottomMesh)
        if (leftBorder) {
          group.add(leftMesh)
        }
          group.add(partitionMesh)

        if (rightBorder) {
          group.add(rightMesh)
        }
        // horizontal mid line lines
        let numberOfHorizontalFrames = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedHorizontalFrames") + 1
        const selectedDoorConfiguration = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")
        let selectedMetalFrameType = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedMetalFrameType")

        // if (selectedDoorConfiguration?.doorGlass) {
        //   numberOfHorizontalFrames = numberOfHorizontalFrames + 1
        // } 
        // if (selectedDoorConfiguration?.doorGlass) {
        //   numberOfHorizontalFrames = selectedDoorConfiguration?.doorGlass + 1 || 0
        // }

        if (selectedMetalFrameType == "Framed single metal glazing" && !isDoor) {

          for (let index = 1; index < lines; index++) {

            let tempHeight = (index) * ((edge.wall.height - 4) / lines)
            let middleHorizontalPositions = new Float32Array([
              panelStart.x, tempHeight, panelStart.y,
              panelStart.x + panelWidth, tempHeight, panelStart.y,
              panelStart.x, tempHeight - (borderWidth - 3), panelStart.y,

              panelStart.x + panelWidth, tempHeight - (borderWidth - 3), panelStart.y,
              panelStart.x + panelWidth, tempHeight, panelStart.y,
              panelStart.x, tempHeight - (borderWidth - 3), panelStart.y,
            ])

            let midGeometry = new THREE.BufferGeometry()
            midGeometry.setAttribute('position', new THREE.BufferAttribute(middleHorizontalPositions, 3))
            let midMesh = new THREE.Mesh(midGeometry, fillerMaterial)
            group.add(midMesh)
          }
        }
        if (selectedDoorConfiguration?.doorGlass && makeMid) {
          lines = lines + 1
          for (let index = 1; index < lines; index++) {
            let tempHeight = (index) * ((edge.wall.height - 4) / lines)
            
            let middleHorizontalPositions = new Float32Array([
              panelStart.x, tempHeight, panelStart.y,
              panelStart.x + panelWidth, tempHeight, panelStart.y,
              panelStart.x, tempHeight - (borderWidth - 3), panelStart.y,

              panelStart.x + panelWidth, tempHeight - (borderWidth - 3), panelStart.y,
              panelStart.x + panelWidth, tempHeight, panelStart.y,
              panelStart.x, tempHeight - (borderWidth - 3), panelStart.y,
            ])

            let midGeometry = new THREE.BufferGeometry()
            midGeometry.setAttribute('position', new THREE.BufferAttribute(middleHorizontalPositions, 3))
            let midDoorMesh = new THREE.Mesh(midGeometry, fillerMaterial)
            group.add(midDoorMesh)
          }
        }
        return group
      }

      function buildSideFillter(p1, p2, height, color, meshName = "") {
        // let defaultColor = reducerBlueprint?.BP3DData?.globals?.getGlobal("frameVariants")?.find((e)=>e.isDefault)
        // color=(color||defaultColor?.type)
        if (edge.wall === reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[4] && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") > 5) {
          color = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedColorVariant")
        }
        const count = 2;
        const positionsArray = new Float32Array(count * 3 * 3)
        const positionsArrayValues = [
          p1?.x, 0, p1?.y,
          p2?.x, 0, p2?.y,
          p2?.x, height, p2?.y,
          p1?.x, height, p1?.y,
          p2?.x, height, p2?.y,
          p1?.x, 0, p1?.y
        ]
        for (let i = 0; i < count * 3 * 3; i++) {
          positionsArray[i] = positionsArrayValues[i]
        }
        const positionsAttributes = new THREE.BufferAttribute(positionsArray, 3)
        var geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', positionsAttributes)

        var fillerMaterial = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
        });
        var filler = new THREE.Mesh(geometry, fillerMaterial);
        filler.name = meshName
        return filler;
      }

      // create walls for 3D
      function buildFiller(edge, height, side, color) {
        if (edge.wall === reducerBlueprint?.BP3DData?.floorplanner?.floorplan?.walls[4] && reducerBlueprint?.BP3DData?.globals.getGlobal("selectedStep") > 5) {
          color = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedColorVariant")
        }
        var points = [
          toVec2(edge.exteriorStart()),
          toVec2(edge.exteriorEnd()),
          toVec2(edge.interiorEnd()),
          toVec2(edge.interiorStart())
        ];


        // // console.log("good all edges = ", points)
        var fillerMaterial = new THREE.MeshBasicMaterial({
          color: color,
          side: side
        });
        var shape = new THREE.Shape(points);

        var geometry = new THREE.ShapeGeometry(shape);
        var filler = new THREE.Mesh(geometry, fillerMaterial);
        filler.rotation.set(Math.PI / 2, 0, 0);
        filler.position.y = height;
        let group = new THREE.Group()
        if (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedStep") > 2) {
          let filler2 = filler.clone()
          filler2.position.y = filler2.position.y - 5 
          group.add(filler, filler2)
        } else {
          group.add(filler)
        }
        return group;
      }

      function buildIndicatorVertical(edge, height = 200) {
        const geometry = new THREE.BoxGeometry(0, 5, edge.wall.getLength() - 5);
        let wallLength = Math.floor(edge.wall.getLength() * reducerBlueprint?.perCmEqualToMm)
        const textGeometry = new TextGeometry(`${wallLength}mm`, {
          font: reducerBlueprint?.indicatorFont,
          size: 10,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1
        });
        const textBackgroundGeometry = new THREE.BoxGeometry(0, 15, wallLength.toString().length > 3 ? 60 : 45)
        const material = new THREE.MeshBasicMaterial({ color: "#cbaf87" });
        const textMaterial = new THREE.MeshBasicMaterial({ color: "#475a6f" });
        const textBackgroundMaterial = new THREE.MeshBasicMaterial({ color: "#FAFAFA" });
        const indicatorMesh = new THREE.Mesh(geometry, material);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        const textBackgroundMesh = new THREE.Mesh(textBackgroundGeometry, textBackgroundMaterial)


        indicatorMesh.position.y = 5

        textBackgroundMesh.position.z = wallLength.toString().length > 3 ? -4 : 2
        textBackgroundMesh.position.y = 2
        textBackgroundMesh.position.x = 1


        textMesh.position.z = 23
        textMesh.rotation.y = Math.PI / 2
        textMesh.position.x = 2

        // add mesh into group of text, textbackground and plane
        const indicator = new THREE.Group()
        if (wallLength.toString().length > 3) {
          indicator.add(indicatorMesh)
        }
        indicator.add(textMesh)
        indicator.add(textBackgroundMesh)

        // group changes
        indicator.position.x = edge.wall.end.x + 10
        indicator.position.y = height + 35
        indicator.position.z = (edge.wall.start.y + (edge.wall.end.y)) / 2

        return indicator
      }

      function buildIndicatorForHeightVertical(edge, height = 200) {
        const geometry = new THREE.BoxGeometry(0, height - 5, 5);
        const textGeometry = new TextGeometry(`${Math.floor(configuratorData?.roomHeight)} mm`, {
          font: reducerBlueprint?.indicatorFont,
          size: 10,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1
        });
        const textBackgroundGeometry = new THREE.BoxGeometry(0, 15, 40)
        const material = new THREE.MeshBasicMaterial({ color: "#cbaf87" });
        const textMaterial = new THREE.MeshBasicMaterial({ color: "#475a6f" });
        const textBackgroundMaterial = new THREE.MeshBasicMaterial({ color: "#FAFAFA" });
        const indicatorMesh = new THREE.Mesh(geometry, material);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        const textBackgroundMesh = new THREE.Mesh(textBackgroundGeometry, textBackgroundMaterial)


        indicatorMesh.position.y = 5

        textBackgroundMesh.position.z = 10
        textBackgroundMesh.position.y = 5
        textBackgroundMesh.position.x = 1


        textMesh.position.z = 23
        textMesh.rotation.y = Math.PI / 2
        textMesh.position.x = 2

        // add mesh into group of text, textbackground and plane
        const indicator = new THREE.Group()
        indicator.add(indicatorMesh)
        indicator.add(textMesh)
        indicator.add(textBackgroundMesh)

        // group changes
        indicator.position.x = edge.wall.end.x + 10
        indicator.position.y = (height - 10) / 2
        indicator.position.z = edge.wall.start.y + 35
        return indicator
      }


      function buildIndicatorHorizontal(edge, height = 200) {
        const geometry = new THREE.BoxGeometry(edge.wall.getLength() - 5, 5, 0);
        let wallLength = Math.floor(edge.wall.getLength() * reducerBlueprint?.perCmEqualToMm)
        const textGeometry = new TextGeometry(`${wallLength} mm`, {
          font: reducerBlueprint?.indicatorFont,
          size: 10,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1
        });
        const textBackgroundGeometry = new THREE.BoxGeometry(wallLength.toString().length > 3 ? 70 : 55, 15, 0)
        const material = new THREE.MeshBasicMaterial({ color: "#cbaf87" });
        const textMaterial = new THREE.MeshBasicMaterial({ color: "#475a6f" });
        const textBackgroundMaterial = new THREE.MeshBasicMaterial({ color: "#FAFAFA" });
        const indicatorMesh = new THREE.Mesh(geometry, material);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        const textBackgroundMesh = new THREE.Mesh(textBackgroundGeometry, textBackgroundMaterial)


        indicatorMesh.position.y = 5
        textBackgroundMesh.position.z = 1
        textBackgroundMesh.position.y = 2
        textBackgroundMesh.position.x = wallLength.toString().length > 3 ? 4 : -1


        textMesh.position.z = 2
        // textMesh.rotation.y = Math.PI / 2
        textMesh.position.x = -26

        // add mesh into group of text, textbackground and plane
        const indicator = new THREE.Group()
        if (wallLength.toString().length > 3) {
          indicator.add(indicatorMesh)
        }
        indicator.add(textMesh)
        indicator.add(textBackgroundMesh)

        // group changes
        indicator.position.z = edge.wall.end.y + 10
        indicator.position.y = height + 40
        indicator.position.x = (edge.wall.start.x + (edge.wall.end.x)) / 2

        return indicator
      }

      function buildIndicatorForHeightHorizontal(edge, height = 200) {
        const geometry = new THREE.BoxGeometry(5, height - 5, 0);
        const textGeometry = new TextGeometry(`${Math.floor(configuratorData?.roomHeight)} mm`, {
          font: reducerBlueprint?.indicatorFont,
          size: 10,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1
        });
        const textBackgroundGeometry = new THREE.BoxGeometry(0, 15, 40)
        const material = new THREE.MeshBasicMaterial({ color: "#cbaf87" });
        const textMaterial = new THREE.MeshBasicMaterial({ color: "#475a6f" });
        const textBackgroundMaterial = new THREE.MeshBasicMaterial({ color: "#FAFAFA" });
        const indicatorMesh = new THREE.Mesh(geometry, material);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        const textBackgroundMesh = new THREE.Mesh(textBackgroundGeometry, textBackgroundMaterial)


        indicatorMesh.position.y = 5

        textBackgroundMesh.position.x = 0
        textBackgroundMesh.position.y = 5
        textBackgroundMesh.position.z = 1
        textBackgroundMesh.rotation.y = Math.PI / 2

        textMesh.position.x = -26
        // textMesh.rotation.y = Math.PI / 2
        textMesh.position.z = 2

        // add mesh into group of text, textbackground and plane
        const indicator = new THREE.Group()
        indicator.add(indicatorMesh)
        indicator.add(textMesh)
        indicator.add(textBackgroundMesh)

        // group changes
        indicator.position.x = edge.wall.end.x - 40
        indicator.position.y = (height - 10) / 2
        indicator.position.z = edge.wall.start.y + 10
        return indicator
      }

      function buildIndicatorForDoorHorizontal(edge, height = 200) {
        let doorLength = (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize || 0) / reducerBlueprint?.perCmEqualToMm
        let selectedDoorSize = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize
        let doorStart = (reducerBlueprint?.BP3DData?.globals.getGlobal("doorStartVector")) || { x: 0, y: 0 }
        const geometry = new THREE.BoxGeometry(doorLength, 5, 0);
        let wallLength = Math.floor(edge.wall.getLength() * reducerBlueprint?.perCmEqualToMm)
        const textGeometry = new TextGeometry(`${selectedDoorSize} mm`, {
          font: reducerBlueprint?.indicatorFont,
          size: 10,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1
        });
        const textBackgroundGeometry = new THREE.BoxGeometry(wallLength.toString().length > 3 ? 70 : 55, 15, 0)
        const material = new THREE.MeshBasicMaterial({ color: "#cbaf87" });
        const textMaterial = new THREE.MeshBasicMaterial({ color: "#475a6f" });
        const textBackgroundMaterial = new THREE.MeshBasicMaterial({ color: "#FAFAFA" });
        const indicatorMesh = new THREE.Mesh(geometry, material);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        const textBackgroundMesh = new THREE.Mesh(textBackgroundGeometry, textBackgroundMaterial)


        indicatorMesh.position.y = 5
        textBackgroundMesh.position.z = 1
        textBackgroundMesh.position.y = 2
        textBackgroundMesh.position.x = wallLength.toString().length > 3 ? 4 : -1


        textMesh.position.z = 2
        // textMesh.rotation.y = Math.PI / 2
        textMesh.position.x = -26

        // add mesh into group of text, textbackground and plane
        const indicator = new THREE.Group()
        if (wallLength.toString().length > 3) {
          indicator.add(indicatorMesh)
        }
        indicator.add(textMesh)
        indicator.add(textBackgroundMesh)

        // group changes
        indicator.position.z = edge.wall.end.y + 10
        indicator.position.y = -40
        indicator.position.x = (doorStart.x + (doorStart.x + selectedDoorSize / reducerBlueprint?.perCmEqualToMm)) / 2

        return indicator
      }
      function buildLeftIndicatorForDoorHorizontal(edge, height = 200) {
        let doorStart = (reducerBlueprint?.BP3DData?.globals.getGlobal("doorStartVector")) || { x: 0, y: 0 }
        let wallLength = Math.floor(edge.wall.getLength() * reducerBlueprint?.perCmEqualToMm)
        let leftLength = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize ? Math.abs(doorStart.x - edge.wall.end.x) : wallLength

        const geometry = new THREE.BoxGeometry(leftLength, 5, 0);
        const textGeometry = new TextGeometry(`${BP3D.Core.Dimensioning.cmToMeasure(leftLength)} mm`, {
          font: reducerBlueprint?.indicatorFont,
          size: 10,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1
        });
        const textBackgroundGeometry = new THREE.BoxGeometry(wallLength.toString().length > 3 ? 70 : 55, 15, 0)
        const material = new THREE.MeshBasicMaterial({ color: "#cbaf87" });
        const textMaterial = new THREE.MeshBasicMaterial({ color: "#475a6f" });
        const textBackgroundMaterial = new THREE.MeshBasicMaterial({ color: "#FAFAFA" });
        const indicatorMesh = new THREE.Mesh(geometry, material);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        const textBackgroundMesh = new THREE.Mesh(textBackgroundGeometry, textBackgroundMaterial)


        indicatorMesh.position.y = 5
        textBackgroundMesh.position.z = 1
        textBackgroundMesh.position.y = 2
        textBackgroundMesh.position.x = wallLength.toString().length > 3 ? 4 : -1


        textMesh.position.z = 2
        // textMesh.rotation.y = Math.PI / 2
        textMesh.position.x = -26

        // add mesh into group of text, textbackground and plane
        const indicator = new THREE.Group()
        if (wallLength.toString().length > 3) {
          indicator.add(indicatorMesh)
        }
        indicator.add(textBackgroundMesh)
        indicator.add(textMesh)

        // group changes
        indicator.position.z = edge.wall.end.y + 10
        indicator.position.y = -40
        indicator.position.x = ((edge.wall.end.x + doorStart.x) / 2) - 4

        if (leftLength == 0) {
          indicator.visible = false
        }
        return indicator
      }
      function buildRightIndicatorForDoorHorizontal(edge, height = 200) {
        let doorLength = (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize || 0) / reducerBlueprint?.perCmEqualToMm
        let doorStart = (reducerBlueprint?.BP3DData?.globals.getGlobal("doorStartVector")) || { x: 0, y: 0 }
        let wallLength = Math.floor(edge.wall.getLength() * reducerBlueprint?.perCmEqualToMm)
        // let leftLength = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize ? Math.abs(doorStart.x - edge.wall.start.x) : wallLength
        let rightLength = Math.abs((doorStart.x + doorLength) - (edge.wall.start.x))
        const geometry = new THREE.BoxGeometry(rightLength, 5, 0);
        const textGeometry = new TextGeometry(`${BP3D.Core.Dimensioning.cmToMeasure(rightLength)} mm`, {
          font: reducerBlueprint?.indicatorFont,
          size: 10,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1
        });
        const textBackgroundGeometry = new THREE.BoxGeometry(wallLength.toString().length > 3 ? 70 : 55, 15, 0)
        const material = new THREE.MeshBasicMaterial({ color: "#cbaf87" });
        const textMaterial = new THREE.MeshBasicMaterial({ color: "#475a6f" });
        const textBackgroundMaterial = new THREE.MeshBasicMaterial({ color: "#FAFAFA" });
        const indicatorMesh = new THREE.Mesh(geometry, material);
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        const textBackgroundMesh = new THREE.Mesh(textBackgroundGeometry, textBackgroundMaterial)

        indicatorMesh.position.y = 5
        textBackgroundMesh.position.z = 1
        textBackgroundMesh.position.y = 2
        textBackgroundMesh.position.x = wallLength.toString().length > 3 ? 4 : -1

        textMesh.position.z = 2
        // textMesh.rotation.y = Math.PI / 2
        textMesh.position.x = -26

        // add mesh into group of text, textbackground and plane
        const indicator = new THREE.Group()
        if (wallLength.toString().length > 3) {
          indicator.add(indicatorMesh)
        }
        indicator.add(textMesh)
        indicator.add(textBackgroundMesh)
        console.log(edge.wall.start.x + doorStart.x, "doorLength");

        // group changes
        indicator.position.z = edge.wall.end.y + 10
        indicator.position.y = -40
        indicator.position.x = reducerBlueprint?.BP3DData?.globals.getGlobal("selectedDoorConfiguration")?.selectedDoorSize > 920 ? ((edge.wall.start.x + doorStart.x) / 2) + 90 : ((edge.wall.start.x + doorStart.x + doorLength) / 2) + 4
        if (rightLength == 0) {
          indicator.visible = false
        }
        return indicator
      }

      function buildFillerFor2DVertical(edge, height = edge.wall.height, color) {
        const topGeometry = new THREE.BoxGeometry(0, 4, edge.wall.getLength());
        const bottomGeomertry = new THREE.BoxGeometry(0, 4, edge.wall.getLength());
        const leftGeometry = new THREE.BoxGeometry(0, height, 4);
        const rigthGeometry = new THREE.BoxGeometry(0, height, 4);
        const material = new THREE.MeshBasicMaterial({ color: color, });
        const topFillterMesh = new THREE.Mesh(topGeometry, material);
        const bottomFillterMesh = new THREE.Mesh(bottomGeomertry, material);
        const leftFillterMesh = new THREE.Mesh(leftGeometry, material);
        const rightFillterMesh = new THREE.Mesh(rigthGeometry, material);

        topFillterMesh.position.y = height
        bottomFillterMesh.position.y = 2

        leftFillterMesh.position.y = height / 2
        rightFillterMesh.position.y = height / 2
        leftFillterMesh.position.z = -(edge.wall.getLength() + 2) / 2
        rightFillterMesh.position.z = (edge.wall.getLength() - 2) / 2

        const group = new THREE.Group()
        group.add(topFillterMesh)
        group.add(bottomFillterMesh)
        group.add(leftFillterMesh)
        group.add(rightFillterMesh)
        group.position.x = edge.wall.end.x
        group.position.z = (edge.wall.start.y + (edge.wall.end.y)) / 2
        return group
      }

      function buildFillerFor2DHorizontal(edge, height = edge.wall.height, color) {
        const topGeometry = new THREE.BoxGeometry(0, 4, edge.wall.getLength());
        const bottomGeomertry = new THREE.BoxGeometry(0, 4, edge.wall.getLength());
        const leftGeometry = new THREE.BoxGeometry(0, height, 4);
        const rigthGeometry = new THREE.BoxGeometry(0, height, 4);
        const material = new THREE.MeshBasicMaterial({ color: color, });
        const topFillterMesh = new THREE.Mesh(topGeometry, material);
        const bottomFillterMesh = new THREE.Mesh(bottomGeomertry, material);
        const leftFillterMesh = new THREE.Mesh(leftGeometry, material);
        const rightFillterMesh = new THREE.Mesh(rigthGeometry, material);

        topFillterMesh.position.y = height - 1
        bottomFillterMesh.position.y = 2

        leftFillterMesh.position.y = height / 2
        rightFillterMesh.position.y = height / 2
        leftFillterMesh.position.z = -edge.wall.getLength() / 2
        rightFillterMesh.position.z = edge.wall.getLength() / 2

        const group = new THREE.Group()
        group.add(topFillterMesh)
        group.add(bottomFillterMesh)
        group.add(leftFillterMesh)
        group.add(rightFillterMesh)
        group.position.x = (edge.wall.start.x + (edge.wall.end.x)) / 2
        group.position.z = (edge.wall.start.y + (edge.wall.end.y)) / 2
        group.rotation.y = Math.PI / 2
        return group
      }

      function buildPanelSizeLabelVertical(edge, height = edge.wall.height) {
        const textGeometry = new TextGeometry(`Selected Panel Size: ${Math.floor(reducerBlueprint?.selectedPanelSize)}mm`, {
          font: reducerBlueprint?.indicatorFont,
          size: 12,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1,
        });

        const textMaterial = new THREE.MeshBasicMaterial({ color: "#475a6f" });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        textMesh.position.z = ((edge.wall.start.y + (edge.wall.end.y)) / 2) + 110
        textMesh.position.y = -25
        textMesh.rotation.y = Math.PI / 2
        textMesh.position.x = edge.wall.end.x + 10
        return textMesh
      }

      function buildPanelSizeLabelHorizontal(edge, height = edge.wall.height) {
        const textGeometry = new TextGeometry(`Selected Panel Size: ${Math.floor(reducerBlueprint?.selectedPanelSize)}mm`, {
          font: reducerBlueprint?.indicatorFont,
          size: 12,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 1,
        });

        const textMaterial = new THREE.MeshBasicMaterial({ color: "#475a6f" });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial)
        textMesh.position.z = edge.wall.end.y + 10
        textMesh.position.y = -25
        textMesh.position.x = ((edge.wall.start.x + (edge.wall.end.x)) / 2) - 110
        return textMesh
      }

      function buildHorizontalFrames(edge, height = edge.height, color) {
        const count = 2;
        let p1 = edge.interiorStart()
        let p2 = edge.interiorEnd()
        const positionsArray = new Float32Array(count * 3 * 3)
        const positionsArrayValues = [
          p1?.x, 0, p1?.y,
          p2?.x, 0, p2?.y,
          p2?.x, 4, p2?.y,
          p1?.x, 4, p1?.y,
          p2?.x, 4, p2?.y,
          p1?.x, 0, p1?.y
        ]
        for (let i = 0; i < count * 3 * 3; i++) {
          positionsArray[i] = positionsArrayValues[i]
        }
        const positionsAttributes = new THREE.BufferAttribute(positionsArray, 3)
        var geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', positionsAttributes)

        var fillerMaterial = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
        });
        var filler = new THREE.Mesh(geometry, fillerMaterial);
        filler.position.y = height
        if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "2D" && reducerBlueprint?.configuration2D?.connectWith == "left") {
          filler.position.z = 11
        }
        return filler;

      }

      function buildSideFrames(edge, height = edge.height, color) {
        const count = 2;
        const positionsArray = new Float32Array(count * 3 * 3)
        let p1 = edge.interiorStart()
        let p2 = {
          x: p1.x + 4,
          y: p1.y
        }

        const positionsArrayValues = [
          p1?.x, 0, p1?.y,
          p2?.x, 0, p2?.y,
          p2?.x, height, p2?.y,
          p1?.x, height, p1?.y,
          p2?.x, height, p2?.y,
          p1?.x, 0, p1?.y
        ]
        for (let i = 0; i < count * 3 * 3; i++) {
          positionsArray[i] = positionsArrayValues[i]
        }
        const positionsAttributes = new THREE.BufferAttribute(positionsArray, 3)
        var geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', positionsAttributes)

        var fillerMaterial = new THREE.MeshBasicMaterial({
          color: color,
          side: THREE.DoubleSide,
        });
        var filler = new THREE.Mesh(geometry, fillerMaterial);
        var filler2 = new THREE.Mesh(geometry, fillerMaterial);

        if (reducerBlueprint?.BP3DData?.globals.getGlobal("selectedType") == "3D") {
          if (edge.front) {
            if (reducerBlueprint?.configuration2D?.connectWith == "right") {
              filler2.position.x = (filler2.position.x - edge.wall.getLength())
              filler.position.x = -4
            } else {
              filler2.position.x = (filler2.position.x + edge.wall.getLength()) - 4
            }
          } else {
            if (reducerBlueprint?.configuration2D?.connectWith == "right") {
              filler2.position.x = (filler2.position.x + edge.wall.getLength()) - 4
            } else {
              filler2.position.x = filler2.position.x - edge.wall.getLength()
              filler.position.x = -4
            }
          }
        } else {
          if (reducerBlueprint?.configuration2D?.connectWith == "right") {
            filler2.position.x = filler2.position.x + edge.wall.getLength() - 4
            filler.position.x = filler.position.x
          } else {
            filler2.position.x = filler2.position.x - edge.wall.getLength()
            filler2.position.z = filler2.position.z + 11
            filler.position.z = 11
          }

        }
        return [filler, filler2];

      }

      function toVec2(pos) {
        return new THREE.Vector2(pos.x, pos.y);
      }

      function toVec3(pos, height) {
        height = height || 0;
        return new THREE.Vector3(pos.x, height, pos.y);
      }
      init();
    };
  })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Three;
  (function (Three) {
    Three.Floorplan = function (scene, floorplan, controls) {
      var scope = this;
      this.scene = scene;
      this.floorplan = floorplan;
      this.controls = controls;
      this.floors = [];
      this.edges = [];
      floorplan.fireOnUpdatedRooms(redraw);

      function redraw() {
        // clear scene
        scope.floors.forEach(function (floor) {
          floor.removeFromScene();
        });
        scope.edges.forEach(function (edge) {
          edge.remove();
        });
        scope.floors = [];
        scope.edges = [];
        // draw floors
        scope.floorplan.getRooms().forEach(function (room) {
          var threeFloor = new Three.Floor(scene, room);
          scope.floors.push(threeFloor);
          threeFloor.addToScene();
        });
        // draw edges
        scope.floorplan.wallEdges().forEach(function (edge) {
          var threeEdge = new Three.Edge(scene, edge, scope.controls);
          scope.edges.push(threeEdge);
        });
      }
    };
  })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Three;
  (function (Three) {
    Three.Lights = function (scene, floorplan) {
      // var scope = this;
      // var scene = scene;
      // var floorplan = floorplan;
      var tol = 1;
      var height = 300; // TODO: share with Blueprint.Wall
      var dirLight;
      this.getDirLight = function () {
        return dirLight;
      };

      function init() {
        var light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.2);
        light.position.set(0, height, 0);
        scene.add(light);

        // add some lighting
        var ambientLight = new THREE.AmbientLight(0xffffff);

        scene.add(ambientLight);
        var spotLight = new THREE.SpotLight(0xffffff);
        spotLight.position.set(-10, 10, 10);
        spotLight.castShadow = true;
        // spotLight.shadow = new THREE.SpotLightShadow(new THREE.PerspectiveCamera(20, 1, 1, 250));
        spotLight.angle = 1.0471975511965976
        spotLight.penumbra = 1
        spotLight.intensity = 1

        // const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
        // directionalLight.position.set(1, 1, 1);
  
        // scene.add(directionalLight);

        scene.add(spotLight);

        dirLight = new THREE.DirectionalLight(0Xffffff, 0.6);
        dirLight.position.set(500, height, 700);
        dirLight.castShadow = true;
        dirLight.target.position.set(0, 0, 0);
        const pointLight = new THREE.PointLight(0xff0000, 1, 100);
        pointLight.position.set(0, 100, 0);
        // scene.add( pointLight );

        // dirLight.shadow.mapSize.width = 512;
        // dirLight.shadow.mapSize.height = 512;
        // dirLight.shadow.camera.near = 0.5;
        // dirLight.shadow.camera.far = 500;
        // dirLight.shadow.bias = -0.0001;
        // scene.add(dirLight);
        // scene.add(dirLight.target);

        dirLight.visible = true;

        floorplan.fireOnUpdatedRooms(updateShadowCamera);
      }



      function updateShadowCamera() {
        var size = floorplan.getSize();
        // var d = (Math.max(size.z, size.x) + tol) / 2.0;
        var d = 800
        var center = floorplan.getCenter();
        var pos = new THREE.Vector3(center.x + 100, height, center.z + 60);
        dirLight.position.copy(pos);
        dirLight.target.position.copy(center);
        //dirLight.updateMatrix();
        dirLight.updateWorldMatrix()
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.camera.updateProjectionMatrix();
        // this is necessary for updates
        if (dirLight.shadowCamera) {
          dirLight.shadowCamera.left = dirLight.shadowCameraLeft;
          dirLight.shadowCamera.right = dirLight.shadowCameraRight;
          dirLight.shadowCamera.top = dirLight.shadowCameraTop;
          dirLight.shadowCamera.bottom = dirLight.shadowCameraBottom;
          dirLight.shadowCamera.updateProjectionMatrix();
        }
      }
      init();
    };
  })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Three;
  (function (Three) {
    Three.Skybox = function (scene) {
      // var scope = this;
      // var scene = scene;
      var topColor = '0xffffff'; //0xD8ECF9
      var bottomColor = 0xe9e9e9; //0xf9f9f9;//0x565e63
      var verticalOffset = 500;
      var sphereRadius = 4000;
      var widthSegments = 32;
      var heightSegments = 15;
      var vertexShader = [
        "varying vec3 vWorldPosition;",
        "void main() {",
        "  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
        "  vWorldPosition = worldPosition.xyz;",
        "  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
        "}"
      ].join('\n');
      var fragmentShader = [
        "uniform vec3 topColor;",
        "uniform vec3 bottomColor;",
        "uniform float offset;",
        "varying vec3 vWorldPosition;",
        "void main() {",
        "  float h = normalize( vWorldPosition + offset ).y;",
        "  gl_FragColor = vec4( mix( bottomColor, topColor, (h + 1.0) / 2.0), 1.0 );",
        "}"
      ].join('\n');

      function init() {
        var uniforms = {
          topColor: {
            type: "c",
            value: new THREE.Color(topColor)
          },
          bottomColor: {
            type: "c",
            value: new THREE.Color(bottomColor)
          },
          offset: {
            type: "f",
            value: verticalOffset
          }
        };
        var skyGeo = new THREE.SphereGeometry(sphereRadius, widthSegments, heightSegments);
        var skyMat = new THREE.ShaderMaterial({
          vertexShader: vertexShader,
          fragmentShader: fragmentShader,
          uniforms: uniforms,
          side: THREE.BackSide
        });
        var sky = new THREE.Mesh(skyGeo, skyMat);
        scene.add(sky);
      }
      init();
    };
  })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));
/**
This file is a modified version of THREE.OrbitControls
Contributors:
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Three;
  (function (Three) {
    Three.Controls = function (object, domElement) {
      this.object = object;
      this.domElement = (domElement !== undefined) ? domElement : document;
      // Set to false to disable this control
      this.enabled = true;
      // "target" sets the location of focus, where the control orbits around
      // and where it pans with respect to.
      this.target = new THREE.Vector3();
      // center is old, deprecated; use "target" instead
      this.center = this.target;
      // This option actually enables dollying in and out; left as "zoom" for
      // backwards compatibility
      this.noZoom = false;
      this.zoomSpeed = 1.0;
      // Limits to how far you can dolly in and out
      this.minDistance = 0;
      this.maxDistance = 1500; //Infinity;
      // Set to true to disable this control
      this.noRotate = false;
      this.rotateSpeed = 1.0;
      // Set to true to disable this control
      this.noPan = false;
      this.keyPanSpeed = 40.0; // pixels moved per arrow key push
      // Set to true to automatically rotate around the target
      this.autoRotate = false;
      this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60
      // How far you can orbit vertically, upper and lower limits.
      // Range is 0 to Math.PI radians.
      this.minPolarAngle = 0; // radians
      this.maxPolarAngle = Math.PI / 2; // radians
      // Set to true to disable use of the keys
      this.noKeys = false;
      // The four arrow keys
      this.keys = {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        BOTTOM: 40
      };
      this.cameraMovedCallbacks = $.Callbacks();
      this.needsUpdate = true;
      // internals
      var scope = this;
      var EPS = 0.000001;
      var rotateStart = new THREE.Vector2();
      var rotateEnd = new THREE.Vector2();
      var rotateDelta = new THREE.Vector2();
      var panStart = new THREE.Vector2();
      var panEnd = new THREE.Vector2();
      var panDelta = new THREE.Vector2();
      var dollyStart = new THREE.Vector2();
      var dollyEnd = new THREE.Vector2();
      var dollyDelta = new THREE.Vector2();
      var phiDelta = 0;
      var thetaDelta = 0;
      var scale = 1;
      var pan = new THREE.Vector3();
      var STATE = {
        NONE: -1,
        ROTATE: 0,
        DOLLY: 1,
        PAN: 2,
        TOUCH_ROTATE: 3,
        TOUCH_DOLLY: 4,
        TOUCH_PAN: 5
      };
      var state = STATE.NONE;
      this.controlsActive = function () {
        return (state === STATE.NONE);
      };
      this.setPan = function (vec3) {
        pan = vec3;
      };
      this.panTo = function (vec3) {
        var newTarget = new THREE.Vector3(vec3.x, scope.target.y, vec3.z);
        var delta = scope.target.clone().sub(newTarget);
        pan.sub(delta);
        scope.update();
      };
      this.rotateLeft = function (angle) {
        if (angle === undefined) {
          angle = getAutoRotationAngle();
        }
        thetaDelta -= angle;
      };
      this.rotateUp = function (angle) {
        if (angle === undefined) {
          angle = getAutoRotationAngle();
        }
        phiDelta -= angle;
      };
      // pass in distance in world space to move left
      this.panLeft = function (distance) {
        var panOffset = new THREE.Vector3();
        var te = this.object.matrix.elements;
        // get X column of matrix
        panOffset.set(te[0], 0, te[2]);
        panOffset.normalize();
        panOffset.multiplyScalar(-distance);
        pan.add(panOffset);
      };
      // pass in distance in world space to move up
      this.panUp = function (distance) {
        var panOffset = new THREE.Vector3();
        var te = this.object.matrix.elements;
        // get Y column of matrix
        panOffset.set(te[4], 0, te[6]);
        panOffset.normalize();
        panOffset.multiplyScalar(distance);
        pan.add(panOffset);
      };
      // main entry point; pass in Vector2 of change desired in pixel space,
      // right and down are positive
      this.pan = function (delta) {
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        if (scope.object.fov !== undefined) {
          // perspective
          var position = scope.object.position;
          var offset = position.clone().sub(scope.target);
          var targetDistance = offset.length();
          // half of the fov is center to top of screen
          targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
          // we actually don't use screenWidth, since perspective camera is fixed to screen height
          scope.panLeft(2 * delta.x * targetDistance / element.clientHeight);
          scope.panUp(2 * delta.y * targetDistance / element.clientHeight);
        } else if (scope.object.top !== undefined) {
          // orthographic
          scope.panLeft(delta.x * (scope.object.right - scope.object.left) / element.clientWidth);
          scope.panUp(delta.y * (scope.object.top - scope.object.bottom) / element.clientHeight);
        } else {
          // camera neither orthographic or perspective - warn user
          console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
        }
        scope.update();
      };
      this.panXY = function (x, y) {
        scope.pan(new THREE.Vector2(x, y));
      };
      this.dollyIn = function (dollyScale) {
        if (dollyScale === undefined) {
          dollyScale = getZoomScale();
        }
        scale /= dollyScale;
      };
      this.dollyOut = function (dollyScale) {
        if (dollyScale === undefined) {
          dollyScale = getZoomScale();
        }
        scale *= dollyScale;
      };
      this.update = function () {
        var position = this.object.position;
        var offset = position.clone().sub(this.target);
        // angle from z-axis around y-axis
        var theta = Math.atan2(offset.x, offset.z);
        // angle from y-axis
        var phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
        if (this.autoRotate) {
          this.rotateLeft(getAutoRotationAngle());
        }
        theta += thetaDelta;
        phi += phiDelta;
        // restrict phi to be between desired limits
        phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
        // restrict phi to be betwee EPS and PI-EPS
        phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
        var radius = offset.length() * scale;
        // restrict radius to be between desired limits
        radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));
        // move target to panned location
        this.target.add(pan);
        offset.x = radius * Math.sin(phi) * Math.sin(theta);
        offset.y = radius * Math.cos(phi);
        offset.z = radius * Math.sin(phi) * Math.cos(theta);
        position.copy(this.target).add(offset);
        this.object.lookAt(this.target);
        thetaDelta = 0;
        phiDelta = 0;
        scale = 1;
        pan.set(0, 0, 0);
        this.cameraMovedCallbacks.fire();
        this.needsUpdate = true;
      };

      function getAutoRotationAngle() {
        return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
      }

      function getZoomScale() {
        return Math.pow(0.95, scope.zoomSpeed);
      }

      function onMouseDown(event) {
        if (scope.enabled === false) {
          return;
        }
        event.preventDefault();
        if (event.button === 0) {
          if (scope.noRotate === true) {
            return;
          }
          state = STATE.ROTATE;
          rotateStart.set(event.clientX, event.clientY);
        } else if (event.button === 1) {
          if (scope.noZoom === true) {
            return;
          }
          state = STATE.DOLLY;
          dollyStart.set(event.clientX, event.clientY);
        } else if (event.button === 2) {
          if (scope.noPan === true) {
            return;
          }
          state = STATE.PAN;
          panStart.set(event.clientX, event.clientY);
        }
        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        scope.domElement.addEventListener('mousemove', onMouseMove, false);
        scope.domElement.addEventListener('mouseup', onMouseUp, false);
      }

      function onMouseMove(event) {
        if (scope.enabled === false || reducerBlueprint?.selectedType == "2D")
          return;
        event.preventDefault();
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        if (state === STATE.ROTATE) {
          if (scope.noRotate === true)
            return;
          rotateEnd.set(event.clientX, event.clientY);
          rotateDelta.subVectors(rotateEnd, rotateStart);
          // rotating across whole screen goes 360 degrees around
          scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
          // rotating up and down along whole screen attempts to go 360, but limited to 180
          scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
          rotateStart.copy(rotateEnd);
        } else if (state === STATE.DOLLY) {
          if (scope.noZoom === true)
            return;
          dollyEnd.set(event.clientX, event.clientY);
          dollyDelta.subVectors(dollyEnd, dollyStart);
          if (dollyDelta.y > 0) {
            scope.dollyIn();
          } else {
            scope.dollyOut();
          }
          dollyStart.copy(dollyEnd);
        } else if (state === STATE.PAN) {
          if (scope.noPan === true)
            return;
          panEnd.set(event.clientX, event.clientY);
          panDelta.subVectors(panEnd, panStart);
          scope.pan(panDelta);
          panStart.copy(panEnd);
        }
        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        scope.update();
      }

      function onMouseUp() {
        if (scope.enabled === false)
          return;
        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        scope.domElement.removeEventListener('mousemove', onMouseMove, false);
        scope.domElement.removeEventListener('mouseup', onMouseUp, false);
        state = STATE.NONE;
      }

      function onMouseWheel(event) {
        if (scope.enabled === false || scope.noZoom === true)
          return;
        var delta = 0;
        if (event.wheelDelta) {
          delta = event.wheelDelta;
        } else if (event.detail) {
          delta = -event.detail;
        }
        if (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "3D") {
          if (delta > 0) {
            scope.dollyOut();
          } else {
            scope.dollyIn();
          }
        }
        scope.update();
      }

      function onTouchStart(event) {
        if (scope.enabled === false) {
          return;
        }
        event.preventDefault();

        if (scope.noRotate === true) {
          return;
        }
        state = STATE.ROTATE;
        rotateStart.set(event.touches[0].clientX, event.touches[0].clientY);


        scope.domElement.addEventListener('touchmove', onTouchMove, false);
        scope.domElement.addEventListener('touchend', onTouchEnd, false);

      }

      function onTouchMove(event) {
        if (scope.enabled === false || reducerBlueprint?.selectedType == "2D")
          return;
        event.preventDefault();
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        if (state === STATE.ROTATE) {
          if (scope.noRotate === true)
            return;
          rotateEnd.set(event.touches[0].clientX, event.touches[0].clientY);
          rotateDelta.subVectors(rotateEnd, rotateStart);
          // rotating across whole screen goes 360 degrees around
          scope.rotateLeft(2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed);
          // rotating up and down along whole screen attempts to go 360, but limited to 180
          scope.rotateUp(2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed);
          rotateStart.copy(rotateEnd);
        } else if (state === STATE.DOLLY) {
          if (scope.noZoom === true)
            return;
          dollyEnd.set(event.touches[0].clientX, event.touches[0].clientY);
          dollyDelta.subVectors(dollyEnd, dollyStart);
          if (dollyDelta.y > 0) {
            scope.dollyIn();
          } else {
            scope.dollyOut();
          }
          dollyStart.copy(dollyEnd);
        } else if (state === STATE.PAN) {
          if (scope.noPan === true)
            return;
          panEnd.set(event.touches[0].clientX, event.touches[0].clientY);
          panDelta.subVectors(panEnd, panStart);
          scope.pan(panDelta);
          panStart.copy(panEnd);
        }
        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        scope.update();
      }

      function onTouchEnd() {
        if (scope.enabled === false)
          return;
        // Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
        scope.domElement.removeEventListener('touchmove', onTouchMove, false);
        scope.domElement.removeEventListener('touchend', onTouchEnd, false);
        state = STATE.NONE;
      }

      function onKeyDown(event) {
        if (scope.enabled === false) {
          return;
        }
        if (scope.noKeys === true) {
          return;
        }
        if (scope.noPan === true) {
          return;
        }

        if ($('.modal-open').length) {
          return;
        }

        switch (event.keyCode) {
          case scope.keys.UP:
            scope.pan(new THREE.Vector2(0, scope.keyPanSpeed));
            break;
          case scope.keys.BOTTOM:
            scope.pan(new THREE.Vector2(0, -scope.keyPanSpeed));
            break;
          case scope.keys.LEFT:
            scope.pan(new THREE.Vector2(scope.keyPanSpeed, 0));
            break;
          case scope.keys.RIGHT:
            scope.pan(new THREE.Vector2(-scope.keyPanSpeed, 0));
            break;
          default:
            break;
        }
      }



      this.domElement.addEventListener('contextmenu', function (event) {
        event.preventDefault();
      }, false);
      this.domElement.addEventListener('mousedown', onMouseDown, false);
      this.domElement.addEventListener('mousewheel', onMouseWheel, false);
      this.domElement.addEventListener('touchstart', onTouchStart, false);
      this.domElement.addEventListener('DOMMouseScroll', onMouseWheel, false); // firefox
      document.addEventListener('keydown', onKeyDown, false);
    };
  })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Three;
  (function (Three) {
    /**
     * Drawings on "top" of the scene. e.g. rotate arrows
     */
    Three.HUD = function (three) {
      var scope = this;
      // var three = three;
      var scene = new THREE.Scene();
      var selectedItem = null;
      var rotating = false;
      var mouseover = false;
      // var tolerance = 10;
      // eslint-disable-next-line no-unused-vars
      var height = 5;
      var distance = 20;
      var color = "#ffffff";
      var hoverColor = "#f1c40f";
      var activeObject = null;
      this.getScene = function () {
        return scene;
      };
      this.getObject = function () {
        return activeObject;
      };

      function init() {
        three.itemSelectedCallbacks.add(itemSelected);
        three.itemUnselectedCallbacks.add(itemUnselected);
      }

      function resetSelectedItem() {
        selectedItem = null;
        if (activeObject) {
          scene.remove(activeObject);
          activeObject = null;
        }
      }

      function itemSelected(item) {
        if (selectedItem !== item) {
          resetSelectedItem();
          if (item.allowRotate && !item.fixed) {
            selectedItem = item;
            activeObject = makeObject(selectedItem);
            scene.add(activeObject);
          }
        }
      }

      function itemUnselected() {
        resetSelectedItem();
      }
      this.setRotating = function (isRotating) {
        rotating = isRotating;
        setColor();
      };
      this.setMouseover = function (isMousedOver) {
        mouseover = isMousedOver;
        setColor();
      };

      function setColor() {
        if (activeObject) {
          activeObject.children.forEach(function (obj) {
            obj.material.color.set(getColor());
          });
        }
        three.needsUpdate();
      }

      function getColor() {
        return (mouseover || rotating) ? hoverColor : color;
      }
      this.update = function () {
        if (activeObject) {
          activeObject.rotation.y = selectedItem.rotation.y;
          activeObject.position.x = selectedItem.position.x;
          activeObject.position.z = selectedItem.position.z;
          activeObject.position.y = selectedItem.position.y - selectedItem.halfSize.y;
        }
      };

      function makeLineGeometry(item) {
        var geometry = new THREE.BufferGeometry();
        geometry.vertices.push(new THREE.Vector3(0, 0, 0), rotateVector(item));
        return geometry;
      }

      function rotateVector(item) {
        var vec = new THREE.Vector3(0, 0, Math.max(item.halfSize.x, item.halfSize.z) + 1.4 + distance);
        return vec;
      }

      function centreVector(item) {
        var vec = new THREE.Vector3(0, 0, 0);
        return vec;
      }

      function makeLineMaterial(rotating) {
        var mat = new THREE.LineBasicMaterial({
          color: getColor(),
          linewidth: 3
        });
        return mat;
      }

      function makeCone(item) {
        var coneGeo = new THREE.CylinderGeometry(5, 0, 10);
        var coneMat = new THREE.MeshBasicMaterial({
          color: getColor()
        });
        var cone = new THREE.Mesh(coneGeo, coneMat);
        cone.position.copy(rotateVector(item));
        cone.rotation.x = -Math.PI / 2.0;
        return cone;
      }

      function makeSphere(item) {
        var geometry = new THREE.SphereGeometry(4, 16, 16);
        var material = new THREE.MeshBasicMaterial({
          color: getColor()
        });

        var sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(centreVector(item));
        return sphere;
      }

      function makeObject(item) {
        var object = new THREE.Object3D();
        var line = new THREE.Line(makeLineGeometry(item), makeLineMaterial(scope.rotating), THREE.LineSegments);
        var cone = makeCone(item);
        var sphere = makeSphere(item);
        object.add(line);
        object.add(cone);
        object.add(sphere);
        object.rotation.y = item.rotation.y;
        object.position.x = item.position.x;
        object.position.z = item.position.z;
        object.position.y = item.position.y - item.halfSize.y;
        return object;
      }
      init();
    };
  })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Three;
  (function (Three) {
    Three.Main = function (model, element, canvasElement, opts) {
      var scope = this;
      var options = {
        resize: true,
        pushHref: false,
        spin: true,
        spinSpeed: .00002,
        clickPan: true,
        canMoveFixedItems: false
      };
      // override with manually set options
      for (var opt in options) {
        if (options.hasOwnProperty(opt) && opts.hasOwnProperty(opt)) {
          options[opt] = opts[opt];
        }
      }
      // var model = model;
      var scene = model.scene;
      this.element = $(element);

      var domElement;
      var camera;
      var renderer;
      // eslint-disable-next-line no-unused-expressions
      this.controls;
      // var canvas;
      var controller;
      // eslint-disable-next-line no-unused-vars
      var floorplan;
      //var canvas;
      //var canvasElement = canvasElement;
      var needsUpdate = false;
      var lastRender = Date.now();
      var mouseOver = false;
      var hasClicked = false;
      var hud;
      // eslint-disable-next-line no-unused-expressions
      this.heightMargin;
      // eslint-disable-next-line no-unused-expressions
      this.widthMargin;
      // eslint-disable-next-line no-unused-expressions
      this.elementHeight;
      // eslint-disable-next-line no-unused-expressions
      this.elementWidth;
      this.itemSelectedCallbacks = $.Callbacks(); // item
      this.itemUnselectedCallbacks = $.Callbacks();
      this.wallClicked = $.Callbacks(); // wall
      this.floorClicked = $.Callbacks(); // floor
      this.nothingClicked = $.Callbacks();

      function init() {
        // THREE.ImageUtils.crossOrigin = "";
        // THREE.TextureLoader.setCrossOrigin('anonymous')
        THREE.Cache.enabled = true;
        domElement = scope.element.get(0); // Container
        camera = new THREE.PerspectiveCamera(45, 1, 1, 10000);
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          preserveDrawingBuffer: true // required to support .toDataURL()
        });
        renderer.autoClear = false;
        renderer.shadowMap.enabled = true;
        renderer.shadowMapSoft = true;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        // eslint-disable-next-line no-unused-vars
        var skybox = new Three.Skybox(scene);
        scope.controls = new Three.Controls(camera, domElement);
        hud = new Three.HUD(scope);
        controller = new Three.Controller(scope, model, camera, scope.element, scope.controls, hud);
        // domElement.innerHTML = ""
        domElement.appendChild(renderer.domElement);
        // handle window resizing
        scope.updateWindowSize();
        if (options.resize) {
          $(window).resize(scope.updateWindowSize);
        }
        // setup camera nicely
        // scope.centerCamera();
        model.floorplan.fireOnUpdatedRooms(scope.centerCamera);
        // eslint-disable-next-line no-unused-vars
        var lights = new Three.Lights(scene, model.floorplan);
        floorplan = new Three.Floorplan(scene, model.floorplan, scope.controls);
        animate();
        scope.element.mouseenter(function () {
          mouseOver = true;
        }).mouseleave(function () {
          mouseOver = false;
        }).click(function () {
          hasClicked = true;
        });

        scope.element.on("touchstart", function () {
          mouseOver = true;
          hasClicked = true;
        })
        scope.element.on("touchend", function () {
          mouseOver = false;
        })
        //canvas = new ThreeCanvas(canvasElement, scope);

      }

      function spin() {
        if (options.spin && !mouseOver && reducerBlueprint?.selectedType == "3D") {
          var theta = 2 * Math.PI * options.spinSpeed * (Date.now() - lastRender);
          scope.controls.rotateLeft(theta);
          scope.controls.update();
        }
      }
      this.dataUrl = function () {
        var dataUrl = renderer.domElement.toDataURL("image/png");
        return dataUrl;
      };
      this.stopSpin = function () {
        hasClicked = true;
      };
      this.options = function () {
        return options;
      };
      this.getModel = function () {
        return model;
      };
      this.getScene = function () {
        return scene;
      };
      this.getController = function () {
        return controller;
      };
      this.getCamera = function () {
        return camera;
      };
      this.needsUpdate = function () {
        needsUpdate = true;
      };

      function shouldRender() {
        // Do we need to draw a new frame
        if (scope.controls.needsUpdate || controller.needsUpdate || needsUpdate || model.scene.needsUpdate) {
          scope.controls.needsUpdate = false;
          controller.needsUpdate = false;
          needsUpdate = false;
          model.scene.needsUpdate = false;
          return true;
        } else {
          return false;
        }
      }


      function render() {
        spin();
        if (shouldRender()) {
          renderer.clear();

          var pmremGenerator = new THREE.PMREMGenerator(renderer);
          pmremGenerator.compileEquirectangularShader();
          renderer.render(scene.getScene(), camera);
          renderer.clearDepth();
          renderer.render(hud.getScene(), camera);
        }
        lastRender = Date.now();
      };

      function animate() {
        var delay = 50;
        setTimeout(function () {
          requestAnimationFrame(animate);
        }, delay);
        render();
      };
      this.rotatePressed = function () {
        controller.rotatePressed();
      };
      this.rotateReleased = function () {
        controller.rotateReleased();
      };
      this.setCursorStyle = function (cursorStyle) {
        domElement.style.cursor = cursorStyle;
      };
      this.updateWindowSize = function () {

        scope.heightMargin = scope.element.offset().top + 20;
        scope.widthMargin = scope.element.offset().left;
        scope.elementWidth = scope.element.innerWidth();

        if (options.resize) {
          scope.elementHeight = window.innerHeight - scope.heightMargin;
        } else {
          scope.elementHeight = scope.element.innerHeight();
        }

        camera.aspect = scope.elementWidth / scope.elementHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(scope.elementWidth, scope.elementHeight);
        needsUpdate = true;
      };
      this.centerCamera = function () {
        var yOffset = 150.0;
        var pan = model.floorplan.getCenter();

        pan.y = yOffset;

        var distance = model.floorplan.getSize().z * 1.5;
        if (reducerBlueprint?.BP3DData?.globals?.getGlobal("selectedType") === "2D") {
          if (reducerBlueprint?.configuration2D?.partitionType == 'vertical') {
            pan.x = 45
            pan.y = 45
            // scope.controls.dollyIn(2);
            scope.controls.target = pan;
            var offset = pan.clone().add(new THREE.Vector3(3000, 0, 0));
          } else {
            // console.log('this is all about = ', distance)
            // scope.controls.dollyIn(2);
            pan.y = 45
            pan.z = 45
            scope.controls.target = pan;
            var offset = pan.clone().add(new THREE.Vector3(0, 0, 1100))
          }

        } else {
          scope.controls.target = pan;
          // console.log("this is all about = ", distance, distance)
          var offset = pan.clone().add(new THREE.Vector3(0, distance, distance));
        }

        // var offset = pan.clone().add(new THREE.Vector3(0, distance, distance));
        //scope.controls.setOffset(offset);
        camera.position.copy(offset);
        scope.controls.update();
      };
      // projects the object's center point into x,y screen coords
      // x,y are relative to top left corner of viewer
      this.projectVector = function (vec3, ignoreMargin) {
        ignoreMargin = ignoreMargin || false;
        var widthHalf = scope.elementWidth / 2;
        var heightHalf = scope.elementHeight / 2;
        var vector = new THREE.Vector3();
        vector.copy(vec3);
        vector.project(camera);
        var vec2 = new THREE.Vector2();
        vec2.x = (vector.x * widthHalf) + widthHalf;
        vec2.y = -(vector.y * heightHalf) + heightHalf;
        if (!ignoreMargin) {
          vec2.x += scope.widthMargin;
          vec2.y += scope.heightMargin;
        }
        return vec2;
      };
      init();
    };
  })(Three = BP3D.Three || (BP3D.Three = {}));
})(BP3D || (BP3D = {}));


(function (BP3D) {
  /** Blueprint3D core application. */
  var Blueprint3d = (function () {
    /** Creates an instance.
     * @param options The initialization options.
     */
    function Blueprint3d(options) {
      this.model = new BP3D.Model.Model(options.textureDir);
      this.globals = new BP3D.Globals.Globals()
      this.three = new BP3D.Three.Main(this.model, options.threeElement, options.threeCanvasElement, {});
      if (!options.widget) {
        this.floorplanner = new BP3D.Floorplanner.Floorplanner(options.floorplannerElement, this.model.floorplan);
      } else {
        this.three.getController().enabled = false;
      }
    }
    return Blueprint3d;
  })();
  BP3D.Blueprint3d = Blueprint3d;
})(BP3D || (BP3D = {}));

(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Core;
  (function (Core) {
    /** Enumeration of log contexts. */
    (function (ELogContext) {
      /** Log nothing. */
      ELogContext[ELogContext["None"] = 0] = "None";
      /** Log all. */
      ELogContext[ELogContext["All"] = 1] = "All";
      /** 2D interaction */
      ELogContext[ELogContext["Interaction2d"] = 2] = "Interaction2d";
      /** Interior items */
      ELogContext[ELogContext["Item"] = 3] = "Item";
      /** Wall (connectivity) */
      ELogContext[ELogContext["Wall"] = 4] = "Wall";
      /** Room(s) */
      ELogContext[ELogContext["Room"] = 5] = "Room";
    })(Core.ELogContext || (Core.ELogContext = {}));
    var ELogContext = Core.ELogContext;
    /** Enumeration of log levels. */
    (function (ELogLevel) {
      /** An information. */
      ELogLevel[ELogLevel["Information"] = 0] = "Information";
      /** A warning. */
      ELogLevel[ELogLevel["Warning"] = 1] = "Warning";
      /** An error. */
      ELogLevel[ELogLevel["Error"] = 2] = "Error";
      /** A fatal error. */
      ELogLevel[ELogLevel["Fatal"] = 3] = "Fatal";
      /** A debug message. */
      ELogLevel[ELogLevel["Debug"] = 4] = "Debug";
    })(Core.ELogLevel || (Core.ELogLevel = {}));
    var ELogLevel = Core.ELogLevel;
    /** The current log context. To be set when initializing the Application. */
    Core.logContext = ELogContext.None;
    /** Pre-check if logging for specified context and/or level is enabled.
     * This may be used to avoid compilation of complex logs.
     * @param context The log context to be verified.
     * @param level The log level to be verified.
     * @returns If this context/levels is currently logged.
     */
    function isLogging(context, level) {
      return Core.logContext === ELogContext.All || Core.logContext === context ||
        level === ELogLevel.Warning || level === ELogLevel.Error ||
        level === ELogLevel.Fatal;
    }
    Core.isLogging = isLogging;
    /** Log the passed message in the context and with given level.
     * @param context The context in which the message should be logged.
     * @param level The level of the message.
     * @param message The messages to be logged.
     */
    function log(context, level, message) {
      if (isLogging(context, level) === false) {
        return;
      }
      var tPrefix = "";
      switch (level) {
        case ELogLevel.Information:
          tPrefix = "[INFO_] ";
          break;
        case ELogLevel.Warning:
          tPrefix = "[WARNG] ";
          break;
        case ELogLevel.Error:
          tPrefix = "[ERROR] ";
          break;
        case ELogLevel.Fatal:
          tPrefix = "[FATAL] ";
          break;
        case ELogLevel.Debug:
          tPrefix = "[DEBUG] ";
          break;
        default:
          break;
      }
      // console.log(tPrefix + message);
    }
    Core.log = log;
  })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));

(function (BP3D) {
  // eslint-disable-next-line no-unused-vars
  var Core;
  (function (Core) {
    /** Version information. */
    var Version = (function () {
      function Version() { }
      /** The informal version. */
      Version.getInformalVersion = function () {
        return "1.0 Beta 1";
      };
      /** The technical version. */
      Version.getTechnicalVersion = function () {
        return "1.0.0.1";
      };
      return Version;
    })();
    Core.Version = Version;
  })(Core = BP3D.Core || (BP3D.Core = {}));
})(BP3D || (BP3D = {}));
//# sourceMappingURL=blueprint3d.js.map

