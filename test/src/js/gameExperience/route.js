export default {
    "gameExperience" : {
        view : (get) => {
            return new Promise((resolve, reject)=>{
                require.ensure([], require => {
                    get(require("./view/gameExperienceView").default, resolve, reject);
                },'gameExperienceView');
            });
        }
    }
}
