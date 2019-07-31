import fs from 'fs'

import * as BABYLON from "babylonjs"

export class Actor {
    constructor({ mesh, animationGroup, skeleton, scene, keySet = { jump: "w", squat: "s", left: "a", right: "d", attack: { small: "j", medium: "k", large: "l" } }, fps = 60 }) {
        this._fps = fps && !Number.isNaN(fps - 0) ? fps : this.fps
        this._actions = Actor.actionSet()
        this.keyBuffer = []
        this._mainState = "normal"
        this._detailState = "stand"
        this._state = { chapter: "normal", section: "stand", subsection: "main", subsubsection: 0 }
        this._animationGroup = animationGroup
        this._mesh = mesh
        this._skeleton = skeleton
        this._scene = scene
        this._opponent = null
        this.keyDown = {
            jump: false,
            squat: false,
            left: false,
            right: false,
            attack: {
                small: false,
                medium: false,
                large: false
            }
        }
        this.jumpAttackNum = 0
        this.isHit = false
        this.jumpTimes = 0

        this.vector = BABYLON.Vector3.Zero()

        //collision boxes
        this._collisionBoxes = []
        this.skeleton.bones.forEach((bone, index) => {
            let box = new BABYLON.MeshBuilder.CreateBox("box", { size: 0.2, updatable: true }, this.scene)
            box.PhysicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.SphereImpostor, { mass: 0 }, this.scene)
            box.material = new BABYLON.StandardMaterial("myMaterial", this.scene);
            // box.material.alpha = 0
            this._collisionBoxes.push(box)
        })
        this._bodyBox = new BABYLON.MeshBuilder.CreateSphere("sphere", { diameter: 2, updatable: true }, this.scene)
        this._bodyBox.setPivotMatrix(new BABYLON.Matrix.Translation(0, 0.5, 0), false);
        this._bodyBox.position = this.mesh.position
        this._bodyBox.material = new BABYLON.StandardMaterial("myMaterial", this.scene);
        this._bodyBox.material.alpha = 0.3

        //animatiom
        Object.keys(this._actions).forEach(chapter => {
            Object.keys(this._actions[chapter]).forEach(section => {
                Object.keys(this._actions[chapter][section]).forEach(subsection => {
                    this._actions[chapter][section][subsection].forEach((anim, subsubsection, animsArray) => {
                        animsArray[subsubsection] = animationGroup.clone()
                        // console.log(`${chapter}:${section}:${subsection}:${subsubsection}`)
                        animsArray[subsubsection].normalize(Actor.actionSet()[chapter][section][subsection][subsubsection].start / this.fps, Actor.actionSet()[chapter][section][subsection][subsubsection].end / this.fps)
                    })
                    switch (chapter) {
                        case "normal":
                            {
                                switch (section) {
                                    case "squat":
                                        {
                                            switch (subsection) {
                                                case "main":
                                                    {
                                                        this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                            if (this._state.chapter == "normal") {
                                                                if (this._state.section == "squat") {
                                                                    if (this.keyDown.squat) {
                                                                        this._state.subsubsection = 1
                                                                    } else {
                                                                        this._state.subsubsection = 2
                                                                    }
                                                                }
                                                            }
                                                        })
                                                        this._actions[chapter][section][subsection][2].onAnimationEndObservable.add(() => {
                                                            this._state.subsubsection = 0
                                                            this._state.section = "stand"
                                                        })
                                                        break;
                                                    }
                                                default:
                                                    break;
                                            }
                                            break;
                                            break;
                                        }
                                    case "jump":
                                        {
                                            switch (subsection) {
                                                case "main":
                                                    {
                                                        // this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                        //     if (this._state.section == "jump") {
                                                        //         this._state.subsubsection = 1
                                                        //     }
                                                        // })
                                                        // this._actions[chapter][section][subsection][2].onAnimationEndObservable.add(() => {
                                                        //     this._state.subsubsection = 0
                                                        //     this._state.section = "stand"
                                                        // })
                                                        break;
                                                    }
                                                default:
                                                    break;
                                            }
                                            break;
                                            break;
                                        }
                                    default:
                                        break;
                                }
                                break;
                            }
                        case "attack":
                            {
                                switch (section) {
                                    case "stand":
                                        {
                                            if (subsection != "large") {
                                                this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                    if (this._state.chapter == "attack") {
                                                        if (this.isHit) {
                                                            this._state.subsubsection = 1
                                                        } else {
                                                            this._state.subsubsection = 2
                                                        }
                                                    }
                                                })
                                                this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                    if (this._state.chapter == "attack") {
                                                        this._state.subsubsection = 2
                                                    }

                                                })
                                                this._actions[chapter][section][subsection][2].onAnimationEndObservable.add(() => {
                                                    if (`${chapter}:${section}:${subsection}:${2}` == `${this._state["chapter"]}:${this._state["section"]}:${this._state["subsection"]}:${this._state["subsubsection"]}`) {
                                                        this._state.subsubsection = 0
                                                        this._state.chapter = "normal"
                                                        this._state.subsection = "main"
                                                        this.isHit = false
                                                    }
                                                })
                                            } else {
                                                this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                    if (this._state.chapter == "attack") {
                                                        this._state.subsubsection = 1
                                                    }
                                                })
                                                this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                    if (this._state.chapter == "attack") {
                                                        if (this.isHit) {
                                                            this._state.subsubsection = 2
                                                        } else {
                                                            this._state.subsubsection = 3
                                                        }
                                                    }
                                                })
                                                this._actions[chapter][section][subsection][2].onAnimationEndObservable.add(() => {
                                                    if (`${chapter}:${section}:${subsection}:${2}` == `${this._state["chapter"]}:${this._state["section"]}:${this._state["subsection"]}:${this._state["subsubsection"]}`) {
                                                        this._state.subsubsection = 3
                                                    }

                                                })
                                                this._actions[chapter][section][subsection][3].onAnimationEndObservable.add(() => {
                                                    if (`${chapter}:${section}:${subsection}:${3}` == `${this._state["chapter"]}:${this._state["section"]}:${this._state["subsection"]}:${this._state["subsubsection"]}`) {
                                                        this._state.subsubsection = 0
                                                        this._state.chapter = "normal"
                                                        this._state.subsection = "main"
                                                        this.isHit = false
                                                    }
                                                })
                                            }
                                            break;
                                        }
                                    case "squat":
                                        {
                                            if (subsection == "small") {
                                                this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                    this._state.subsubsection = 1
                                                    this.vector.x = this.faceTo == "left" ? 1 : -1
                                                })
                                            } else if (subsection == "large") {
                                                this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                    this._state.subsubsection = 1
                                                })
                                                this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                    if (this.isHit) {
                                                        this._state.subsubsection = 2
                                                    } else {
                                                        this._state.subsubsection = 3
                                                    }
                                                })
                                            } else {
                                                this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                    if (this.isHit) {
                                                        this._state.subsubsection = 1
                                                    } else {
                                                        this._state.subsubsection = 2
                                                    }
                                                })
                                            }
                                            if (subsection == "large") {
                                                this._actions[chapter][section][subsection][2].onAnimationEndObservable.add(() => {
                                                    this._state.subsubsection = 3
                                                })
                                                this._actions[chapter][section][subsection][3].onAnimationEndObservable.add(() => {
                                                    this._state.chapter = "normal"
                                                    this._state.subsection = "main"
                                                    if (this.keyDown.squat) {
                                                        this._state.subsubsection = 1
                                                    } else {
                                                        this._state.subsubsection = 2
                                                    }
                                                    this.isHit = false
                                                })
                                            } else {
                                                this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                    this._state.subsubsection = 2
                                                })
                                                this._actions[chapter][section][subsection][2].onAnimationEndObservable.add(() => {
                                                    this._state.chapter = "normal"
                                                    this._state.subsection = "main"
                                                    if (this.keyDown.squat) {
                                                        this._state.subsubsection = 1
                                                    } else {
                                                        this._state.subsubsection = 2
                                                    }
                                                    this.isHit = false
                                                })
                                            }



                                            break;
                                        }
                                    case "jump":
                                        {
                                            switch (subsection) {
                                                case "small":
                                                    {
                                                        this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                            if (this.isHit) {
                                                                this._state.subsubsection = 1
                                                            } else {
                                                                this._state.subsubsection = 2
                                                            }
                                                        })

                                                        this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                            this._state.subsubsection = 2
                                                        })
                                                        this._actions[chapter][section][subsection][2].onAnimationEndObservable.add(() => {
                                                            this._state.chapter = "normal"
                                                            this._state.subsection = "main"
                                                            this._state.subsubsection = 0
                                                            this.isHit = false
                                                        })
                                                        break;
                                                    }
                                                default:
                                                    {
                                                        this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                            this._state.subsubsection = 1
                                                        })

                                                        this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                            this._state.chapter = "normal"
                                                            this._state.subsection = "main"
                                                            this._state.subsubsection = 0
                                                            this.isHit = false
                                                        })
                                                        break;
                                                    }
                                            }


                                            break;
                                        }
                                    default:
                                        break;
                                }
                                break;
                            }
                        case "hitRecover":
                            {
                                switch (section) {
                                    case "stand":
                                        {
                                            this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                if (this._state.chapter == "hitRecover") {
                                                    this._state.subsubsection = 1
                                                }
                                            })

                                            if (subsection != "large") {
                                                this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                    if (this._state.chapter == "hitRecover") {
                                                        this._state.subsubsection = 0
                                                        this._state.chapter = "normal"
                                                        this._state.subsection = "main"
                                                    }
                                                })
                                            } else {
                                                this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                    if (this._state.chapter == "hitRecover") {
                                                        this._state.section = "reStand"
                                                        this._state.subsection = "main"
                                                        this._state.subsubsection = 0
                                                    }
                                                })
                                            }

                                            break;
                                        }
                                    case "squat":
                                        {
                                            this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                if (this._state.chapter == "hitRecover") {
                                                    this._state.subsubsection = 1
                                                }
                                            })

                                            if (subsection != "large") {
                                                this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                    if (this._state.chapter == "hitRecover") {
                                                        this._state.subsubsection = 1
                                                        this._state.chapter = "normal"
                                                        this._state.subsection = "main"
                                                    }
                                                })
                                            } else {
                                                this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                    if (this._state.chapter == "hitRecover") {
                                                        this._state.section = "reStand"
                                                        this._state.subsection = "main"
                                                        this._state.subsubsection = 0
                                                    }
                                                })
                                            }

                                            break;
                                        }
                                    case "jump":
                                        {
                                            this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                if (this._state.chapter == "hitRecover") {
                                                    if (this._state.section == "jump") {
                                                        this._state.subsubsection = 1
                                                    }
                                                }
                                            })


                                            this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                if (this._state.chapter == "hitRecover") {
                                                    if (this._state.section == "jump") {
                                                        this._state.section = "reStand"
                                                        this._state.subsection = "main"
                                                        this._state.subsubsection = 0
                                                    }
                                                }
                                            })

                                            break;
                                        }
                                    case "reStand":
                                        {
                                            this._actions[chapter][section][subsection][0].onAnimationEndObservable.add(() => {
                                                if (this._state.chapter == "hitRecover") {
                                                    this._state.subsubsection = 1
                                                }
                                            })
                                            this._actions[chapter][section][subsection][1].onAnimationEndObservable.add(() => {
                                                if (this._state.chapter == "hitRecover") {
                                                    this._state.chapter = "normal"
                                                    this._state.subsection = "main"
                                                    if (this.keyDown.squat) {
                                                        this._state.section = "squat"
                                                    } else {
                                                        this._state.section = "stand"
                                                    }
                                                    this._state.subsubsection = 0
                                                }
                                            })
                                            break;
                                        }
                                    default:
                                        break;
                                }
                                break;
                                break;
                            }
                        default:
                            break;
                    }

                })
            })
        })
        document.addEventListener('keydown', (event) => {
            // console.log(event.key)
            switch (event.key) {
                case keySet.right:
                    {
                        if (!this.keyDown.right) {
                            if (this._state.chapter == "normal") {
                                if (this._state.section == "stand") {
                                    this._state.subsection = this.faceTo == "right" ? "forward" : "backward"
                                    this.keyDown.right = true
                                }
                            }
                        }
                        break;
                    }
                case keySet.left:
                    {
                        if (!this.keyDown.left) {
                            if (this._state.chapter == "normal") {
                                if (this._state.section == "stand") {
                                    this._state.subsection = this.faceTo == "left" ? "forward" : "backward"
                                    this.keyDown.left = true
                                }
                            }
                        }
                        break;
                    }
                case keySet.jump:
                    {
                        if (!this.keyDown.jump && this.jumpTimes < 2) {
                            if (this._state.chapter == "normal") {
                                this._state.section = "jump"
                                this._state.subsection = "main"
                                this._state.subsubsection = 0
                                this.keyDown.jump = true
                                this.vector.y = 0.4
                                this.mesh.position.y += 0.01
                                this.jumpTimes += 1
                            }
                        }
                        break;
                    }
                case keySet.squat:
                    {
                        if (!this.keyDown.squat) {
                            if (this._state.chapter == "normal") {
                                if (this._state.section == "stand") {
                                    this._state.section = "squat"
                                    this._state.subsection = "main"
                                    this._state.subsubsection = 0
                                }
                                this.keyDown.squat = true
                            }
                        }
                        break;
                    }
                case keySet.attack.small:
                    {
                        if (!this.keyDown.attack.small) {
                            if (this._state.chapter == "normal") {
                                if (this.jumpAttackNum < 5) {
                                    this._state.chapter = "attack"
                                    this._state.subsection = "small"
                                    this._state.subsubsection = 0
                                    this.keyDown.attack.small = true
                                    if (this._state.section == "jump") {
                                        this.jumpAttackNum += 1
                                    }
                                }
                            } else if (this._state.chapter == "attack") {
                                if (this._state.subsection != "small") {
                                    if (this.isHit) {
                                        if (this._state.subsubsection == Actor.actionSet()[this._state.chapter][this._state.section][this._state.subsection].length - 1) {
                                            this._state.chapter = "attack"
                                            this._state.subsection = "small"
                                            this._state.subsubsection = 0
                                            this.keyDown.attack.small = true
                                            if (this._state.section == "jump") {
                                                this.jumpAttackNum += 1
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    }
                case keySet.attack.medium:
                    {
                        if (!this.keyDown.attack.medium) {
                            if (this._state.chapter == "normal") {
                                if (this.jumpAttackNum < 5) {
                                    this._state.chapter = "attack"
                                    this._state.subsection = "medium"
                                    this._state.subsubsection = 0
                                    this.keyDown.attack.medium = true
                                    if (this._state.section == "jump") {
                                        this.jumpAttackNum += 2
                                    }
                                }
                            }
                        }
                        break;
                    }
                case keySet.attack.large:
                    {
                        if (!this.keyDown.attack.large) {
                            if (this._state.chapter == "normal") {
                                if (this.jumpAttackNum < 5) {
                                    this._state.chapter = "attack"
                                    this._state.subsection = "large"
                                    this._state.subsubsection = 0
                                    this.keyDown.attack.large = true
                                    if (this._state.section == "jump") {
                                        this.jumpAttackNum += 3
                                    }
                                }
                            }
                        }
                        break;
                    }
                default:
                    break;
            }
        }, false)
        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case keySet.right:
                    {
                        if (this.keyDown.right) {
                            if (this._state.chapter == "normal") {
                                this._state.subsection = "main"
                            }
                        }
                        if (this.keyDown.left) {
                            if (this._state.chapter == "normal") {
                                if (this._state.section == "stand") {
                                    this._state.subsection = this.faceTo == "left" ? "forward" : "backward"
                                }
                            }
                        }
                        this.keyDown.right = false
                        break;
                    }
                case keySet.left:
                    {
                        if (this.keyDown.left) {
                            if (this._state.chapter == "normal") {
                                this._state.subsection = "main"
                            }
                        }
                        if (this.keyDown.right) {
                            if (this._state.chapter == "normal") {
                                if (this._state.section == "stand") {
                                    this._state.subsection = this.faceTo == "right" ? "forward" : "backward"
                                }
                            }
                        }
                        this.keyDown.left = false
                        break;
                    }
                case keySet.jump:
                    {
                        this.keyDown.jump = false
                        break;
                    }
                case keySet.squat:
                    {
                        if (this.keyDown.squat) {
                            if (this._state.chapter == "normal") {
                                if (this._state.section == "squat") {
                                    if (this._state.subsubsection == 1) {
                                        this._state.subsubsection = 2
                                    }
                                }
                            }
                        }
                        this.keyDown.squat = false
                        break;
                    }
                case keySet.attack.small:
                    {
                        if (this.keyDown.attack.small) {

                        }
                        this.keyDown.attack.small = false
                        break;
                    }
                case keySet.attack.medium:
                    {
                        this.keyDown.attack.medium = false
                        break;
                    }
                case keySet.attack.large:
                    {
                        this.keyDown.attack.large = false
                        break;
                    }
                default:
                    break;
            }
        }, false)


    }
    static actionSet() {
        return {
            normal: {
                stand: {
                    main: [{
                        start: 1,
                        end: 40,
                        atk: 0
                    }],
                    forward: [{
                        start: 41,
                        end: 70,
                        atk: 0
                    }],
                    backward: [{
                        start: 71,
                        end: 100,
                        atk: 0
                    }]
                },
                jump: {
                    main: [
                        //     {
                        //     start: 401,
                        //     end: 410,
                        //     atk: 0
                        // },
                        {
                            start: 411,
                            end: 430,
                            atk: 0
                        },
                        // {
                        //     start: 431,
                        //     end: 440,
                        //     atk: 0
                        // }
                    ]
                },
                squat: {
                    main: [{
                        start: 801,
                        end: 820,
                        atk: 0,
                        speed: 3
                    },
                    {
                        start: 821,
                        end: 880,
                        atk: 0
                    },
                    {
                        start: 1101,
                        end: 1120,
                        atk: 0,
                        speed: 3
                    }
                    ],
                    // forward: [{
                    //     start: 881,
                    //     end: 920,
                    //     atk: 0
                    // }],
                    // backward: [{
                    //     start: 921,
                    //     end: 960,
                    //     atk: 0
                    // }]
                }
            },
            attack: {
                stand: {
                    small: [{
                        start: 101,
                        end: 109,
                        atk: 100,
                        speed: 1.5,
                        boxes: [12]
                    }, {
                        start: 109,
                        end: 119,
                        atk: 0,
                        speed: 2
                    }, {
                        start: 119,
                        end: 130,
                        atk: 0,
                        speed: 1.5
                    }],
                    medium: [{
                        start: 131,
                        end: 150,
                        atk: 200,
                        boxes: [7]
                    }, {
                        start: 150,
                        end: 160,
                        atk: 0,
                        speed: 2
                    }, {
                        start: 160,
                        end: 170,
                        atk: 0
                    }],
                    large: [{
                        start: 171,
                        end: 185,
                        atk: 0
                    }, {
                        start: 185,
                        end: 197,
                        atk: 300,
                        boxes: [12]
                    }, {
                        start: 197,
                        end: 207,
                        atk: 0,
                        speed: 2
                    }, {
                        start: 207,
                        end: 220,
                        atk: 0
                    }]
                },
                jump: {
                    small: [{
                        start: 441,
                        end: 450,
                        atk: 150,
                        speed: 1.5,
                        boxes: [12]
                    }, {
                        start: 450,
                        end: 460,
                        atk: 0,
                        speed: 2
                    }, {
                        start: 460,
                        end: 470,
                        atk: 0,
                        speed: 1.5
                    }],
                    medium: [{
                        start: 471,
                        end: 493,
                        atk: 240,
                        boxes: [12]
                    }, {
                        start: 493,
                        end: 510,
                        atk: 0,
                    }],
                    large: [{
                        start: 511,
                        end: 555,
                        atk: 500,
                        speed: 1.8,
                        boxes: [7, 6]
                    }, {
                        start: 555,
                        end: 570,
                        atk: 0,
                        speed: 1.2
                    }],
                    fall: [{
                        start: 571,
                        end: 580,
                        atk: 50,
                        boxes: [1]
                    }, {
                        start: 581,
                        end: 600,
                        atk: 50,
                        boxes: [1]
                    }, {
                        start: 601,
                        end: 630,
                        atk: 0
                    }]
                },
                squat: {
                    small: [{
                        start: 961,
                        end: 970,
                        atk: 0
                    }, {
                        start: 970,
                        end: 985,
                        atk: 100,
                        boxes: [12]
                    }, {
                        start: 985,
                        end: 1000,
                        atk: 0
                    }],
                    medium: [{
                        start: 1001,
                        end: 1018,
                        atk: 250,
                        boxes: [12]
                    }, {
                        start: 1018,
                        end: 1030,
                        atk: 0,
                        speed: 2
                    }, {
                        start: 1030,
                        end: 1040,
                        atk: 0
                    }],
                    large: [{
                        start: 1041,
                        end: 1051,
                        atk: 0
                    },
                    {
                        start: 1051,
                        end: 1058,
                        atk: 500,
                        boxes: [12]
                    },
                    {
                        start: 1058,
                        end: 1071,
                        atk: 0,
                        speed: 2
                    }, {
                        start: 1071,
                        end: 1100,
                        atk: 0
                    }
                    ]
                }
            },
            defense: {
                stand: {
                    main: [{
                        start: 221,
                        end: 230,
                        atk: 0
                    }, {
                        start: 231,
                        end: 240,
                        atk: 0
                    }]
                },
                jump: {
                    main: [{
                        start: 631,
                        end: 640,
                        atk: 0
                    }, {
                        start: 640,
                        end: 650,
                        atk: 0
                    }]
                },
                squat: {
                    main: [{
                        start: 1121,
                        end: 1130,
                        atk: 0
                    }, {
                        start: 1130,
                        end: 1140,
                        atk: 0
                    }]
                }
            },
            hitRecover: {
                stand: {
                    small: [{
                        start: 241,
                        end: 250,
                        atk: 0
                    }, {
                        start: 250,
                        end: 260,
                        atk: 0
                    }],
                    medium: [{
                        start: 261,
                        end: 275,
                        atk: 0
                    }, {
                        start: 275,
                        end: 290,
                        atk: 0
                    }],
                    large: [{
                        start: 291,
                        end: 310,
                        atk: 0
                    }, {
                        start: 310,
                        end: 330,
                        atk: 0
                    }]
                },
                jump: {
                    large: [{
                        start: 651,
                        end: 680,
                        atk: 0
                    }, {
                        start: 680,
                        end: 700,
                        atk: 0
                    }]
                },
                squat: {
                    small: [{
                        start: 1141,
                        end: 1150,
                        atk: 0
                    }, {
                        start: 1150,
                        end: 1160,
                        atk: 0
                    }],
                    medium: [{
                        start: 1161,
                        end: 1175,
                        atk: 0
                    }, {
                        start: 1175,
                        end: 1190,
                        atk: 0
                    }],
                    large: [{
                        start: 1191,
                        end: 1210,
                        atk: 0
                    }, {
                        start: 1210,
                        end: 1230,
                        atk: 0
                    }]
                },
                reStand: {
                    main: [{
                        start: 1300,
                        end: 1301,
                        atk: 0,
                        speed: 0.1
                    },
                    {
                        start: 1301,
                        end: 1330,
                        atk: 0
                    }
                    ]
                }
            }
        }
    }
    static url() {
        return URL.createObjectURL(new Blob([fs.readFileSync(__dirname + '../../../file/slime/slime2.glb')]))
    }
    get fps() {
        return this._fps || 60
    }
    get animationGroup() {
        return this._animationGroup
    }
    get mesh() {
        return this._mesh
    }
    get skeleton() {
        return this._skeleton
    }
    get scene() {
        return this._scene
    }
    get collisionBoxes() {
        return this._collisionBoxes
    }
    get bodyBox() {
        return this._bodyBox
    }

    stopAnimation() {
        Object.keys(this._actions).forEach((chapter => {
            Object.keys(this._actions[chapter]).forEach((section => {
                Object.keys(this._actions[chapter][section]).forEach((subsection => {
                    this._actions[chapter][section][subsection].forEach((anim, subsubsection) => {
                        if (`${chapter}:${section}:${subsection}:${subsubsection}` != `${this._state["chapter"]}:${this._state["section"]}:${this._state["subsection"]}:${this._state["subsubsection"]}`) {
                            anim.stop()
                        } else { }
                    })
                }))
            }))
        }))
    }

    tick(debug) {

        if (debug) {
            console.log(`${this._state.chapter}:${this._state.section}:${this._state.subsection}:${this._state.subsubsection}`)
        }
        this.stopAnimation()
        this._actions[this._state.chapter][this._state.section][this._state.subsection][this._state.subsubsection].start(false, (Actor.actionSet()[this._state.chapter][this._state.section][this._state.subsection][this._state.subsubsection].speed || 1)/* * 0.5*/)

        if (`${this._state["chapter"]}:${this._state["section"]}:${this._state["subsection"]}` == "normal:stand:main") {
            this.vector = BABYLON.Vector3.Zero()
        }


        switch (this._state.chapter) {
            case "normal":
                {
                    switch (this._state.section) {
                        case "stand":
                            {
                                this.jumpAttackNum = 0
                                this.jumpTimes = 0
                                break;
                            }
                        case "squat":
                            {
                                this.jumpAttackNum = 0
                                this.jumpTimes = 0
                                break;
                            }
                        case "jump":
                            {
                                if (this.mesh.position.y <= 0) {
                                    this.mesh.position.y = 0
                                    if (this.keyDown.squat) {
                                        this._state.section = "squat"
                                        this._state.subsection = "main"
                                        this._state.subsubsection = 0
                                    } else {
                                        this._state.section = "stand"
                                    }
                                    // this.vector.x = 0
                                    // this._state.subsubsection = 2
                                }
                                break;
                            }
                        default:
                            break;
                    }
                    break;
                }
            case "attack":
                {
                    switch (this._state.section) {
                        case "stand":
                            {
                                this.vector.x = 0
                                break;
                            }
                        case "squat":
                            {
                                switch (this._state.subsection) {
                                    case "small":
                                        {
                                            if (this._state.subsubsection == 1) {
                                                this.vector.x /= 1.3
                                            }
                                            if (this._state.subsubsection == 2) {
                                                this.vector.x = 0
                                            }
                                            break;
                                        }
                                    default:
                                        break;
                                }
                                break;
                            }
                        case "jump":
                            {
                                break;
                            }
                        default:
                            break;
                    }
                    break;
                }
            case "hitRecover":
                {
                    if (this._state.section == "jump") {
                        if (this.mesh.position.y <= 0) {
                            this._state.section = "reStand"
                            this._state.subsection = "main"
                            this._state.subsubsection = 0
                        }
                    }
                    break;
                }
            default:
                break;
        }
        if (this._state.chapter == "normal" && this._state.section == "stand") {
            if (this.keyDown.right && this.keyDown.left) {
                this._state.subsection = "main"
            } else {
                if (this.keyDown.left) {
                    if (this.faceTo == "left") {
                        this._state.subsection = "forward"
                    } else {
                        this._state.subsection = "backward"
                    }
                } else if (this.keyDown.right) {
                    if (this.faceTo == "right") {
                        this._state.subsection = "forward"
                    } else {
                        this._state.subsection = "backward"
                    }
                }
            }
        }
        if (this._state.subsection == "forward") {
            this.vector.x = this.faceTo == "right" ? -0.1 : 0.1
        } else if (this._state.subsection == "backward") {
            this.vector.x = this.faceTo == "left" ? -0.075 : 0.075
        }
        if (this._state.chapter == "normal") {
            if (this._state.section == "squat") {
                this.vector.x *= 0.5
            }
        }
        if (this.mesh.position.y > 0) {
            if (this.isHit) {
                this.vector.y = 0
            } else {
                this.vector.y -= 0.02
            }
        } else {
            this.mesh.position.y = 0
            this.vector.y = 0
        }
        //Actor Intersect Collisions
        if (this.bodyBox.intersectsMesh(this.opponent.bodyBox, true)) {
            if (this.faceTo == "left") {
                this.mesh.position.x -= 0.05
            } else {
                this.mesh.position.x += 0.05
            }
            this.vector.x = 0
        }
        this.mesh.position = this.mesh.position.add(this.vector)

        if (this.mesh.position.x > 11) { this.mesh.position.x = 11 }
        if (this.mesh.position.x < -11) { this.mesh.position.x = -11 }


        if (this._state.chapter == "normal" && this._state.section != "jump") {
            if (this.faceTo == "left") {
                this.mesh.rotationQuaternion = new BABYLON.Vector3(0, 0, 0).toQuaternion()
            } else {
                this.mesh.rotationQuaternion = new BABYLON.Vector3(0, Math.PI, 0).toQuaternion()
            }
        }

        {

            this._bodyBox.position.x = this.mesh.position.x
            this._bodyBox.position.y = this.mesh.position.y
            this._bodyBox.position.z = this.mesh.position.z
            if (this._state.section == "squat") {
                this._bodyBox.scaling = new BABYLON.Vector3(1, 0.5, 1)
                this._bodyBox.position.y -= 0.2
            } else {
                this._bodyBox.scaling = new BABYLON.Vector3(1, 1, 1)
            }
        }

        this.skeleton.bones.forEach((bone, index) => {
            this.collisionBoxes[index].PhysicsImpostor.syncImpostorWithBone(bone, this.mesh)
        })
        let attackBox = Actor.actionSet()[this._state.chapter][this._state.section][this._state.subsection][this._state.subsubsection].boxes
        if (attackBox) {
            if (!this.isHit) {
                if (this._state.chapter == "attack" && this._state.section == "squat" && this._state.subsection == "small") {
                    if (this.bodyBox.intersectsMesh(this.opponent.bodyBox, true)) {
                        this.opponent.beInjured(Actor.actionSet()[this._state.chapter][this._state.section][this._state.subsection][this._state.subsubsection].atk, this._state.subsection, new BABYLON.Vector3(0, 0.5, 0))
                        this.isHit = true
                    }
                }
            }
            attackBox.forEach((boxIndex) => {
                if (!this.isHit) {
                    if (this.collisionBoxes[boxIndex].intersectsMesh(this.opponent.bodyBox, true)) {
                        if (this._state.chapter == "attack") {
                            this.opponent.beInjured(Actor.actionSet()[this._state.chapter][this._state.section][this._state.subsection][this._state.subsubsection].atk, this._state.subsection)
                            this.isHit = true
                        }
                    }
                }
            })
        }

        // this.collisionBoxes.forEach((thisBox) => {
        //     this.opponent.collisionBoxes.forEach((oppoBox) => {
        //         if (thisBox.intersectsMesh(oppoBox, true)) {
        //             if (this._state.chapter == "attack") {

        //                 console.log("c")
        //             }
        //         }
        //     })
        // })

    }

    setOpponent(opponent) {
        this._opponent = opponent
    }
    get opponent() {
        return this._opponent
    }
    get faceTo() {
        return this.opponent.mesh.position.x > this.mesh.position.x ? "left" : "right"
    }

    beInjured(atk = 100, scale = "small", beHitVector = BABYLON.Vector3.Zero()) {
        if (this._state.section != "reStand") {
            this._state.chapter = "hitRecover"
            this._state.subsection = this._state.section == "jump" ? "large" : scale
            this._state.subsubsection = 0
            this.vector = this.vector.add(beHitVector)
            this.mesh.position = this.mesh.position.add(beHitVector)
        }
        console.log(atk)
    }
}