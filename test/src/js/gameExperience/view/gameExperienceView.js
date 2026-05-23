import GameExperienceController from "../controller/gameExperienceController";
import {topView,topHeight} from "@/js/common/view/top/topView";

export default {
    controller : GameExperienceController,
    type : "rect",
    style : {
        x : 0,
        y : 0,
        width : "100%",
        height : "100%",
        backgroundColor : "#101725"
    },
    children : [
        topView(),
        {
            type : "rect",
            name : "gameContent",
            style : {
                x : 0,
                y : topHeight,
                width : "100%",
                height : function(){
                    return this.parent.getHeight() - topHeight;
                },
                backgroundColor : "#101725"
            },
            children : [
                {
                    type : "rect",
                    name : "mapViewport",
                    hasClip : true,
                    style : {
                        x : function(){
                            return this.parent.getWidth() / 2 - this.getWidth() / 2;
                        },
                        y : 18,
                        width : 960,
                        height : 576,
                        backgroundColor : "#6ab7ff",
                        borderWidth : 3,
                        borderColor : "#5c759e"
                    },
                    children : [
                        {
                            type : "map",
                            name : "battleMap",
                            style : {
                                x : 0,
                                y : 0,
                                backgroundColor : "#6ab7ff"
                            },
                            mapDataUrl : "/gameExperience/maps/marioBattle.map",
                            terrainPolicy : {
                                "block" : {
                                    backgroundColor : "#8b5a2b",
                                    borderWidth : 1,
                                    borderColor : "#5b3519"
                                },
                                1 : {
                                    backgroundColor : "#58a341",
                                    borderWidth : 1,
                                    borderColor : "#2f6b25"
                                },
                                2 : {
                                    backgroundColor : "#c47b3d",
                                    borderWidth : 1,
                                    borderColor : "#824516"
                                },
                                3 : {
                                    backgroundColor : "#3dbf55",
                                    borderWidth : 1,
                                    borderColor : "#1d7c30"
                                }
                            },
                            children : [
                                {
                                    name : "gameHero",
                                    type : "sprite",
                                    style : {
                                        x : 80,
                                        y : 420,
                                        width : 24,
                                        height : 56,
                                        zIndex : 30,
                                        backgroundImage : "/images/sprite/hero-stay.png",
                                        backgroundImages : [
                                            {clip : [0,0,24,56]},
                                            {clip : [192,0,24,56]},
                                            {clip : [384,0,24,56]},
                                            {clip : [576,0,24,56]}
                                        ],
                                        backgroundImagesInterval : 400
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    type : "rect",
                    name : "gameTips",
                    style : {
                        x : function(){
                            let map = this.parent.getComponentByName("mapViewport");
                            return map.getX();
                        },
                        y : 610,
                        width : 960,
                        height : 40,
                        fontSize : "16px",
                        fontColor : "#d8e8ff"
                    },
                    text : "WASD / 方向键移动，J 普通攻击，K 千鸟流范围攻击。击败随机出现的小怪获得分数。"
                },
                {
                    type : "rect",
                    name : "gameHud",
                    style : {
                        x : function(){
                            let map = this.parent.getComponentByName("mapViewport");
                            return map.getX();
                        },
                        y : 650,
                        width : 960,
                        height : 34,
                        fontSize : "18px",
                        fontColor : "#ffe7a3"
                    },
                    text : "生命：100  分数：0  小怪：0"
                }
            ]
        }
    ]
};
