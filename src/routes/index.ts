const fs = require('fs');
const path_module = require('path');
const isEmpty = require('lodash/isEmpty');

export const getRoutes = async (routePath = <any> null) => {
    // return new Promise( async (resolve) => {
        let routes = <any> [];
        routePath = routePath || __dirname;
        let testA = await fs.readdirSync(routePath).map(async (file)=>{
            if(fs.lstatSync(routePath+"/"+file).isDirectory()){
                return await getRoutes(routePath+"/"+file);
            }else if (!(/(index)\.(js|ts)/).test(file)) {
                let importedRoutes = require(path_module.join(routePath, file)).default;
                if (!isEmpty(importedRoutes)) {
                    return importedRoutes;
                }
            }
        });

        let textB = await Promise.all(testA);
        textB.forEach((value)=>{
            if(value){
                routes = routes.concat(value);
            }
        });
        return routes;

        // resolve();
    // });
};

export default getRoutes;
