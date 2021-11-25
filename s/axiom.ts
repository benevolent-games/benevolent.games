
console.log("💠 axiom")

import {Scene} from "@babylonjs/core/scene.js"
import {Mesh} from "@babylonjs/core/Meshes/mesh.js"
import {Vector3} from "@babylonjs/core/Maths/math.js"
import {Engine} from "@babylonjs/core/Engines/engine.js"
import {FreeCamera} from "@babylonjs/core/Cameras/freeCamera.js"
import {GridMaterial} from "@babylonjs/materials/grid/gridMaterial.js"
import {HemisphericLight} from "@babylonjs/core/Lights/hemisphericLight.js"

import "@babylonjs/core/Meshes/meshBuilder.js"

const canvas = <HTMLCanvasElement>document.getElementById("renderport")

const engine = new Engine(canvas)
var scene = new Scene(engine)
var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene)
camera.setTarget(Vector3.Zero())
camera.attachControl(canvas, true)
var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene)
light.intensity = 0.7
var material = new GridMaterial("grid", scene)
var sphere = Mesh.CreateSphere("sphere1", 16, 2, scene)
sphere.position.y = 2
sphere.material = material
var ground = Mesh.CreateGround("ground1", 6, 6, 2, scene)
ground.material = material

engine.runRenderLoop(() => scene.render())
