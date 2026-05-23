import {Controller,Component,Rect} from "~/js/main";

type Action = {
    name : string,
    width : number,
    height : number,
    backgroundImage : string,
    backgroundImages : Array<any>,
    backgroundImagesInterval : number,
    offsetX? : number,
    offsetY? : number,
    bodyWidth? : number,
    bodyHeight? : number
};

type MonsterState = {
    component : Component,
    hp : number,
    attackCd : number,
    xSpeed : number,
    ySpeed : number,
    onGround : boolean,
    electricTime : number
};

const heroAction : {[key : string] : Action} = {
    stay : {
        name : "stay",
        width : 24,
        height : 56,
        bodyWidth : 24,
        bodyHeight : 56,
        backgroundImage : "/images/sprite/hero-stay.png",
        backgroundImages : [
            {clip : [0,0,24,56]},
            {clip : [192,0,24,56]},
            {clip : [384,0,24,56]},
            {clip : [576,0,24,56]}
        ],
        backgroundImagesInterval : 400
    },
    run : {
        name : "run",
        width : 48,
        height : 48,
        bodyWidth : 32,
        bodyHeight : 48,
        offsetX : 12,
        backgroundImage : "/images/sprite/hero-run.png",
        backgroundImages : [
            {clip : [0,0,44,48]},
            {clip : [192,0,48,48]},
            {clip : [384,0,48,48]},
            {clip : [576,0,48,48]},
            {clip : [768,0,48,48]},
            {clip : [0,192,48,48]},
            {clip : [192,192,48,48]},
            {clip : [384,192,48,48]}
        ],
        backgroundImagesInterval : 120
    },
    attack : {
        name : "attack",
        width : 96,
        height : 64,
        bodyWidth : 32,
        bodyHeight : 56,
        offsetX : 30,
        offsetY : 12,
        backgroundImage : "/images/sprite/hero-attack.png",
        backgroundImages : [
            {clip : [0,0,96,64]},
            {clip : [192,0,96,64]},
            {clip : [384,0,96,64]},
            {clip : [576,0,96,64]},
            {clip : [768,0,96,64]}
        ],
        backgroundImagesInterval : 150
    },
    defense : {
        name : "defense",
        width : 54,
        height : 58,
        bodyWidth : 32,
        bodyHeight : 56,
        offsetX : 14,
        offsetY : 8,
        backgroundImage : "/images/sprite/hero-defense.png",
        backgroundImages : [
            {clip : [0,0,54,58]},
            {clip : [192,0,54,58]},
            {clip : [384,0,54,58]},
            {clip : [576,0,54,58]}
        ],
        backgroundImagesInterval : 160
    },
    qianniaoliu : {
        name : "qianniaoliu",
        width : 192,
        height : 192,
        bodyWidth : 32,
        bodyHeight : 56,
        offsetX : 84,
        offsetY : 116,
        backgroundImage : "/images/sprite/hero-qianniaoliu.png",
        backgroundImages : [
            {clip : [0,0,192,192]},
            {clip : [192,0,192,192]},
            {clip : [384,0,192,192]},
            {clip : [576,0,192,192]},
            {clip : [768,0,192,192]},
            {clip : [0,192,192,192]},
            {clip : [192,192,192,192]},
            {clip : [384,192,192,192]},
            {clip : [576,192,192,192]},
            {clip : [768,192,192,192]},
            {clip : [0,384,192,192]},
            {clip : [192,384,192,192]},
            {clip : [384,384,192,192]},
            {clip : [576,384,192,192]},
            {clip : [768,384,192,192]}
        ],
        backgroundImagesInterval : 80
    }
};

export default class GameExperienceController extends Controller{
    private viewport : Component;
    private map : Component;
    private hero : Component;
    private hud : Component;
    private keys : {[key : number] : boolean};
    private monsters : Array<MonsterState>;
    private timer : number;
    private spawnTimer : number;
    private heroHp : number;
    private score : number;
    private facing : number;
    private attacking : boolean;
    private skillCd : number;
    private heroYSpeed : number;
    private heroOnGround : boolean;
    private gravity : number;
    private currentAction : Action;
    private skillDuration : number;
    private skillDamageInterval : number;

    constructor(component : Component) {
        super(component);
        this.keys = {};
        this.monsters = [];
        this.heroHp = 100;
        this.score = 0;
        this.facing = 1;
        this.attacking = false;
        this.skillCd = 0;
        this.heroYSpeed = 0;
        this.heroOnGround = false;
        this.gravity = 0.55;
        this.currentAction = undefined;
        this.skillDuration = 0;
        this.skillDamageInterval = 0;

        this.registerEvent("$onViewLoaded", ()=>{
            this.viewport = this.component.getComponentByName("mapViewport");
            this.map = this.component.getComponentByName("battleMap");
            this.hero = this.component.getComponentByName("gameHero");
            this.hud = this.component.getComponentByName("gameHud");
            this.hero.setX(80);
            this.hero.setY(420);
            this.setHeroStayAction();
            this.bindControl();
            this.spawnMonsters(5);
            this.updateCamera();
            this.updateHud();
            this.timer = window.setInterval(()=>{
                this.updateGame();
            }, 30);
            this.spawnTimer = window.setInterval(()=>{
                if (this.monsters.length < 10)
                {
                    this.spawnMonsters(1);
                }
            }, 2400);
        });
    }

    private bindControl(){
        let keydown = (e)=>{
            this.keys[e.keyCode] = true;
            if (e.keyCode === 74)
            {
                this.attack();
            }
            if (e.keyCode === 75)
            {
                this.castSkill();
            }
        };
        let keyup = (e)=>{
            this.keys[e.keyCode] = false;
        };
        this.viewport.registerEvent("keydown", keydown);
        this.viewport.registerEvent("keyup", keyup);
        this.map.registerEvent("keydown", keydown);
        this.map.registerEvent("keyup", keyup);
    }

    private spawnMonsters(count : number){
        for (let i = 0; i < count; i++)
        {
            let monster = new Rect(this.map);
            let position = this.getRandomMonsterPosition();
            monster.initCfg({
                type : "rect",
                name : "monster",
                style : {
                    x : position.x,
                    y : position.y,
                    width : 34,
                    height : 34,
                    backgroundColor : "#9f3650",
                    borderWidth : 2,
                    borderColor : "#ffc0cb",
                    borderRadius : 8,
                    zIndex : 20
                }
            });
            this.map.appendChild(monster);
            this.monsters.push({
                component : monster,
                hp : 40,
                attackCd : 0,
                xSpeed : 0,
                ySpeed : 0,
                onGround : false,
                electricTime : 0
            });
        }
    }

    private getRandomMonsterPosition(){
        let point;
        let mapWidth = this.getMapPixelWidth();
        do {
            let col = 8 + Math.floor(Math.random() * 65);
            point = {
                x : Math.min(mapWidth - 90, col * this.getTileSize()),
                y : 40
            };
            point.y = this.findGroundY(point.x, 34);
        } while (this.getDistance(point.x, point.y, this.hero.getX(), this.hero.getY()) < 260);
        return point;
    }

    private updateGame(){
        if (this.heroHp <= 0)
        {
            return;
        }
        this.updateHeroMove();
        this.updateSkill();
        this.updateMonsters();
        this.updateCamera();
        if (this.skillCd > 0)
        {
            this.skillCd--;
        }
        this.updateHud();
    }

    private updateHeroMove(){
        let speed = 5;
        let dx = 0;
        if (this.keys[65] || this.keys[37])
        {
            dx -= speed;
            this.facing = -1;
        }
        if (this.keys[68] || this.keys[39])
        {
            dx += speed;
            this.facing = 1;
        }
        if ((this.keys[87] || this.keys[38]) && this.heroOnGround)
        {
            this.heroYSpeed = -11;
            this.heroOnGround = false;
        }
        if (dx !== 0)
        {
            this.hero.setStyle("mirror", this.facing < 0 ? "horizontal" : undefined);
            if (!this.attacking)
            {
                this.setHeroRunAction();
            }
        }
        else if (!this.attacking)
        {
            this.setHeroStayAction();
        }
        if (this.heroOnGround && this.heroYSpeed === 0 && this.isStandingOnGround())
        {
            if (dx !== 0)
            {
                this.moveHeroXOnGround(dx);
            }
            this.snapHeroToGround();
        }
        else
        {
            this.heroYSpeed = Math.min(13, this.heroYSpeed + this.gravity);
            this.moveWithMapCollision(this.hero, dx, this.heroYSpeed, true);
        }
    }

    private updateMonsters(){
        this.monsters.forEach((monster)=>{
            if (monster.electricTime > 0)
            {
                monster.xSpeed = 0;
            }
            else
            {
                let mx = monster.component.getX() + monster.component.getWidth() / 2;
                let hx = this.hero.getX() + this.hero.getWidth() / 2;
                let distanceX = hx - mx;
                monster.xSpeed = Math.max(-2, Math.min(2, distanceX * 0.02));
            }
            monster.ySpeed = Math.min(12, monster.ySpeed + this.gravity);
            this.moveMonster(monster);
            if (monster.attackCd > 0)
            {
                monster.attackCd--;
            }
            if (monster.electricTime > 0)
            {
                monster.electricTime--;
                if (monster.electricTime % 4 < 2)
                {
                    monster.component.setStyle({
                        backgroundColor : "#d8fbff",
                        borderColor : "#2be7ff"
                    });
                }
                else
                {
                    monster.component.setStyle({
                        backgroundColor : "#5bd7ff",
                        borderColor : "#ffffff"
                    });
                }
                if (monster.electricTime <= 0 && monster.hp > 0)
                {
                    monster.component.setStyle({
                        backgroundColor : "#9f3650",
                        borderColor : "#ffc0cb",
                        borderWidth : 2
                    });
                }
            }
            if (this.isHit(monster.component, this.hero) && monster.attackCd <= 0)
            {
                this.heroHp = Math.max(0, this.heroHp - 6);
                monster.attackCd = 28;
                this.flashHero();
            }
        });
    }

    private moveHeroXOnGround(dx : number){
        let body = this.getBodyRect(this.hero, true);
        let maxX = this.getMapPixelWidth() - body.width;
        let nextBodyX = Math.max(0, Math.min(maxX, body.x + dx));
        if (!this.isBlockedRect(nextBodyX, body.y, body.width, body.height))
        {
            this.hero.setX(this.getComponentXByBodyX(nextBodyX, true));
        }
    }

    private moveWithMapCollision(component : Component, dx : number, dy : number, isHero : boolean){
        let body = this.getBodyRect(component, isHero);
        let maxX = this.getMapPixelWidth() - body.width;
        let nextBodyX = Math.max(0, Math.min(maxX, body.x + dx));
        if (!this.isBlockedRect(nextBodyX, body.y, body.width, body.height))
        {
            component.setX(this.getComponentXByBodyX(nextBodyX, isHero));
        }
        body = this.getBodyRect(component, isHero);
        let nextBodyY = body.y + dy;
        if (!this.isBlockedRect(body.x, nextBodyY, body.width, body.height))
        {
            component.setY(this.getComponentYByBodyY(nextBodyY, isHero));
            if (isHero && dy !== 0)
            {
                this.heroOnGround = false;
            }
        }
        else
        {
            if (dy > 0)
            {
                let groundBodyY = Math.floor((body.y + body.height) / this.getTileSize()) * this.getTileSize() - body.height;
                component.setY(this.getComponentYByBodyY(groundBodyY, isHero));
                if (isHero)
                {
                    this.heroOnGround = true;
                    this.heroYSpeed = 0;
                }
            }
            else if (dy < 0)
            {
                if (isHero)
                {
                    this.heroYSpeed = 0;
                }
            }
        }
        if (component.getY() > this.getMapPixelHeight() + 160)
        {
            component.setX(80);
            component.setY(420);
            if (isHero)
            {
                this.heroHp = Math.max(0, this.heroHp - 20);
                this.heroYSpeed = 0;
            }
        }
    }

    private moveMonster(monster : MonsterState){
        let component = monster.component;
        if (monster.electricTime <= 0)
        {
            let maxX = this.getMapPixelWidth() - component.getWidth();
            let nextX = Math.max(0, Math.min(maxX, component.getX() + monster.xSpeed));
            if (!this.isBlockedRect(nextX, component.getY(), component.getWidth(), component.getHeight()))
            {
                component.setX(nextX);
            }
            else if (monster.onGround)
            {
                monster.ySpeed = -8;
            }
        }
        let nextY = component.getY() + monster.ySpeed;
        if (!this.isBlockedRect(component.getX(), nextY, component.getWidth(), component.getHeight()))
        {
            component.setY(nextY);
            monster.onGround = false;
        }
        else
        {
            if (monster.ySpeed > 0)
            {
                component.setY(Math.floor((component.getY() + component.getHeight()) / this.getTileSize()) * this.getTileSize() - component.getHeight());
                monster.onGround = true;
                monster.ySpeed = 0;
            }
            else if (monster.ySpeed < 0)
            {
                monster.ySpeed = 0;
            }
        }
        if (component.getY() > this.getMapPixelHeight() + 120)
        {
            let point = this.getRandomMonsterPosition();
            component.setX(point.x);
            component.setY(point.y);
            monster.ySpeed = 0;
        }
    }

    private attack(){
        if (this.attacking || this.heroHp <= 0)
        {
            return;
        }
        this.attacking = true;
        this.setHeroAction(heroAction.attack, true);
        let body = this.getBodyRect(this.hero, true);
        let range = {
            x : this.facing > 0 ? body.x : body.x - 70,
            y : body.y - 18,
            width : body.width + 86,
            height : body.height + 34
        };
        this.damageMonsters(range, 25);
        window.setTimeout(()=>{
            this.attacking = false;
        }, 520);
    }

    private castSkill(){
        if (this.skillCd > 0 || this.attacking || this.heroHp <= 0)
        {
            return;
        }
        this.skillCd = 110;
        this.skillDuration = 46;
        this.skillDamageInterval = 0;
        this.attacking = true;
        this.setHeroAction(heroAction.qianniaoliu, true);
    }

    private updateSkill(){
        if (this.skillDuration <= 0)
        {
            return;
        }
        this.skillDuration--;
        this.skillDamageInterval--;
        if (this.skillDamageInterval <= 0)
        {
            let body = this.getBodyRect(this.hero, true);
            this.damageMonsters({
                x : body.x - 150,
                y : body.y - 125,
                width : body.width + 300,
                height : body.height + 250
            }, 12, true);
            this.skillDamageInterval = 8;
        }
        if (this.skillDuration <= 0)
        {
            this.attacking = false;
            if (this.heroHp > 0)
            {
                this.setHeroStayAction();
            }
        }
    }

    private damageMonsters(range : any, damage : number, electric? : boolean){
        let killed : Array<MonsterState> = [];
        this.monsters.forEach((monster)=>{
            if (this.isRectHit(range, {
                x : monster.component.getX(),
                y : monster.component.getY(),
                width : monster.component.getWidth(),
                height : monster.component.getHeight()
            }))
            {
                monster.hp -= damage;
                if (electric)
                {
                    monster.electricTime = 14;
                    monster.ySpeed = Math.min(monster.ySpeed, -2);
                    monster.component.setStyle({
                        backgroundColor : "#8ee7ff",
                        borderColor : "#ffffff",
                        borderWidth : 4
                    });
                }
                else
                {
                    monster.component.setStyle("backgroundColor", "#f6d365");
                    window.setTimeout(()=>{
                        if (monster.hp > 0 && monster.electricTime <= 0)
                        {
                            monster.component.setStyle("backgroundColor", "#9f3650");
                        }
                    }, 120);
                }
                if (monster.hp <= 0)
                {
                    killed.push(monster);
                }
            }
        });
        killed.forEach((monster)=>{
            this.map.removeChild(monster.component);
            this.monsters.splice(this.monsters.indexOf(monster), 1);
            this.score += 10;
        });
    }

    private flashHero(){
        this.setHeroAction(heroAction.defense);
        window.setTimeout(()=>{
            if (!this.attacking && this.heroHp > 0)
            {
                this.setHeroStayAction();
            }
        }, 180);
    }

    private setHeroRunAction(){
        if (this.currentAction && this.currentAction.name === heroAction.run.name)
        {
            return;
        }
        let oldAction = this.currentAction || heroAction.stay;
        if (oldAction.name !== heroAction.stay.name)
        {
            this.setBaseHeroAction(heroAction.run);
            return;
        }
        this.currentAction = heroAction.run;
        this.hero.setStyle({
            width : heroAction.run.width,
            height : heroAction.run.height,
            backgroundImage : heroAction.run.backgroundImage,
            backgroundImages : heroAction.run.backgroundImages,
            backgroundImagesInterval : heroAction.run.backgroundImagesInterval
        });
        if (this.heroOnGround)
        {
            this.hero.setY(this.hero.getY() + (heroAction.stay.height - heroAction.run.height));
        }
    }

    private setHeroStayAction(){
        if (this.currentAction && this.currentAction.name === heroAction.stay.name)
        {
            return;
        }
        let oldAction = this.currentAction || heroAction.stay;
        if (oldAction.name !== heroAction.run.name)
        {
            this.setBaseHeroAction(heroAction.stay);
            return;
        }
        this.currentAction = heroAction.stay;
        this.hero.setStyle({
            width : heroAction.stay.width,
            height : heroAction.stay.height,
            backgroundImage : heroAction.stay.backgroundImage,
            backgroundImages : heroAction.stay.backgroundImages,
            backgroundImagesInterval : heroAction.stay.backgroundImagesInterval
        });
        if (this.heroOnGround)
        {
            this.hero.setY(this.hero.getY() - (heroAction.stay.height - heroAction.run.height));
        }
    }

    private setBaseHeroAction(action : Action){
        let body = this.getBodyRect(this.hero, true);
        let bodyBottom = body.y + body.height;
        this.currentAction = action;
        this.hero.setStyle({
            width : action.width,
            height : action.height,
            backgroundImage : action.backgroundImage,
            backgroundImages : action.backgroundImages,
            backgroundImagesInterval : action.backgroundImagesInterval
        });
        this.hero.setX(body.x - (action.offsetX || 0));
        this.hero.setY(bodyBottom - (action.bodyHeight || action.height) - (action.offsetY || 0));
    }

    private setHeroAction(action : Action, force? : boolean){
        if (!force && this.currentAction && this.currentAction.name === action.name)
        {
            return;
        }
        let body = this.getBodyRect(this.hero, true);
        let bodyBottom = body.y + body.height;
        let keepBodyBottom = action.name !== heroAction.stay.name && action.name !== heroAction.run.name;
        this.currentAction = action;
        this.hero.setStyle({
            width : action.width,
            height : action.height,
            backgroundImage : action.backgroundImage,
            backgroundImages : action.backgroundImages,
            backgroundImagesInterval : action.backgroundImagesInterval
        });
        this.hero.setX(body.x - (action.offsetX || 0));
        if (keepBodyBottom)
        {
            this.hero.setY(bodyBottom - (action.bodyHeight || action.height) - (action.offsetY || 0));
        }
    }

    private updateCamera(){
        if (!this.viewport || !this.map)
        {
            return;
        }
        let body = this.getBodyRect(this.hero, true);
        let targetX = this.viewport.getWidth() / 2 - body.x - body.width / 2;
        let minX = this.viewport.getWidth() - this.getMapPixelWidth();
        targetX = Math.min(0, Math.max(minX, targetX));
        this.map.setX(targetX);
    }

    private updateHud(){
        if (!this.hud)
        {
            return;
        }
        let skillText = this.skillDuration > 0 ? "释放中" : (this.skillCd > 0 ? "冷却中" : "可释放");
        let hpText = this.heroHp > 0 ? this.heroHp : 0;
        this.hud.setText("生命：" + hpText + "  分数：" + this.score + "  小怪：" + this.monsters.length + "  千鸟流：" + skillText);
        if (this.heroHp <= 0)
        {
            this.hud.setText("生命：0  分数：" + this.score + "  游戏结束，刷新页面重新开始");
        }
    }

    private isStandingOnGround(){
        let body = this.getBodyRect(this.hero, true);
        return this.isBlockedRect(body.x, body.y + body.height + 1, body.width, 1);
    }

    private snapHeroToGround(){
        let body = this.getBodyRect(this.hero, true);
        let tileSize = this.getTileSize();
        let groundBodyY = Math.floor((body.y + body.height + 1) / tileSize) * tileSize - body.height;
        let nextY = this.getComponentYByBodyY(groundBodyY, true);
        if (Math.abs(this.hero.getY() - nextY) <= 2)
        {
            this.hero.setY(nextY);
        }
    }

    private getBodyRect(component : Component, isHero : boolean){
        if (!isHero || !this.currentAction)
        {
            return {
                x : component.getX(),
                y : component.getY(),
                width : component.getWidth(),
                height : component.getHeight()
            };
        }
        return {
            x : component.getX() + (this.currentAction.offsetX || 0),
            y : component.getY() + (this.currentAction.offsetY || 0),
            width : this.currentAction.bodyWidth || component.getWidth(),
            height : this.currentAction.bodyHeight || component.getHeight()
        };
    }

    private getComponentXByBodyX(bodyX : number, isHero : boolean){
        if (!isHero || !this.currentAction)
        {
            return bodyX;
        }
        return bodyX - (this.currentAction.offsetX || 0);
    }

    private getComponentYByBodyY(bodyY : number, isHero : boolean){
        if (!isHero || !this.currentAction)
        {
            return bodyY;
        }
        return bodyY - (this.currentAction.offsetY || 0);
    }

    private isBlockedRect(x : number, y : number, width : number, height : number){
        let tileSize = this.getTileSize();
        let mapData = (<any>this.map).mapData;
        if (!mapData)
        {
            return false;
        }
        let left = Math.max(0, Math.floor(x / tileSize));
        let right = Math.min((<any>this.map).mapWidth - 1, Math.floor((x + width - 1) / tileSize));
        let top = Math.max(0, Math.floor(y / tileSize));
        let bottom = Math.min((<any>this.map).mapHeight - 1, Math.floor((y + height - 1) / tileSize));
        for (let row = top; row <= bottom; row++)
        {
            for (let col = left; col <= right; col++)
            {
                if (mapData[row] && mapData[row][col] && mapData[row][col].block)
                {
                    return true;
                }
            }
        }
        return false;
    }

    private findGroundY(x : number, height : number){
        let tileSize = this.getTileSize();
        let mapData = (<any>this.map).mapData;
        let col = Math.floor(x / tileSize);
        for (let row = 0; row < (<any>this.map).mapHeight; row++)
        {
            if (mapData[row] && mapData[row][col] && mapData[row][col].block)
            {
                return row * tileSize - height;
            }
        }
        return 420;
    }

    private getTileSize(){
        return (<any>this.map).mapSize || 32;
    }

    private getMapPixelWidth(){
        return ((<any>this.map).mapWidth || 80) * this.getTileSize();
    }

    private getMapPixelHeight(){
        return ((<any>this.map).mapHeight || 18) * this.getTileSize();
    }

    private isHit(a : Component, b : Component){
        return this.isRectHit({
            x : a.getX(),
            y : a.getY(),
            width : a.getWidth(),
            height : a.getHeight()
        }, this.getBodyRect(b, b === this.hero));
    }

    private isRectHit(a : any, b : any){
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }

    private getDistance(x1 : number, y1 : number, x2 : number, y2 : number){
        let x = x1 - x2;
        let y = y1 - y2;
        return Math.sqrt(x * x + y * y);
    }
}
