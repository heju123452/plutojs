import {Controller,Component,Router} from "~/js/main";

export default class TopController extends Controller{
    constructor(component : Component) {
        super(component);
    }

    goHome(){
        let mainRoute = <Router>this.viewState.getComponentById("mainRoute");
        mainRoute.changeRoute("nav");
    }
}