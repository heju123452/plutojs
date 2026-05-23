import {Controller,Component,Router} from "~/js/main";

export default class NavController extends Controller{
    constructor(component : Component) {
        super(component);
    }

    goLink(routeName, e){
        let mainRoute = <Router>this.viewState.getComponentById("mainRoute");
        mainRoute.changeRoute(routeName);
    }
}