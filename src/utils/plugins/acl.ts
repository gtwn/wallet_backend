exports.plugin = {
    pkg: require('../../../package.json'),
    register: async function (server, options) {
        server.ext('onCredentials', function (request, h) {
            let {plugins} = request.route.settings;
            if(plugins && plugins.permissions){
                let {permissions} = plugins;
                let canAccess = true;
                let permissionFail = null;
                Object.keys(permissions).map((key)=>{
                    if(request.user.permissions[key].action !== permissions[key]){
                        canAccess = false;
                        permissionFail = <any>key;
                    }
                });

                if(!canAccess){
                    return h.response({
                        statusCode: 401,
                        error: "Unauthorized",
                        message: request.i18n.__("You do not have access to this information"),
                        payload: {
                            permission: permissionFail
                        }
                    }).code(500).takeover();
                }
            }
            return h.continue;
        });
    }
};