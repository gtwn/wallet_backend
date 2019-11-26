let BASE_URL = {
    USER: process.env.API_USER,
};


export default {
    USER: {
        PROFILE: BASE_URL.USER+"/client/v1/profile",
	TOKEN_VALIDATE: BASE_URL.USER+"/util/v1/token/validate",
    }
}
