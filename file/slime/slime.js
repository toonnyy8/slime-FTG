import fs from 'fs'

export let fps = 60

export let action = {
    walk: {
        start: 1,
        end: 30,
        _: null
    },
    jumpUp: {
        start: 31,
        end: 40,
        _: null
    },
    jumpDown: {
        start: 41,
        end: 50,
        _: null
    },
    jumping: {
        start: 51,
        end: 70,
        _: null
    },
    stand: {
        start: 71,
        end: 110,
        _: null
    },
    attackLight: {
        start: 111,
        end: 130,
        _: null
    },
    attackMedium: {
        start: 131,
        end: 160,
        _: null
    },
    attackWeighty: {
        start: 161,
        end: 200,
        _: null
    },
    attackLightJump: {
        start: 201,
        end: 220,
        _: null
    },
    attackMediumJump: {
        start: 221,
        end: 260,
        _: null
    },
    attackWeightyJump: {
        start: 261,
        end: 320,
        _: null
    },
    crouch: {
        start: 321,
        end: 340,
        _: null
    },
    squat: {
        start: 341,
        end: 400,
        _: null
    },
    attackLightSquat: {
        start: 401,
        end: 440,
        _: null
    },
    attackMediumSquat: {
        start: 441,
        end: 480,
        _: null
    },
    attackWeightySquat: {
        start: 481,
        end: 540,
        _: null
    },
    attackFall: {
        start: 541,
        end: 560,
        _: null
    },
    fallToStand: {
        start: 561,
        end: 590,
        _: null
    }
}


export let url = URL.createObjectURL(new Blob([fs.readFileSync(__dirname + '../../../file/slime/slime.glb')]))

export class Actor {
    constructor() {

    }
    static action() {
        return {
            normal: {
                stand: [{
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
                }],
                jump: [{
                        start: 401,
                        end: 410,
                        atk: 0
                    },
                    {
                        start: 411,
                        end: 430,
                        atk: 0
                    },
                    {
                        start: 431,
                        end: 440,
                        atk: 0
                    }
                ],
                squat: [{
                        start: 351,
                        end: 370,
                        atk: 0
                    },
                    {},
                    {},
                ],
                attackFall: [{}, {}]
            },
            attack: {
                stand: {
                    small: [{
                        start: 101,
                        end: 109,
                        atk: 100
                    }, {
                        start: 109,
                        end: 119,
                        atk: 0
                    }, {
                        start: 119,
                        end: 130,
                        atk: 0
                    }],
                    medium: [{
                        start: 131,
                        end: 150,
                        atk: 200
                    }, {
                        start: 150,
                        end: 160,
                        atk: 0
                    }, {
                        start: 160,
                        end: 170,
                        atk: 0
                    }],
                    large: [{
                        start: 171,
                        end: 197,
                        atk: 300
                    }, {
                        start: 197,
                        end: 207,
                        atk: 0
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
                        atk: 150
                    }, {
                        start: 450,
                        end: 460,
                        atk: 0
                    }, {
                        start: 460,
                        end: 470,
                        atk: 0
                    }],
                    medium: [{
                        start: 471,
                        end: 493,
                        atk: 240
                    }, {
                        start: 493,
                        end: 510,
                        atk: 0
                    }],
                    large: [{
                        start: 511,
                        end: 555,
                        atk: 500
                    }, {
                        start: 555,
                        end: 570,
                        atk: 0
                    }],
                    fall: [{
                        start: 571,
                        end: 580,
                        atk: 50
                    }, {
                        start: 581,
                        end: 600,
                        atk: 50
                    }, {
                        start: 601,
                        end: 630,
                        atk: 0
                    }]
                },
                squat: {
                    small: [{}, {}, {}],
                    medium: [{}, {}, {}],
                    large: [{}, {}, {}]
                }
            },
            defense: {
                stand: [{
                    start: 221,
                    end: 230,
                    atk: 0
                }, {
                    start: 231,
                    end: 240,
                    atk: 0
                }],
                jump: [{
                    start: 631,
                    end: 640,
                    atk: 0
                }, {
                    start: 640,
                    end: 650,
                    atk: 0
                }],
                squat: [{

                }]
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
                    small: [{}, {}, {}],
                    medium: [{}, {}, {}],
                    large: [{}, {}, {}]
                }
            }
        }
    }
    static url() {
        return URL.createObjectURL(new Blob([fs.readFileSync(__dirname + '../../../file/slime/slime.glb')]))
    }
    static fps() {
        return this._fps || 60
    }
}